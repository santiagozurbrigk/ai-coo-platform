export function formatMoney(amount: number, currency = "USD") {
  // Usar es-AR en todos los casos: símbolo antes del número ("US$ 12.500"),
  // punto como separador de miles y coma como decimal — convención argentina.
  // es-ES ponía el símbolo al final ("12.500 US$") que se confunde con "12,50".
  if (currency === "ARS") {
    return `$${Math.round(amount).toLocaleString("es-AR")}`;
  }
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function monthlyEquivalent(
  amount: number,
  frequency: "monthly" | "annual"
): number {
  return frequency === "annual" ? amount / 12 : amount;
}
