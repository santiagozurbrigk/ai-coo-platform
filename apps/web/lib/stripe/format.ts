export function formatStripeMoney(amountCents: number, currency: string): string {
  const code = currency.toUpperCase();
  const zeroDecimal = new Set(["bif", "clp", "djf", "gnf", "jpy", "kmf", "krw", "mga", "pyg", "rwf", "ugx", "vnd", "vuv", "xaf", "xof", "xpf"]);
  const value = zeroDecimal.has(code.toLowerCase()) ? amountCents : amountCents / 100;

  try {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: code,
      maximumFractionDigits: zeroDecimal.has(code.toLowerCase()) ? 0 : 2,
    }).format(value);
  } catch {
    return `${value} ${code}`;
  }
}

export function formatStripeDate(unixSeconds: number): string {
  return new Date(unixSeconds * 1000).toLocaleString("es", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
