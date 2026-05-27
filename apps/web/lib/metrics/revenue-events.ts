import type { Client, ClientInstallment } from "@/types/clients";
import type { PaymentPlatform } from "@/types/closing";
import {
  isDateInRange,
  type ResolvedRevenuePeriod,
} from "@/lib/metrics/revenue-period";

export type RevenueEventSource =
  | "upfront"
  | "installment"
  | "upfront_portion"
  | "recurring_fee";

export type RevenueEvent = {
  amount: number;
  /** Fecha en que el dinero ingresó (YYYY-MM-DD). */
  date: string;
  clientId: string;
  clientName: string;
  platform: PaymentPlatform;
  source: RevenueEventSource;
  installmentId?: string;
  installmentLabel?: string;
};

/**
 * Fecha de cobro de una cuota pagada.
 * Sin `paidAt` no se atribuye a ningún período (evita contar en el mes actual por error).
 */
export function getInstallmentPaidAt(
  inst: ClientInstallment,
  client: Client,
  index: number
): string | null {
  if (inst.status !== "paid") return null;
  if (inst.paidAt) return inst.paidAt.slice(0, 10);
  if (index === 0) return client.joinDate.slice(0, 10);
  return null;
}

export function collectRevenueEvents(clients: Client[]): RevenueEvent[] {
  const events: RevenueEvent[] = [];

  for (const client of clients) {
    const base = {
      clientId: client.id,
      clientName: client.name,
      platform: client.platform,
    };

    if (client.paymentType === "upfront") {
      events.push({
        ...base,
        amount: client.totalAmount,
        date: client.joinDate.slice(0, 10),
        source: "upfront",
      });
      continue;
    }

    if (client.paymentType === "upfront_fee") {
      if (client.upfrontAmount && client.upfrontAmount > 0) {
        events.push({
          ...base,
          amount: client.upfrontAmount,
          date: client.joinDate.slice(0, 10),
          source: "upfront_portion",
        });
      }
      (client.installments ?? []).forEach((inst, index) => {
        const paidAt = getInstallmentPaidAt(inst, client, index);
        if (!paidAt) return;
        events.push({
          ...base,
          amount: inst.amount,
          date: paidAt,
          source: "recurring_fee",
          installmentId: inst.id,
          installmentLabel: inst.label,
        });
      });
      continue;
    }

    (client.installments ?? []).forEach((inst, index) => {
      const paidAt = getInstallmentPaidAt(inst, client, index);
      if (!paidAt) return;
      events.push({
        ...base,
        amount: inst.amount,
        date: paidAt,
        source: "installment",
        installmentId: inst.id,
        installmentLabel: inst.label,
      });
    });
  }

  return events;
}

export function filterRevenueEvents(
  events: RevenueEvent[],
  period: ResolvedRevenuePeriod
): RevenueEvent[] {
  return events.filter((e) => isDateInRange(e.date, period));
}

export function sumRevenueInPeriod(
  clients: Client[],
  period: ResolvedRevenuePeriod
): number {
  const events = filterRevenueEvents(collectRevenueEvents(clients), period);
  return events.reduce((sum, e) => sum + e.amount, 0);
}

/** Total histórico cobrado (sin filtro de período). */
export function sumAllRecognizedRevenue(clients: Client[]): number {
  return collectRevenueEvents(clients).reduce((sum, e) => sum + e.amount, 0);
}
