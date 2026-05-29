import { formatMoney } from "@/lib/finance/format";
import { deriveFinanceSummary } from "@/lib/metrics/derive-finance-summary";
import { collectRevenueEvents } from "@/lib/metrics/revenue-events";
import type { Client } from "@/types/clients";
import type { ClosingCall } from "@/types/closing";
import type { DashboardData, DashboardMetric } from "@/types/dashboard";
import type { ExpensesSummary } from "@/types/expenses";
import type { PaymentPlatformConfig } from "@/types/finance";
import type { Conversation, SalesMetricsData } from "@/types/sales";

function formatPercent(value: number): string {
  return `${value.toFixed(1).replace(".", ",")}%`;
}

function formatMinutes(min: number): string {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

/** Ingresos cobrados por día (últimos 7 días) para el gráfico del panel. */
export function deriveDashboardRevenueTrend(
  clients: Client[]
): { label: string; value: number }[] {
  const events = collectRevenueEvents(clients);
  const now = new Date();
  const points: { label: string; value: number }[] = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const label = d.toLocaleDateString("es", { weekday: "short" });
    const total = events
      .filter((e) => e.date === key)
      .reduce((sum, e) => sum + e.amount, 0);
    points.push({ label, value: Math.round(total) });
  }

  return points;
}

export function deriveDashboardData(
  clients: Client[],
  conversations: Conversation[],
  closingCalls: ClosingCall[],
  expenses: ExpensesSummary,
  paymentPlatforms: PaymentPlatformConfig[],
  salesMetrics: SalesMetricsData
): DashboardData {
  const finance = deriveFinanceSummary(
    clients,
    closingCalls,
    expenses,
    paymentPlatforms
  );

  const closedDeals = closingCalls.filter((c) => c.status === "closed").length;
  const scheduledCalls = closingCalls.filter(
    (c) => c.status === "scheduled"
  ).length;
  const activeClients = clients.filter((c) => c.status === "active").length;

  const revenueMetrics: DashboardMetric[] = [
    {
      id: "m1",
      label: "Facturación (mes)",
      value: formatMoney(finance.facturacion),
      trend: finance.facturacion > 0 ? "up" : "neutral",
    },
    {
      id: "m2",
      label: "Cash Collected",
      value: formatMoney(finance.cashCollected),
      trend: finance.cashCollected >= 0 ? "up" : "down",
    },
    {
      id: "m3",
      label: "Por cobrar",
      value: formatMoney(finance.porCobrar),
      trend: "neutral",
    },
  ];

  const salesMetricsCards: DashboardMetric[] = [
    {
      id: "s1",
      label: "Conversaciones",
      value: String(salesMetrics.totalConversations),
      trend: "neutral",
    },
    {
      id: "s2",
      label: "Tasa de agendamiento",
      value: formatPercent(salesMetrics.bookingRate),
      trend: salesMetrics.bookingRate >= 25 ? "up" : "neutral",
    },
    {
      id: "s3",
      label: "Tiempo de respuesta",
      value: formatMinutes(salesMetrics.avgResponseMin),
      trend: salesMetrics.avgResponseMin <= 30 ? "up" : "down",
    },
    {
      id: "s4",
      label: "Tasa de fantasma",
      value: formatPercent(salesMetrics.ghostingRate),
      trend: salesMetrics.ghostingRate <= 20 ? "down" : "up",
    },
    {
      id: "s5",
      label: "Conv. activas",
      value: String(salesMetrics.activeConversations),
      trend: "neutral",
    },
    {
      id: "s6",
      label: "Sin responder",
      value: String(salesMetrics.unansweredConversations),
      trend: salesMetrics.unansweredConversations === 0 ? "down" : "up",
    },
  ];

  const operationalMetrics: DashboardMetric[] = [
    {
      id: "o1",
      label: "Clientes activos",
      value: String(activeClients),
      trend: "neutral",
    },
    {
      id: "o2",
      label: "Deals cerrados",
      value: String(closedDeals),
      trend: closedDeals > 0 ? "up" : "neutral",
    },
    {
      id: "o3",
      label: "Llamadas agendadas",
      value: String(scheduledCalls),
      trend: "neutral",
    },
  ];

  const executiveSummary = [
    finance.facturacion > 0
      ? `Facturación del mes: ${formatMoney(finance.facturacion)}.`
      : "Aún no hay ingresos registrados con comprobante de pago este mes.",
    closedDeals > 0
      ? `${closedDeals} deal${closedDeals === 1 ? "" : "s"} cerrado${closedDeals === 1 ? "" : "s"} en Closing.`
      : "No hay deals marcados como cerrados.",
    salesMetrics.totalConversations > 0
      ? `${salesMetrics.totalConversations} conversaciones en bandeja; agendamiento ${formatPercent(salesMetrics.bookingRate)}.`
      : "Conecta ManyChat o importa contactos para ver actividad de ventas.",
  ].join(" ");

  const risks = [];
  if (salesMetrics.ghostingRate >= 25) {
    risks.push({
      id: "r-ghost",
      title: `Tasa de fantasma elevada (${formatPercent(salesMetrics.ghostingRate)})`,
      severity: "high" as const,
      department: "Ventas",
    });
  }
  if (salesMetrics.unansweredConversations > 5) {
    risks.push({
      id: "r-unanswered",
      title: `${salesMetrics.unansweredConversations} conversaciones sin responder`,
      severity: "medium" as const,
      department: "Ventas",
    });
  }
  if (finance.porCobrar > finance.facturacion && finance.facturacion > 0) {
    risks.push({
      id: "r-pending",
      title: `Por cobrar (${formatMoney(finance.porCobrar)}) supera la facturación del mes`,
      severity: "medium" as const,
      department: "Finanzas",
    });
  }
  if (risks.length === 0) {
    risks.push({
      id: "r-none",
      title: "Sin alertas críticas detectadas en los datos actuales",
      severity: "low" as const,
      department: "Operaciones",
    });
  }

  const opportunities = [];
  if (salesMetrics.bookingRate >= 30) {
    opportunities.push({
      id: "o-booking",
      title: `Buena tasa de agendamiento (${formatPercent(salesMetrics.bookingRate)})`,
      impact: "Refuerza el guión que está funcionando en la bandeja de ventas",
    });
  }
  if (closedDeals > 0) {
    opportunities.push({
      id: "o-closed",
      title: `${closedDeals} cierre${closedDeals === 1 ? "" : "s"} registrados`,
      impact: "Revisa Finanzas para validar cobros y comisiones del equipo",
    });
  }
  if (opportunities.length === 0) {
    opportunities.push({
      id: "o-grow",
      title: "Embudo con margen de crecimiento",
      impact: "Sincroniza Calendly y conecta el inbox para llenar el pipeline",
    });
  }

  const weeklyChanges = [
    `${conversations.length} conversaciones en el inbox`,
    `${clients.length} clientes en cartera (${activeClients} activos)`,
    `${closingCalls.length} llamadas de closing en el calendario`,
    `Gastos fijos + equipo estimados: ${formatMoney(expenses.totalMonthly)}/mes`,
  ];

  const aiRecommendation =
    salesMetrics.unansweredConversations > 0
      ? `Prioriza ${salesMetrics.unansweredConversations} conversación${salesMetrics.unansweredConversations === 1 ? "" : "es"} sin responder antes de escalar campañas.`
      : finance.cashCollected < finance.facturacion * 0.5 && finance.facturacion > 0
        ? "Revisa Gastos: el cash collected del mes está muy por debajo de la facturación."
        : "Mantén el ritmo: sincroniza Calendly y registra pagos al cerrar deals para métricas precisas.";

  return {
    executiveSummary,
    risks,
    opportunities,
    weeklyChanges,
    revenueMetrics,
    salesMetrics: salesMetricsCards,
    operationalMetrics,
    aiRecommendation,
  };
}
