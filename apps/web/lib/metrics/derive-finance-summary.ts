import type { Client } from "@/types/clients";
import type { ClosingCall } from "@/types/closing";
import type { ExpensesSummary } from "@/types/expenses";
import type {
  CloserPerformance,
  FinanceSummary,
  PaymentPlatformConfig,
} from "@/types/finance";
import {
  collectRevenueEvents,
  filterRevenueEvents,
  sumAllRecognizedRevenue,
} from "@/lib/metrics/revenue-events";
import {
  DEFAULT_REVENUE_RANGE,
  prorateMonthlyExpenses,
  resolveRevenueDateRange,
  type ResolvedRevenuePeriod,
  type RevenueDateRange,
} from "@/lib/metrics/revenue-period";

const DEFAULT_COMMISSION_RATE = 0.1;

/** Fallback si las plataformas aún usan IDs mock en local. */
const LEGACY_PLATFORM_TO_CONFIG_ID: Record<string, string> = {
  stripe: "pp-stripe",
  mercadopago: "pp-mp",
  paypal: "pp-stripe",
  bank_transfer: "pp-wise",
};

function configIdForPaymentSlug(
  platform: string,
  paymentPlatforms: PaymentPlatformConfig[]
): string | null {
  const bySlug = paymentPlatforms.find((p) => p.slug === platform);
  if (bySlug) return bySlug.id;
  const legacy = LEGACY_PLATFORM_TO_CONFIG_ID[platform];
  if (legacy && paymentPlatforms.some((p) => p.id === legacy)) return legacy;
  return null;
}

/** Total histórico reconocido (todas las fechas de cobro). */
export function cobradoSegunPagoForClient(client: Client): number {
  return collectRevenueEvents([client]).reduce((s, e) => s + e.amount, 0);
}

/** @deprecated Usar cobradoSegunPagoForClient o sumRevenueInPeriod */
export const cashCollectedForClient = cobradoSegunPagoForClient;

function pendientePorCobrar(client: Client): number {
  return Math.max(0, client.totalAmount - cobradoSegunPagoForClient(client));
}

function monthLabelEs(dateIso: string): string {
  return new Date(dateIso).toLocaleDateString("es", { month: "long" });
}

export function deriveCloserBreakdown(
  closingCalls: ClosingCall[],
  commissionRate = DEFAULT_COMMISSION_RATE
): CloserPerformance[] {
  const byCloser = new Map<
    string,
    { dealsClosed: number; revenue: number }
  >();

  for (const call of closingCalls) {
    if (call.status !== "closed" || !call.outcome?.revenue) continue;
    const name = call.closedByName?.trim() || "Sin asignar";
    const prev = byCloser.get(name) ?? { dealsClosed: 0, revenue: 0 };
    byCloser.set(name, {
      dealsClosed: prev.dealsClosed + 1,
      revenue: prev.revenue + call.outcome.revenue,
    });
  }

  return Array.from(byCloser.entries()).map(([name, stats], index) => ({
    id: `closer-${index}`,
    name,
    dealsClosed: stats.dealsClosed,
    revenue: stats.revenue,
    commission: Math.round(stats.revenue * commissionRate),
  }));
}

export function deriveFinanceSummary(
  clients: Client[],
  closingCalls: ClosingCall[],
  expenses: ExpensesSummary,
  paymentPlatforms: PaymentPlatformConfig[],
  revenueRange: RevenueDateRange = DEFAULT_REVENUE_RANGE
): FinanceSummary & { revenuePeriod: ResolvedRevenuePeriod } {
  const revenuePeriod = resolveRevenueDateRange(revenueRange);
  const events = collectRevenueEvents(clients);
  const periodEvents = filterRevenueEvents(events, revenuePeriod);

  const facturacion = periodEvents.reduce((sum, e) => sum + e.amount, 0);
  const gastosTotales = prorateMonthlyExpenses(
    expenses.totalMonthly,
    revenuePeriod
  );
  const gananciaNeta = facturacion - gastosTotales;
  const cashCollected = gananciaNeta;
  const margenPercent =
    facturacion > 0 ? (gananciaNeta / facturacion) * 100 : 0;

  const porCobrar = clients.reduce((sum, c) => sum + pendientePorCobrar(c), 0);

  const pendingByMonth = new Map<string, number>();
  for (const client of clients) {
    for (const inst of client.installments ?? []) {
      if (inst.status !== "pending" || !inst.dueDate) continue;
      const label = monthLabelEs(inst.dueDate);
      pendingByMonth.set(label, (pendingByMonth.get(label) ?? 0) + inst.amount);
    }
  }

  const porCobrarByMonth = Array.from(pendingByMonth.entries()).map(
    ([month, amount]) => ({ month, amount })
  );

  const balanceByPlatform = new Map<string, number>();
  for (const event of periodEvents) {
    const configId = configIdForPaymentSlug(event.platform, paymentPlatforms);
    if (!configId) continue;
    balanceByPlatform.set(
      configId,
      (balanceByPlatform.get(configId) ?? 0) + event.amount
    );
  }

  const platformBalances = paymentPlatforms
    .filter((p) => balanceByPlatform.has(p.id))
    .map((p) => ({
      platformId: p.id,
      amount: balanceByPlatform.get(p.id) ?? 0,
    }));

  return {
    facturacion,
    cashCollected,
    porCobrar,
    porCobrarByMonth,
    gastosTotales,
    margenPercent,
    closerBreakdown: deriveCloserBreakdown(closingCalls),
    platformBalances,
    revenuePeriod,
  };
}

export { sumAllRecognizedRevenue };
