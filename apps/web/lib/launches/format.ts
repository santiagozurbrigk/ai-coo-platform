import type { LaunchStatus } from "@/types/launches";

export const LAUNCH_STATUS_LABEL: Record<LaunchStatus, string> = {
  planning: "Planificando",
  active: "Activo",
  completed: "Completado",
  cancelled: "Cancelado",
};

export const LAUNCH_STATUS_CLASS: Record<LaunchStatus, string> = {
  planning: "border-border/60 bg-muted/40 text-muted-foreground",
  active: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  completed: "border-blue-500/30 bg-blue-500/10 text-blue-400",
  cancelled: "border-red-500/30 bg-red-500/10 text-red-400",
};

export function formatLaunchMoney(value: number): string {
  return `$${value.toLocaleString("es-AR")}`;
}

export function formatLaunchDate(iso: string | null): string {
  if (!iso) return "Sin fecha";
  return new Date(iso + (iso.length === 10 ? "T12:00:00" : "")).toLocaleDateString(
    "es-AR",
    { day: "numeric", month: "short", year: "numeric" }
  );
}

export function goalProgressPct(actual: number, goal: number | null): number | null {
  if (!goal || goal <= 0) return null;
  return Math.min(100, Math.round((actual / goal) * 100));
}

export function daysRemaining(
  endDate: string | null,
  launchDate: string | null
): number | null {
  const target = endDate ?? launchDate;
  if (!target) return null;
  const end = new Date(target + "T23:59:59");
  const now = new Date();
  return Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}
