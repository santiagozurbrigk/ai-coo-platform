export function formatMoney(amount: number, currency = "USD") {
  if (currency === "ARS") {
    return `$${amount.toLocaleString("es-AR")} ARS`;
  }
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function monthlyEquivalent(
  amount: number,
  frequency: "monthly" | "annual"
): number {
  return frequency === "annual" ? amount / 12 : amount;
}
