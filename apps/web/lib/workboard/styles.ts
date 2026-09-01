import type { CSSProperties } from "react";
import { categorySurface } from "@/lib/ui/category-badge";
import type { TaskArea, TaskPriority } from "@/types/workboard";

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: "Baja",
  medium: "Media",
  high: "Alta",
};

export function getPriorityClasses(priority: TaskPriority) {
  switch (priority) {
    case "high":
      return "border-red-500/25 bg-red-500/10 text-red-700 dark:border-red-500/30 dark:bg-red-500/15 dark:text-red-300";
    case "medium":
      return "border-amber-500/25 bg-amber-500/10 text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/15 dark:text-amber-300";
    case "low":
      return "border-emerald-500/25 bg-emerald-500/10 text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-300";
    default:
      return "";
  }
}

/**
 * Slot de la paleta categórica por área. El orden respeta los colores que ya
 * tenía cada área (ventas azul, finanzas verde, clientes rosa, operaciones
 * naranja); marketing era violeta de la marca anterior y pasa a índigo.
 * `general` no es una categoría más — es la ausencia de área — y se queda en
 * neutro.
 */
const AREA_SLOT: Record<Exclude<TaskArea, "general">, number> = {
  operaciones: 0,
  ventas: 1,
  finanzas: 2,
  marketing: 3,
  clientes: 4,
};

/** Clases de layout del badge de área. El color va en `getAreaStyle`. */
export function getAreaClasses(area: TaskArea) {
  return area === "general" ? "border-border bg-muted text-muted-foreground" : "";
}

/** Color del badge de área, desde la paleta categórica validada. */
export function getAreaStyle(area: TaskArea): CSSProperties | undefined {
  if (area === "general") return undefined;
  return categorySurface(AREA_SLOT[area]);
}
