import type { Department } from "@/types/operations";

export type DbWeeklyDepartment =
  | "ventas"
  | "delivery"
  | "operaciones"
  | "marketing"
  | "founder";

export const WEEKLY_DEPARTMENTS: DbWeeklyDepartment[] = [
  "ventas",
  "delivery",
  "operaciones",
  "marketing",
  "founder",
];

export const UI_TO_DB_DEPARTMENT: Record<Department, DbWeeklyDepartment> = {
  sales: "ventas",
  delivery: "delivery",
  operations: "operaciones",
  marketing: "marketing",
  founder: "founder",
};

export const DB_TO_UI_DEPARTMENT: Record<DbWeeklyDepartment, Department> = {
  ventas: "sales",
  delivery: "delivery",
  operaciones: "operations",
  marketing: "marketing",
  founder: "founder",
};

export const DB_DEPARTMENT_LABELS: Record<DbWeeklyDepartment, string> = {
  ventas: "Ventas",
  delivery: "Delivery",
  operaciones: "Operaciones",
  marketing: "Marketing",
  founder: "Founder",
};

/** Lunes de la semana (ISO) en YYYY-MM-DD. */
export function getCurrentWeekStart(date = new Date()): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}

export function getWeekEndLabel(weekStart: string): string {
  const end = new Date(`${weekStart}T12:00:00`);
  end.setDate(end.getDate() + 6);
  return end.toLocaleDateString("es", { day: "numeric", month: "short" });
}

export function getWeekStartLabel(weekStart: string): string {
  return new Date(`${weekStart}T12:00:00`).toLocaleDateString("es", {
    day: "numeric",
    month: "short",
  });
}

export function formatWeekRange(weekStart: string): string {
  return `Semana del ${getWeekStartLabel(weekStart)} al ${getWeekEndLabel(weekStart)}`;
}
