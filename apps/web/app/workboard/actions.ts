"use server";

import { revalidatePath } from "next/cache";
import {
  getCurrentProfile,
  isMissingTableError,
  requireOrganizationId,
} from "@/lib/auth/bootstrap";
import { rowToMember, rowToTask, type WorkboardTaskRow } from "@/lib/workboard/mapper";
import { getNextPosition } from "@/lib/workboard/group-tasks";
import {
  buildMemberTimeReports,
  type TimeByMemberRow,
} from "@/lib/workboard/time-report";
import { rowToSprint, type SprintRow } from "@/lib/workboard/sprint";
import { createClient } from "@/lib/supabase/server";
import {
  assignTaskToLaunchSchema,
  assignTaskToSprintSchema,
  createSprintSchema,
  createWorkboardTaskSchema,
  firstZodError,
  logTaskTimeSchema,
  moveWorkboardTaskSchema,
  setMemberHourlyRateSchema,
  updateSprintPatchSchema,
  updateWorkboardTaskSchema,
  uuidSchema,
} from "@/lib/validations";
import { paths } from "@/routes/paths";
import { loadTaskLinksBundle, deleteTaskAttachmentsForTask, getWorkboardTaskByIdAction } from "./task-link-actions";
import type {
  MemberTimeReport,
  WorkboardMember,
  WorkboardSprint,
  WorkboardTask,
} from "@/types/workboard";

function revalidateWorkboard() {
  revalidatePath(paths.platform.workboard.root);
}

export async function listWorkboardMembersAction(): Promise<WorkboardMember[]> {
  const organizationId = await requireOrganizationId();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, email, role")
    .eq("organization_id", organizationId)
    .order("full_name", { ascending: true });

  if (error) {
    if (isMissingTableError(error.message)) return [];
    throw new Error(error.message);
  }

  return (data ?? []).map(rowToMember);
}

export async function listWorkboardTasksAction(): Promise<WorkboardTask[]> {
  const organizationId = await requireOrganizationId();
  const supabase = await createClient();

  const members = await listWorkboardMembersAction();
  const memberMap = new Map(members.map((m) => [m.id, m]));
  const links = await loadTaskLinksBundle(organizationId);

  const { data, error } = await supabase
    .from("workboard_tasks")
    .select("*")
    .eq("organization_id", organizationId)
    .order("status")
    .order("position", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    if (isMissingTableError(error.message)) return [];
    throw new Error(error.message);
  }

  return ((data ?? []) as WorkboardTaskRow[]).map((row) =>
    rowToTask(row, memberMap, links)
  );
}

export async function loadWorkboardPageDataAction(): Promise<{
  tasks: WorkboardTask[];
  members: WorkboardMember[];
  sprints: WorkboardSprint[];
}> {
  const [tasks, members, sprints] = await Promise.all([
    listWorkboardTasksAction(),
    listWorkboardMembersAction(),
    getSprintsAction(),
  ]);
  return { tasks, members, sprints };
}

export async function createWorkboardTaskAction(
  input: unknown
): Promise<WorkboardTask> {
  const parsed = createWorkboardTaskSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(firstZodError(parsed.error));
  }

  const payload = parsed.data;
  const organizationId = await requireOrganizationId();
  const profile = await getCurrentProfile();
  const supabase = await createClient();

  const existing = await listWorkboardTasksAction();
  const position = getNextPosition(existing, payload.status);

  let sprintId = payload.sprintId;
  if (sprintId === undefined) {
    const active = await getActiveSprintAction();
    sprintId = active?.id ?? null;
  }

  const insertRow: Record<string, unknown> = {
      organization_id: organizationId,
      title: payload.title.trim(),
      description: payload.description?.trim() ?? "",
      status: payload.status,
      area: payload.area,
      priority: payload.priority,
      assignee_id: payload.assigneeId || null,
      due_date: payload.dueDate || null,
      tags: payload.tags ?? [],
      sprint_id: sprintId || null,
      launch_id: payload.launchId || null,
      position,
      created_by: profile?.id ?? null,
      updated_at: new Date().toISOString(),
    };

  if (payload.sopId) {
    insertRow.sop_id = payload.sopId;
  }

  const { data: row, error } = await supabase
    .from("workboard_tasks")
    .insert(insertRow)
    .select("*")
    .single();

  if (error) throw new Error(error.message);

  const taskId = row.id as string;

  if (payload.documentIds?.length) {
    const links = payload.documentIds.map((documentId) => ({
      task_id: taskId,
      document_id: documentId,
      organization_id: organizationId,
    }));
    const { error: linkError } = await supabase
      .from("workboard_task_documents")
      .upsert(links, { onConflict: "task_id,document_id", ignoreDuplicates: true });

    if (linkError && !isMissingTableError(linkError.message)) {
      console.error("[Workboard] link documents on create:", linkError.message);
    }
  }

  if (sprintId) {
    await refreshSprintCompletionForTask(supabase, organizationId, taskId);
  }
  revalidateWorkboard();
  const created = await getWorkboardTaskByIdAction(taskId);
  if (!created) throw new Error("No se pudo cargar la tarea creada");
  return created;
}

export async function moveWorkboardTaskAction(
  input: unknown
): Promise<void> {
  const parsed = moveWorkboardTaskSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(firstZodError(parsed.error));
  }

  const data = parsed.data;
  const organizationId = await requireOrganizationId();
  const supabase = await createClient();
  const existing = await listWorkboardTasksAction();
  const position = getNextPosition(
    existing.filter((t) => t.id !== data.taskId),
    data.status
  );

  const { error } = await supabase
    .from("workboard_tasks")
    .update({
      status: data.status,
      position,
      updated_at: new Date().toISOString(),
    })
    .eq("id", data.taskId)
    .eq("organization_id", organizationId);

  if (error) throw new Error(error.message);
  await refreshSprintCompletionForTask(supabase, organizationId, data.taskId);
  revalidateWorkboard();
}

export async function updateWorkboardTaskAction(
  input: unknown
): Promise<WorkboardTask> {
  const parsed = updateWorkboardTaskSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(firstZodError(parsed.error));
  }

  const { taskId, ...fields } = parsed.data;
  const organizationId = await requireOrganizationId();
  const supabase = await createClient();

  const patch: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (fields.title !== undefined) patch.title = fields.title.trim();
  if (fields.description !== undefined) patch.description = fields.description.trim();
  if (fields.status !== undefined) patch.status = fields.status;
  if (fields.area !== undefined) patch.area = fields.area;
  if (fields.priority !== undefined) patch.priority = fields.priority;
  if (fields.assigneeId !== undefined) patch.assignee_id = fields.assigneeId || null;
  if (fields.dueDate !== undefined) patch.due_date = fields.dueDate || null;
  if (fields.tags !== undefined) patch.tags = fields.tags;
  if (fields.launchId !== undefined) patch.launch_id = fields.launchId || null;
  if (fields.estimatedMinutes !== undefined) {
    patch.estimated_minutes = fields.estimatedMinutes;
  }

  if (fields.status !== undefined) {
    const existing = await listWorkboardTasksAction();
    patch.position = getNextPosition(
      existing.filter((t) => t.id !== taskId),
      fields.status
    );
  }

  const { data, error } = await supabase
    .from("workboard_tasks")
    .update(patch)
    .eq("id", taskId)
    .eq("organization_id", organizationId)
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  await refreshSprintCompletionForTask(supabase, organizationId, taskId);
  revalidateWorkboard();
  const members = await listWorkboardMembersAction();
  const memberMap = new Map(members.map((m) => [m.id, m]));
  const links = await loadTaskLinksBundle(organizationId);
  return rowToTask(data as WorkboardTaskRow, memberMap, links);
}

export async function deleteWorkboardTaskAction(taskId: unknown): Promise<void> {
  const parsed = uuidSchema.safeParse(taskId);
  if (!parsed.success) {
    throw new Error(firstZodError(parsed.error));
  }

  const organizationId = await requireOrganizationId();
  const supabase = await createClient();

  await deleteTaskAttachmentsForTask(organizationId, parsed.data);

  const { error } = await supabase
    .from("workboard_tasks")
    .delete()
    .eq("id", parsed.data)
    .eq("organization_id", organizationId);

  if (error) throw new Error(error.message);
  revalidateWorkboard();
}

type TaskTimeEntry = {
  logged_at: string;
  minutes: number;
  note?: string;
  logged_by: string;
};

export async function assignTaskToLaunchAction(
  taskId: string,
  launchId: string | null
): Promise<WorkboardTask> {
  const parsed = assignTaskToLaunchSchema.safeParse({ taskId, launchId });
  if (!parsed.success) {
    throw new Error(firstZodError(parsed.error));
  }

  const data = parsed.data;
  const organizationId = await requireOrganizationId();
  const supabase = await createClient();

  const { data: row, error } = await supabase
    .from("workboard_tasks")
    .update({
      launch_id: data.launchId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", data.taskId)
    .eq("organization_id", organizationId)
    .select("*")
    .single();

  if (error) throw new Error(error.message);

  revalidateWorkboard();
  revalidatePath(paths.platform.lanzamientos);

  const members = await listWorkboardMembersAction();
  const memberMap = new Map(members.map((m) => [m.id, m]));
  const links = await loadTaskLinksBundle(organizationId);
  return rowToTask(row as WorkboardTaskRow, memberMap, links);
}

export async function logTaskTimeAction(input: unknown): Promise<{ ok: true }> {
  const parsed = logTaskTimeSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(firstZodError(parsed.error));
  }

  const data = parsed.data;
  const organizationId = await requireOrganizationId();
  const profile = await getCurrentProfile();
  if (!profile) throw new Error("Sesión no válida");

  const supabase = await createClient();

  const { data: task, error: fetchError } = await supabase
    .from("workboard_tasks")
    .select("id, time_entries, organization_id, estimated_minutes")
    .eq("id", data.taskId)
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (fetchError) throw new Error(fetchError.message);
  if (!task) throw new Error("Tarea no encontrada");

  const currentEntries = (task.time_entries ?? []) as TaskTimeEntry[];
  const newEntry: TaskTimeEntry = {
    logged_at: new Date().toISOString(),
    minutes: data.actualMinutes,
    note: data.note ?? "",
    logged_by: profile.id,
  };

  const { error } = await supabase
    .from("workboard_tasks")
    .update({
      actual_minutes: data.actualMinutes,
      estimated_minutes:
        data.estimatedMinutes ?? task.estimated_minutes ?? null,
      time_entries: [...currentEntries, newEntry],
      timer_running: false,
      timer_started_at: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", data.taskId)
    .eq("organization_id", organizationId);

  if (error) throw new Error(error.message);

  revalidateWorkboard();
  return { ok: true };
}

export async function getTimeByMemberAction(): Promise<MemberTimeReport[] | null> {
  const organizationId = await requireOrganizationId();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("workboard_time_by_member")
    .select("*")
    .eq("organization_id", organizationId)
    .order("actual_minutes", { ascending: false });

  if (error) {
    if (isMissingTableError(error.message)) return null;
    throw new Error(error.message);
  }

  if (!data?.length) return null;

  return buildMemberTimeReports(data as TimeByMemberRow[]);
}

export async function setMemberHourlyRateAction(
  input: unknown
): Promise<{ ok: true }> {
  const parsed = setMemberHourlyRateSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(firstZodError(parsed.error));
  }

  const data = parsed.data;
  const profile = await getCurrentProfile();
  if (!profile) throw new Error("Sesión no válida");

  if (!["founder", "admin"].includes(profile.role)) {
    throw new Error("Sin permisos para configurar sueldos");
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({
      hourly_rate: data.hourlyRate,
      hourly_rate_currency: data.currency,
    })
    .eq("id", data.memberId)
    .eq("organization_id", profile.organization_id);

  if (error) throw new Error(error.message);
  revalidatePath(paths.platform.team.root);
  return { ok: true };
}

async function refreshSprintCompletionForTask(
  supabase: Awaited<ReturnType<typeof createClient>>,
  organizationId: string,
  taskId: string
): Promise<void> {
  const { data: task } = await supabase
    .from("workboard_tasks")
    .select("sprint_id")
    .eq("id", taskId)
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (task?.sprint_id) {
    await updateSprintCompletionInternal(supabase, organizationId, task.sprint_id);
  }
}

async function updateSprintCompletionInternal(
  supabase: Awaited<ReturnType<typeof createClient>>,
  organizationId: string,
  sprintId: string
): Promise<void> {
  const { data: tasks } = await supabase
    .from("workboard_tasks")
    .select("status")
    .eq("sprint_id", sprintId)
    .eq("organization_id", organizationId);

  if (!tasks?.length) return;

  const completed = tasks.filter((t) => t.status === "done").length;
  const rate = Math.round((completed / tasks.length) * 100);

  await supabase
    .from("sprints")
    .update({ completion_rate: rate, updated_at: new Date().toISOString() })
    .eq("id", sprintId)
    .eq("organization_id", organizationId);
}

export async function getActiveSprintAction(): Promise<WorkboardSprint | null> {
  const organizationId = await requireOrganizationId();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("sprints")
    .select("*")
    .eq("organization_id", organizationId)
    .eq("status", "active")
    .order("start_date", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    if (isMissingTableError(error.message)) return null;
    throw new Error(error.message);
  }

  if (!data) return null;

  const tasks = await listWorkboardTasksAction();
  return rowToSprint(data as SprintRow, tasks);
}

export async function getSprintsAction(): Promise<WorkboardSprint[]> {
  const organizationId = await requireOrganizationId();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("sprints")
    .select("*")
    .eq("organization_id", organizationId)
    .order("start_date", { ascending: false });

  if (error) {
    if (isMissingTableError(error.message)) return [];
    throw new Error(error.message);
  }

  const tasks = await listWorkboardTasksAction();
  return (data ?? []).map((row) => rowToSprint(row as SprintRow, tasks));
}

export async function createSprintAction(input: unknown): Promise<WorkboardSprint> {
  const parsed = createSprintSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(firstZodError(parsed.error));
  }

  const data = parsed.data;
  const organizationId = await requireOrganizationId();
  const profile = await getCurrentProfile();
  const supabase = await createClient();

  await supabase
    .from("sprints")
    .update({ status: "completed", updated_at: new Date().toISOString() })
    .eq("organization_id", organizationId)
    .eq("status", "active");

  const { data: sprint, error } = await supabase
    .from("sprints")
    .insert({
      organization_id: organizationId,
      name: data.name.trim(),
      goal: data.goal?.trim() || null,
      area_focus: data.areaFocus || null,
      start_date: data.startDate,
      end_date: data.endDate,
      status: "active",
      created_by: profile?.id ?? null,
    })
    .select("*")
    .single();

  if (error) throw new Error(error.message);

  revalidateWorkboard();
  return rowToSprint(sprint as SprintRow, []);
}

export async function updateSprintAction(
  sprintId: string,
  input: unknown
): Promise<{ ok: true }> {
  const idParsed = uuidSchema.safeParse(sprintId);
  if (!idParsed.success) {
    throw new Error(firstZodError(idParsed.error));
  }

  const parsed = updateSprintPatchSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(firstZodError(parsed.error));
  }

  const data = parsed.data;
  const organizationId = await requireOrganizationId();
  const supabase = await createClient();

  const patch: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (data.name !== undefined) patch.name = data.name.trim();
  if (data.goal !== undefined) patch.goal = data.goal.trim() || null;
  if (data.areaFocus !== undefined) patch.area_focus = data.areaFocus || null;
  if (data.startDate !== undefined) patch.start_date = data.startDate;
  if (data.endDate !== undefined) patch.end_date = data.endDate;
  if (data.status !== undefined) patch.status = data.status;

  const { error } = await supabase
    .from("sprints")
    .update(patch)
    .eq("id", idParsed.data)
    .eq("organization_id", organizationId);

  if (error) throw new Error(error.message);

  revalidateWorkboard();
  return { ok: true };
}

export async function assignTaskToSprintAction(
  taskId: string,
  sprintId: string | null
): Promise<WorkboardTask> {
  const parsed = assignTaskToSprintSchema.safeParse({ taskId, sprintId });
  if (!parsed.success) {
    throw new Error(firstZodError(parsed.error));
  }

  const data = parsed.data;
  const organizationId = await requireOrganizationId();
  const supabase = await createClient();

  const { data: row, error } = await supabase
    .from("workboard_tasks")
    .update({
      sprint_id: data.sprintId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", data.taskId)
    .eq("organization_id", organizationId)
    .select("*")
    .single();

  if (error) throw new Error(error.message);

  await refreshSprintCompletionForTask(supabase, organizationId, data.taskId);
  revalidateWorkboard();

  const members = await listWorkboardMembersAction();
  const memberMap = new Map(members.map((m) => [m.id, m]));
  const links = await loadTaskLinksBundle(organizationId);
  return rowToTask(row as WorkboardTaskRow, memberMap, links);
}

export async function updateSprintCompletionAction(
  sprintId: string
): Promise<void> {
  const parsed = uuidSchema.safeParse(sprintId);
  if (!parsed.success) {
    throw new Error(firstZodError(parsed.error));
  }

  const organizationId = await requireOrganizationId();
  const supabase = await createClient();
  await updateSprintCompletionInternal(supabase, organizationId, parsed.data);
}
