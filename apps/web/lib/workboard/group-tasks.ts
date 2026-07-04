import { STATUS_LABELS, WORKBOARD_STATUSES } from "./constants";
import type { TaskPriority, TaskStatus, WorkboardColumn, WorkboardTask } from "@/types/workboard";

/** Orden de prioridad en tablero: alta → media → baja (valores del check en DB). */
const PRIORITY_SORT_ORDER: Record<TaskPriority, number> = {
  high: 0,
  medium: 1,
  low: 2,
};

/** Fecha usada para ordenar: vencimiento si existe; si no, día de creación. */
export function taskSortDateKey(task: WorkboardTask): string {
  if (task.dueDate) return task.dueDate;
  return task.createdAt.slice(0, 10);
}

export function compareWorkboardTasks(a: WorkboardTask, b: WorkboardTask): number {
  const byPriority =
    PRIORITY_SORT_ORDER[a.priority] - PRIORITY_SORT_ORDER[b.priority];
  if (byPriority !== 0) return byPriority;
  return taskSortDateKey(a).localeCompare(taskSortDateKey(b));
}

export function sortWorkboardTasks(tasks: WorkboardTask[]): WorkboardTask[] {
  return [...tasks].sort(compareWorkboardTasks);
}

export function groupTasksIntoColumns(tasks: WorkboardTask[]): WorkboardColumn[] {
  return WORKBOARD_STATUSES.map((status) => ({
    id: status,
    title: STATUS_LABELS[status],
    tasks: sortWorkboardTasks(tasks.filter((t) => t.status === status)),
  }));
}

export function taskCalendarDate(task: WorkboardTask): string | null {
  if (task.dueDate) return task.dueDate;
  if (task.createdAt) return task.createdAt.slice(0, 10);
  return null;
}

export function filterTasksByArea(
  tasks: WorkboardTask[],
  areaFilter: string
): WorkboardTask[] {
  if (areaFilter === "all") return tasks;
  return tasks.filter((t) => t.area === areaFilter);
}

export function filterTasksBySprint(
  tasks: WorkboardTask[],
  sprintFilterId: string
): WorkboardTask[] {
  if (sprintFilterId === "all") return tasks;
  return tasks.filter((t) => t.sprintId === sprintFilterId);
}

export function filterTasksByLaunch(
  tasks: WorkboardTask[],
  launchFilterId: string
): WorkboardTask[] {
  if (launchFilterId === "all") return tasks;
  return tasks.filter((t) => t.launchId === launchFilterId);
}

export function filterTasksByAssignee(
  tasks: WorkboardTask[],
  assigneeFilterId: string
): WorkboardTask[] {
  if (assigneeFilterId === "all") return tasks;
  if (assigneeFilterId === "unassigned") {
    return tasks.filter((t) => !t.assigneeId);
  }
  return tasks.filter((t) => t.assigneeId === assigneeFilterId);
}

export function filterTasksByDoneVisibility(
  tasks: WorkboardTask[],
  showDoneOnly: boolean
): WorkboardTask[] {
  if (showDoneOnly) {
    return tasks.filter((t) => t.status === "done");
  }
  return tasks.filter((t) => t.status !== "done");
}

/** Oculta tareas hechas en Kanban salvo las visibles temporalmente tras completarse. */
export function filterKanbanDoneTasks(
  tasks: WorkboardTask[],
  visibleDoneUntil: Record<string, number>
): WorkboardTask[] {
  const now = Date.now();
  return tasks.filter((task) => {
    if (task.status !== "done") return true;
    const until = visibleDoneUntil[task.id];
    return until != null && now < until;
  });
}

export function filterWorkboardTasks(
  tasks: WorkboardTask[],
  areaFilter: string,
  sprintFilterId: string,
  launchFilterId = "all",
  assigneeFilterId = "all"
): WorkboardTask[] {
  return filterTasksByAssignee(
    filterTasksByLaunch(
      filterTasksBySprint(filterTasksByArea(tasks, areaFilter), sprintFilterId),
      launchFilterId
    ),
    assigneeFilterId
  );
}

export function getNextPosition(
  tasks: WorkboardTask[],
  status: TaskStatus
): number {
  const inColumn = tasks.filter((t) => t.status === status);
  if (inColumn.length === 0) return 0;
  return Math.max(...inColumn.map((t) => t.position)) + 1;
}
