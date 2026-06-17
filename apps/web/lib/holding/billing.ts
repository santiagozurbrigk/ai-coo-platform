export type HoldingBillingModel = "revenue_share" | "fixed_fee";

export type HoldingOnboardingData = {
  kind: "holding";
  billingModel: HoldingBillingModel;
  businessCount: number;
};

export function isHoldingOnboardingData(
  data: unknown
): data is HoldingOnboardingData {
  return (
    typeof data === "object" &&
    data !== null &&
    (data as HoldingOnboardingData).kind === "holding"
  );
}

export function computeHoldingRevenue(input: {
  billingModel: HoldingBillingModel | null | undefined;
  mrr: number;
  revenueSharePct?: number | null;
  fixedFeeAmount?: number | null;
}): number {
  if (input.billingModel === "fixed_fee") {
    return Number(input.fixedFeeAmount ?? 0);
  }
  const sharePct = Number(input.revenueSharePct ?? 0);
  return sharePct > 0 ? input.mrr * (sharePct / 100) : 0;
}

export function formatFixedFee(
  amount: number,
  currency: string | null | undefined
): string {
  const code = currency ?? "USD";
  if (code === "ARS") {
    return `$${amount.toLocaleString("es-AR")} ARS/mes`;
  }
  return `$${amount.toLocaleString("en-US")} ${code}/mes`;
}
