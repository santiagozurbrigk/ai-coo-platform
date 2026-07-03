import type { TaskArea, TaskPriority } from "@/types/workboard";

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: "Baja",
  medium: "Media",
  high: "Alta",
};

export function getPriorityClasses(priority: TaskPriority) {
  switch (priority) {
    case "high":
      return "border-red-500/25 bg-red-500/10 text-red-700 dark:border-red-500/40 dark:bg-red-500/25 dark:text-red-200";
    case "medium":
      return "border-amber-500/25 bg-amber-500/10 text-amber-800 dark:border-amber-500/40 dark:bg-amber-500/25 dark:text-amber-200";
    case "low":
      return "border-emerald-500/25 bg-emerald-500/10 text-emerald-800 dark:border-emerald-500/40 dark:bg-emerald-500/25 dark:text-emerald-200";
    default:
      return "";
  }
}

export function getAreaClasses(area: TaskArea) {
  const map: Record<TaskArea, string> = {
    marketing:
      "border-violet-500/30 bg-violet-500/10 text-violet-700 dark:border-violet-500/40 dark:bg-violet-500/25 dark:text-violet-200",
    ventas:
      "border-blue-500/30 bg-blue-500/10 text-blue-700 dark:border-blue-500/40 dark:bg-blue-500/25 dark:text-blue-200",
    operaciones:
      "border-orange-500/30 bg-orange-500/10 text-orange-800 dark:border-orange-500/40 dark:bg-orange-500/25 dark:text-orange-200",
    finanzas:
      "border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:border-emerald-500/40 dark:bg-emerald-500/25 dark:text-emerald-200",
    clientes:
      "border-pink-500/30 bg-pink-500/10 text-pink-700 dark:border-pink-500/40 dark:bg-pink-500/25 dark:text-pink-200",
    general: "border-border bg-muted text-muted-foreground",
  };
  return map[area];
}
