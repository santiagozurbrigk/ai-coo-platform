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
import { createClient } from "@/lib/supabase/server";
import { paths } from "@/routes/paths";
import type {
  TaskArea,
  TaskPriority,
  TaskStatus,
  MemberTimeReport,
  WorkboardMember,
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
}> {
  const [tasks, members] = await Promise.all([
    listWorkboardTasksAction(),
    listWorkboardMembersAction(),
  ]);
  return { tasks, members };
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
}): Promise<WorkboardTask> {
  const organizationId = await requireOrganizationId();
  const profile = await getCurrentProfile();
  const supabase = await createClient();

  const existing = await listWorkboardTasksAction();
  const position = getNextPosition(existing, input.status);

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
      position,
      created_by: profile?.id ?? null,
      updated_at: new Date().toISOString(),
    })
    .select("*")
    .single();

  if (error) throw new Error(error.message);
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
