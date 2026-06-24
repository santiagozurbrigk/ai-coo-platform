export function formatMercadoPagoMoney(amount: number, currency: string): string {
  const code = currency.toUpperCase();

  try {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: code,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${amount.toLocaleString("es-AR")} ${code}`;
  }
}

export function formatMercadoPagoDate(iso: string): string {
  return new Date(iso).toLocaleString("es", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
