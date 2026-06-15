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
import { paths } from "@/routes/paths";
import type {
  TaskArea,
  TaskPriority,
  TaskStatus,
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
    rowToTask(row, memberMap)
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

export async function createWorkboardTaskAction(input: {
  title: string;
  description?: string;
  status: TaskStatus;
  area: TaskArea;
  priority: TaskPriority;
  assigneeId?: string | null;
  dueDate?: string | null;
  tags?: string[];
  sprintId?: string | null;
  launchId?: string | null;
}): Promise<WorkboardTask> {
  const organizationId = await requireOrganizationId();
  const profile = await getCurrentProfile();
  const supabase = await createClient();

  const existing = await listWorkboardTasksAction();
  const position = getNextPosition(existing, input.status);

  let sprintId = input.sprintId;
  if (sprintId === undefined) {
    const active = await getActiveSprintAction();
    sprintId = active?.id ?? null;
  }

  const { data, error } = await supabase
    .from("workboard_tasks")
    .insert({
      organization_id: organizationId,
      title: input.title.trim(),
      description: input.description?.trim() ?? "",
      status: input.status,
      area: input.area,
      priority: input.priority,
      assignee_id: input.assigneeId || null,
      due_date: input.dueDate || null,
      tags: input.tags ?? [],
      sprint_id: sprintId || null,
      launch_id: input.launchId || null,
      position,
      created_by: profile?.id ?? null,
      updated_at: new Date().toISOString(),
    })
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  if (sprintId) {
    await refreshSprintCompletionForTask(supabase, organizationId, data.id);
  }
  revalidateWorkboard();
  const members = await listWorkboardMembersAction();
  const memberMap = new Map(members.map((m) => [m.id, m]));
  return rowToTask(data as WorkboardTaskRow, memberMap);
}

export async function moveWorkboardTaskAction(input: {
  taskId: string;
  status: TaskStatus;
}): Promise<void> {
  const organizationId = await requireOrganizationId();
  const supabase = await createClient();
  const existing = await listWorkboardTasksAction();
  const position = getNextPosition(
    existing.filter((t) => t.id !== input.taskId),
    input.status
  );

  const { error } = await supabase
    .from("workboard_tasks")
    .update({
      status: input.status,
      position,
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.taskId)
    .eq("organization_id", organizationId);

  if (error) throw new Error(error.message);
  await refreshSprintCompletionForTask(supabase, organizationId, input.taskId);
  revalidateWorkboard();
}

export async function updateWorkboardTaskAction(input: {
  taskId: string;
  title?: string;
  description?: string;
  status?: TaskStatus;
  area?: TaskArea;
  priority?: TaskPriority;
  assigneeId?: string | null;
  dueDate?: string | null;
  tags?: string[];
  estimatedMinutes?: number;
  launchId?: string | null;
}): Promise<WorkboardTask> {
  const organizationId = await requireOrganizationId();
  const supabase = await createClient();

  const patch: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (input.title !== undefined) patch.title = input.title.trim();
  if (input.description !== undefined) patch.description = input.description.trim();
  if (input.status !== undefined) patch.status = input.status;
  if (input.area !== undefined) patch.area = input.area;
  if (input.priority !== undefined) patch.priority = input.priority;
  if (input.assigneeId !== undefined) patch.assignee_id = input.assigneeId || null;
  if (input.dueDate !== undefined) patch.due_date = input.dueDate || null;
  if (input.tags !== undefined) patch.tags = input.tags;
  if (input.launchId !== undefined) patch.launch_id = input.launchId || null;
  if (input.estimatedMinutes !== undefined) {
    patch.estimated_minutes = input.estimatedMinutes;
  }

  if (input.status !== undefined) {
    const existing = await listWorkboardTasksAction();
    patch.position = getNextPosition(
      existing.filter((t) => t.id !== input.taskId),
      input.status
    );
  }

  const { data, error } = await supabase
    .from("workboard_tasks")
    .update(patch)
    .eq("id", input.taskId)
    .eq("organization_id", organizationId)
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  await refreshSprintCompletionForTask(supabase, organizationId, input.taskId);
  revalidateWorkboard();
  const members = await listWorkboardMembersAction();
  const memberMap = new Map(members.map((m) => [m.id, m]));
  return rowToTask(data as WorkboardTaskRow, memberMap);
}

export async function deleteWorkboardTaskAction(taskId: string): Promise<void> {
  const organizationId = await requireOrganizationId();
  const supabase = await createClient();

  const { error } = await supabase
    .from("workboard_tasks")
    .delete()
    .eq("id", taskId)
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
  const organizationId = await requireOrganizationId();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("workboard_tasks")
    .update({
      launch_id: launchId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", taskId)
    .eq("organization_id", organizationId)
    .select("*")
    .single();

  if (error) throw new Error(error.message);

  revalidateWorkboard();
  revalidatePath(paths.platform.lanzamientos);

  const members = await listWorkboardMembersAction();
  const memberMap = new Map(members.map((m) => [m.id, m]));
  return rowToTask(data as WorkboardTaskRow, memberMap);
}

export async function logTaskTimeAction(input: {
  taskId: string;
  actualMinutes: number;
  estimatedMinutes?: number;
  note?: string;
}): Promise<{ ok: true }> {
  const organizationId = await requireOrganizationId();
  const profile = await getCurrentProfile();
  if (!profile) throw new Error("Sesión no válida");

  const supabase = await createClient();

  const { data: task, error: fetchError } = await supabase
    .from("workboard_tasks")
    .select("id, time_entries, organization_id, estimated_minutes")
    .eq("id", input.taskId)
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (fetchError) throw new Error(fetchError.message);
  if (!task) throw new Error("Tarea no encontrada");

  const currentEntries = (task.time_entries ?? []) as TaskTimeEntry[];
  const newEntry: TaskTimeEntry = {
    logged_at: new Date().toISOString(),
    minutes: input.actualMinutes,
    note: input.note ?? "",
    logged_by: profile.id,
  };

  const { error } = await supabase
    .from("workboard_tasks")
    .update({
      actual_minutes: input.actualMinutes,
      estimated_minutes:
        input.estimatedMinutes ?? task.estimated_minutes ?? null,
      time_entries: [...currentEntries, newEntry],
      timer_running: false,
      timer_started_at: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.taskId)
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

export async function setMemberHourlyRateAction(input: {
  memberId: string;
  hourlyRate: number;
  currency: string;
}): Promise<{ ok: true }> {
  const profile = await getCurrentProfile();
  if (!profile) throw new Error("Sesión no válida");

  if (!["founder", "admin"].includes(profile.role)) {
    throw new Error("Sin permisos para configurar sueldos");
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({
      hourly_rate: input.hourlyRate,
      hourly_rate_currency: input.currency,
    })
    .eq("id", input.memberId)
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

export async function createSprintAction(input: {
  name: string;
  goal?: string;
  areaFocus?: string;
  startDate: string;
  endDate: string;
}): Promise<WorkboardSprint> {
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
      name: input.name.trim(),
      goal: input.goal?.trim() || null,
      area_focus: input.areaFocus || null,
      start_date: input.startDate,
      end_date: input.endDate,
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
  input: Partial<{
    name: string;
    goal: string;
    areaFocus: string;
    startDate: string;
    endDate: string;
    status: string;
  }>
): Promise<{ ok: true }> {
  const organizationId = await requireOrganizationId();
  const supabase = await createClient();

  const patch: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (input.name !== undefined) patch.name = input.name.trim();
  if (input.goal !== undefined) patch.goal = input.goal.trim() || null;
  if (input.areaFocus !== undefined) patch.area_focus = input.areaFocus || null;
  if (input.startDate !== undefined) patch.start_date = input.startDate;
  if (input.endDate !== undefined) patch.end_date = input.endDate;
  if (input.status !== undefined) patch.status = input.status;

  const { error } = await supabase
    .from("sprints")
    .update(patch)
    .eq("id", sprintId)
    .eq("organization_id", organizationId);

  if (error) throw new Error(error.message);

  revalidateWorkboard();
  return { ok: true };
}

export async function assignTaskToSprintAction(
  taskId: string,
  sprintId: string | null
): Promise<WorkboardTask> {
  const organizationId = await requireOrganizationId();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("workboard_tasks")
    .update({
      sprint_id: sprintId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", taskId)
    .eq("organization_id", organizationId)
    .select("*")
    .single();

  if (error) throw new Error(error.message);

  await refreshSprintCompletionForTask(supabase, organizationId, taskId);
  revalidateWorkboard();

  const members = await listWorkboardMembersAction();
  const memberMap = new Map(members.map((m) => [m.id, m]));
  return rowToTask(data as WorkboardTaskRow, memberMap);
}

export async function updateSprintCompletionAction(
  sprintId: string
): Promise<void> {
  const organizationId = await requireOrganizationId();
  const supabase = await createClient();
  await updateSprintCompletionInternal(supabase, organizationId, sprintId);
}
