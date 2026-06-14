import { STATUS_LABELS, WORKBOARD_STATUSES } from "./constants";
import type { TaskStatus, WorkboardColumn, WorkboardTask } from "@/types/workboard";

export function groupTasksIntoColumns(tasks: WorkboardTask[]): WorkboardColumn[] {
  return WORKBOARD_STATUSES.map((status) => ({
    id: status,
    title: STATUS_LABELS[status],
    tasks: tasks
      .filter((t) => t.status === status)
      .sort((a, b) => a.position - b.position || a.createdAt.localeCompare(b.createdAt)),
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

export function filterWorkboardTasks(
  tasks: WorkboardTask[],
  areaFilter: string,
  sprintFilterId: string
): WorkboardTask[] {
  return filterTasksBySprint(filterTasksByArea(tasks, areaFilter), sprintFilterId);
}

export function getNextPosition(
  tasks: WorkboardTask[],
  status: TaskStatus
): number {
  const inColumn = tasks.filter((t) => t.status === status);
  if (inColumn.length === 0) return 0;
  return Math.max(...inColumn.map((t) => t.position)) + 1;
}
