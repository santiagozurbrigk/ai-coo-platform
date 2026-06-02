import type { TaskArea, TaskStatus } from "@/types/workboard";

export const WORKBOARD_STATUSES: TaskStatus[] = [
  "todo",
  "in_progress",
  "review",
  "done",
];

export const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: "Por hacer",
  in_progress: "En progreso",
  review: "En revisión",
  done: "Hecho",
};

export const STATUS_COLORS: Record<
  TaskStatus,
  { chip: string; dot: string }
> = {
  todo: {
    chip: "bg-slate-500/15 text-slate-600 border-slate-500/30 dark:text-slate-300",
    dot: "bg-slate-400",
  },
  in_progress: {
    chip: "bg-blue-500/15 text-blue-700 border-blue-500/30 dark:text-blue-300",
    dot: "bg-blue-500",
  },
  review: {
    chip: "bg-amber-500/15 text-amber-700 border-amber-500/30 dark:text-amber-300",
    dot: "bg-amber-500",
  },
  done: {
    chip: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30 dark:text-emerald-300",
    dot: "bg-emerald-500",
  },
};

export const TASK_AREA_LABELS: Record<TaskArea, string> = {
  marketing: "Marketing",
  ventas: "Ventas",
  operaciones: "Operaciones",
  finanzas: "Finanzas",
  clientes: "Clientes",
  general: "General",
};

export const TASK_AREA_OPTIONS = (
  Object.entries(TASK_AREA_LABELS) as [TaskArea, string][]
).map(([value, label]) => ({ value, label }));
