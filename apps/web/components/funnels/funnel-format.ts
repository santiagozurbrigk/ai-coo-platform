/**
 * Formateo de valores de embudo.
 *
 * Un valor `null` NUNCA se muestra como "0". Se muestra como "—" con el
 * significado de "sin datos", que es distinto de un cero real
 * (docs/FUNNELS_ARCHITECTURE.md §9.1).
 */

import type { MetricUnit } from "@/lib/funnels";

export const NO_DATA = "—";

export function formatFunnelValue(
  value: number | null,
  unit: MetricUnit,
  currency = "USD"
): string {
  if (value === null || Number.isNaN(value)) return NO_DATA;

  switch (unit) {
    case "percentage":
      return `${value.toFixed(1).replace(".", ",")}%`;
    case "currency":
      return new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency,
        maximumFractionDigits: 0,
      }).format(value);
    case "ratio":
      return value.toFixed(2).replace(".", ",");
    case "count":
    default:
      return Math.round(value).toLocaleString("es-AR");
  }
}

export function formatCount(value: number | null): string {
  return value === null ? NO_DATA : Math.round(value).toLocaleString("es-AR");
}

export function formatRate(value: number | null): string {
  return value === null ? NO_DATA : `${Math.round(value)}%`;
}
