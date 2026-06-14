import type { SprintAreaFocus, SprintStatus, WorkboardSprint, WorkboardTask } from "@/types/workboard";

export type SprintRow = {
  id: string;
  organization_id: string;
  name: string;
  goal: string | null;
  area_focus: string | null;
  start_date: string;
  end_date: string;
  status: string;
  completion_rate: number | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

const SPRINT_STATUS_SET = new Set<SprintStatus>(["planning", "active", "completed"]);
const SPRINT_AREA_SET = new Set<SprintAreaFocus>([
  "ventas",
  "marketing",
  "operaciones",
  "delivery",
  "producto",
  "general",
]);

export function rowToSprint(
  row: SprintRow,
  tasks: WorkboardTask[] = []
): WorkboardSprint {
  const sprintTasks = tasks.filter((t) => t.sprintId === row.id);
  const completedTasks = sprintTasks.filter((t) => t.status === "done").length;
  const status = SPRINT_STATUS_SET.has(row.status as SprintStatus)
    ? (row.status as SprintStatus)
    : "active";
  const areaFocus =
    row.area_focus && SPRINT_AREA_SET.has(row.area_focus as SprintAreaFocus)
      ? (row.area_focus as SprintAreaFocus)
      : undefined;

  return {
    id: row.id,
    name: row.name,
    startDate: row.start_date,
    endDate: row.end_date,
    goal: row.goal ?? "",
    areaFocus,
    status,
    completionRate: row.completion_rate ?? 0,
    completedTasks,
    totalTasks: sprintTasks.length,
    totalMinutesLogged: sprintTasks.reduce(
      (sum, t) => sum + (t.actualMinutes ?? 0),
      0
    ),
  };
}

export function sprintAreaToTaskAreaFilter(
  areaFocus?: SprintAreaFocus
): string | null {
  if (!areaFocus || areaFocus === "general") return null;
  if (areaFocus === "delivery" || areaFocus === "producto") return "operaciones";
  return areaFocus;
}
