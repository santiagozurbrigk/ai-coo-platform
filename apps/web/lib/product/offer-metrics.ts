import type { ProductOffer, ProductAvatar, ValueLadderStep } from "@/types/product";

export type ProductMetricsInput = {
  clients: Array<{
    id: string;
    offeredProduct?: string;
    totalAmount: number;
    status: string;
    joinDate: string;
  }>;
  paidByClientId: Record<string, number>;
  closedCallsCount: number;
  totalCallsCount: number;
  topOrgObjection?: string;
};

const EMPTY_LABEL = "Sin datos";

function normalizeName(value: string): string {
  return value.trim().toLowerCase();
}

function clientsForProduct(
  productName: string,
  clients: ProductMetricsInput["clients"]
) {
  const key = normalizeName(productName);
  return clients.filter(
    (c) => c.offeredProduct && normalizeName(c.offeredProduct) === key
  );
}

function monthKey(date: string): string {
  return date.slice(0, 7);
}

export function computeOfferStats(
  productName: string,
  input: ProductMetricsInput
): ProductOffer["stats"] {
  const matched = clientsForProduct(productName, input.clients);
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  if (!matched.length) {
    return {
      monthlyRevenue: EMPTY_LABEL,
      closeRate: 0,
      topObjection: EMPTY_LABEL,
      completionRate: 0,
    };
  }

  const monthlyRevenue = matched.reduce((sum, client) => {
    const paid = input.paidByClientId[client.id] ?? 0;
    if (monthKey(client.joinDate) === currentMonth) {
      return sum + paid;
    }
    return sum;
  }, 0);

  const completed = matched.filter(
    (c) => c.status === "active" || c.status === "success_case"
  ).length;

  const closeRate =
    input.totalCallsCount > 0
      ? Math.round((input.closedCallsCount / input.totalCallsCount) * 100)
      : 0;

  return {
    monthlyRevenue:
      monthlyRevenue > 0 ? `$${monthlyRevenue.toLocaleString("es-AR")}` : EMPTY_LABEL,
    closeRate: matched.length > 0 ? closeRate : 0,
    topObjection: input.topOrgObjection?.trim() || EMPTY_LABEL,
    completionRate:
      matched.length > 0 ? Math.round((completed / matched.length) * 100) : 0,
  };
}

export function computeLadderStepMetrics(
  productName: string,
  input: ProductMetricsInput
): Pick<ValueLadderStep, "closesPerMonth" | "closeRate"> {
  const matched = clientsForProduct(productName, input.clients);
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const closesThisMonth = matched.filter(
    (c) => monthKey(c.joinDate) === currentMonth
  ).length;

  const closeRate =
    input.totalCallsCount > 0
      ? Math.round((input.closedCallsCount / input.totalCallsCount) * 100)
      : 0;

  return {
    closesPerMonth: matched.length > 0 ? String(closesThisMonth) : EMPTY_LABEL,
    closeRate: matched.length > 0 ? closeRate : 0,
  };
}

export function buildAvatarInsights(
  avatar: ProductAvatar,
  topOrgObjection?: string
): string[] {
  const insights: string[] = [];
  if (avatar.objections.length > 0) {
    insights.push(
      `Objeciones del avatar: ${avatar.objections.map((o) => o.text).slice(0, 3).join("; ")}`
    );
  }
  if (topOrgObjection?.trim()) {
    insights.push(`Objeción frecuente en ventas: ${topOrgObjection}`);
  }
  return insights;
}
