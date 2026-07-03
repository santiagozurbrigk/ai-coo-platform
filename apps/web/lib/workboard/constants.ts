import type { SprintAreaFocus, TaskArea, TaskStatus } from "@/types/workboard";

/**
 * Bucket privado de Supabase Storage para adjuntos de tareas.
 * Crear en Supabase Dashboard → Storage → New bucket
 * Name: workboard-task-attachments | Public: false
 */
export const WORKBOARD_ATTACHMENTS_BUCKET = "workboard-task-attachments";

export const WORKBOARD_ATTACHMENTS_MAX_BYTES = 25 * 1024 * 1024;

export const WORKBOARD_ATTACHMENTS_ACCEPT =
  ".pdf,.txt,.md,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.webp,application/pdf,text/plain,text/markdown,image/png,image/jpeg,image/webp";

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
    chip:
      "bg-slate-500/15 text-slate-700 border-slate-500/30 dark:bg-slate-400/20 dark:text-slate-200 dark:border-slate-400/35",
    dot: "bg-slate-400",
  },
  in_progress: {
    chip:
      "bg-blue-500/15 text-blue-700 border-blue-500/30 dark:bg-blue-500/25 dark:text-blue-200 dark:border-blue-500/40",
    dot: "bg-blue-500",
  },
  review: {
    chip:
      "bg-amber-500/15 text-amber-800 border-amber-500/30 dark:bg-amber-500/25 dark:text-amber-200 dark:border-amber-500/40",
    dot: "bg-amber-500",
  },
  done: {
    chip:
      "bg-emerald-500/15 text-emerald-800 border-emerald-500/30 dark:bg-emerald-500/25 dark:text-emerald-200 dark:border-emerald-500/40",
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

export const SPRINT_AREA_FOCUS_LABELS: Record<SprintAreaFocus, string> = {
  ventas: "Ventas",
  marketing: "Marketing",
  operaciones: "Operaciones",
  delivery: "Delivery",
  producto: "Producto",
  general: "General",
};

export const SPRINT_AREA_FOCUS_OPTIONS = (
  Object.entries(SPRINT_AREA_FOCUS_LABELS) as [SprintAreaFocus, string][]
).map(([value, label]) => ({ value, label }));
