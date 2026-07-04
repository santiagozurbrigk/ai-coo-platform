import type { Client } from "@/types/clients";
import type { PlanDuration } from "@/types/plan-durations";

const OFFERED_PRODUCT_RE = /^Producto ofrecido:\s*(.+)$/i;

export function parseOfferedProductFromInsights(
  insights: string[] | null | undefined
): string | undefined {
  if (!insights?.length) return undefined;
  for (const line of insights) {
    const match = line.match(OFFERED_PRODUCT_RE);
    if (match?.[1]?.trim()) return match[1].trim();
  }
  return undefined;
}

export function getClientPlanName(client: Client): string | undefined {
  const plan = client.offeredProduct?.trim();
  return plan || undefined;
}

export function normalizePlanName(planName: string): string {
  return planName.trim().toLowerCase();
}

export function findPlanDuration(
  planName: string | undefined,
  durations: PlanDuration[]
): PlanDuration | undefined {
  if (!planName?.trim()) return undefined;
  const key = normalizePlanName(planName);
  return durations.find((d) => normalizePlanName(d.planName) === key);
}

export function computeOutstandingBalance(
  client: Client,
  paidTotal: number
): number {
  return Math.max(0, client.totalAmount - paidTotal);
}

export function computeRemainingProgramDays(
  joinDate: string,
  durationDays: number | null | undefined
): number | null {
  if (durationDays == null || durationDays <= 0) return null;

  const start = new Date(`${joinDate}T00:00:00`);
  if (Number.isNaN(start.getTime())) return null;

  const end = new Date(start);
  end.setDate(end.getDate() + durationDays);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffMs = end.getTime() - today.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

export function formatRemainingDays(days: number | null): string {
  if (days == null) return "Sin datos de duración";
  if (days < 0) return "Programa finalizado";
  if (days === 0) return "Hoy";
  if (days === 1) return "1 día";
  return `${days} días`;
}

export function distinctPlanNames(clients: Client[]): string[] {
  const names = new Set<string>();
  for (const client of clients) {
    const plan = getClientPlanName(client);
    if (plan) names.add(plan);
  }
  return [...names].sort((a, b) => a.localeCompare(b, "es"));
}
