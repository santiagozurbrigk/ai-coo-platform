import { rowToClient, type ClientRow } from "@/lib/clients/mapper";
import {
  collectRevenueEvents,
  filterRevenueEvents,
} from "@/lib/metrics/revenue-events";
import {
  resolveRevenueDateRange,
  type ResolvedRevenuePeriod,
} from "@/lib/metrics/revenue-period";
import type { DateRangeIso } from "@/lib/super-admin/period";

function toResolvedPeriod(range: DateRangeIso): ResolvedRevenuePeriod {
  const start = new Date(range.start);
  const end = new Date(range.end);
  const dayCount =
    Math.floor(
      (end.getTime() - start.getTime()) / 86_400_000
    ) + 1;
  return {
    start,
    end,
    label: "",
    dayCount: Math.max(1, dayCount),
  };
}

export function sumBillingInRange(
  clientRows: ClientRow[],
  range: DateRangeIso
): number {
  const clients = clientRows.map(rowToClient);
  const events = collectRevenueEvents(clients);
  const period = toResolvedPeriod(range);
  return filterRevenueEvents(events, period).reduce((s, e) => s + e.amount, 0);
}

export function sumCashCollectedInRange(
  clientRows: ClientRow[],
  range: DateRangeIso
): number {
  return sumBillingInRange(clientRows, range);
}

export function countByOrg(
  rows: { organization_id: string }[]
): Map<string, number> {
  const map = new Map<string, number>();
  for (const row of rows) {
    map.set(row.organization_id, (map.get(row.organization_id) ?? 0) + 1);
  }
  return map;
}

export function formatUsd(amount: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatUsdPrecise(amount: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/** Para métricas de finanzas con preset month. */
export function monthRangeAsRevenuePreset(range: DateRangeIso) {
  const start = range.start.slice(0, 10);
  return resolveRevenueDateRange({ preset: "month", anchor: start });
}

/** Columnas mínimas de `clients` para cálculo de facturación en Super Admin. */
export const CLIENT_BILLING_SELECT =
  "id, organization_id, name, nickname, join_date, payment_type, platform, total_amount, upfront_amount, fee_amount, fee_frequency, status, is_success_case, installments";
