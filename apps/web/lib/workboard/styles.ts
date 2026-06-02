import type { TaskArea, TaskPriority } from "@/types/workboard";

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: "Baja",
  medium: "Media",
  high: "Alta",
};

export function getPriorityClasses(priority: TaskPriority) {
  switch (priority) {
    case "high":
      return "border-red-500/25 bg-red-500/10 text-red-600 dark:text-red-400";
    case "medium":
      return "border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-400";
    case "low":
      return "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400";
    default:
      return "";
  }
}

export function getAreaClasses(area: TaskArea) {
  const map: Record<TaskArea, string> = {
    marketing:
      "border-violet-500/30 bg-violet-500/10 text-violet-600 dark:text-violet-400",
    ventas: "border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400",
    operaciones:
      "border-orange-500/30 bg-orange-500/10 text-orange-600 dark:text-orange-400",
    finanzas:
      "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    clientes:
      "border-pink-500/30 bg-pink-500/10 text-pink-600 dark:text-pink-400",
    general: "border-border bg-muted text-muted-foreground",
  };
  return map[area];
}
