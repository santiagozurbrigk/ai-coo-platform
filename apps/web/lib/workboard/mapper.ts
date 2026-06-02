import type {
  TaskArea,
  TaskPriority,
  TaskStatus,
  WorkboardMember,
  WorkboardTask,
} from "@/types/workboard";

const WORKBOARD_STATUS_SET = new Set<TaskStatus>([
  "todo",
  "in_progress",
  "review",
  "done",
]);
const TASK_AREA_SET = new Set<TaskArea>([
  "marketing",
  "ventas",
  "operaciones",
  "finanzas",
  "clientes",
  "general",
]);
const PRIORITY_SET = new Set<TaskPriority>(["low", "medium", "high"]);

export type WorkboardTaskRow = {
  id: string;
  organization_id: string;
  status: string;
  area: string;
  priority: string;
  title: string;
  description: string;
  assignee_id: string | null;
  due_date: string | null;
  tags: string[] | null;
  position: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  assignee?: {
    id: string;
    full_name: string | null;
    email: string;
  } | null;
};

export function initialsFromName(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export function displayName(
  fullName: string | null | undefined,
  email: string
): string {
  if (fullName?.trim()) return fullName.trim();
  return email.split("@")[0] ?? email;
}

export function rowToMember(row: {
  id: string;
  full_name: string | null;
  email: string;
  role: string;
}): WorkboardMember {
  const name = displayName(row.full_name, row.email);
  return {
    id: row.id,
    name,
    email: row.email,
    role: row.role,
    initials: initialsFromName(name),
  };
}

export function rowToTask(
  row: WorkboardTaskRow,
  memberMap?: Map<string, WorkboardMember>
): WorkboardTask {
  const status = WORKBOARD_STATUS_SET.has(row.status as TaskStatus)
    ? (row.status as TaskStatus)
    : "todo";
  const area = TASK_AREA_SET.has(row.area as TaskArea)
    ? (row.area as TaskArea)
    : "general";
  const priority = PRIORITY_SET.has(row.priority as TaskPriority)
    ? (row.priority as TaskPriority)
    : "medium";

  let assignee: WorkboardTask["assignee"];
  if (row.assignee) {
    const name = displayName(row.assignee.full_name, row.assignee.email);
    assignee = { id: row.assignee.id, name, initials: initialsFromName(name) };
  } else if (row.assignee_id && memberMap?.has(row.assignee_id)) {
    const m = memberMap.get(row.assignee_id)!;
    assignee = { id: m.id, name: m.name, initials: m.initials };
  }

  return {
    id: row.id,
    status,
    title: row.title,
    description: row.description ?? "",
    area,
    priority,
    assignee,
    assigneeId: row.assignee_id,
    dueDate: row.due_date ?? undefined,
    tags: row.tags ?? [],
    position: row.position,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
