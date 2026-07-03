import type { Client, ClientInstallment, ClientPayment } from "@/types/clients";
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
  /** @deprecated Usar paymentDestinationPlatformId */
  platform: PaymentPlatform;
  paymentDestinationPlatformId?: string;
  paymentReceivedFrom?: string;
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

function sourceFromPayment(
  client: Client | undefined,
  payment: ClientPayment
): RevenueEventSource {
  if (payment.installmentNumber != null && payment.installmentNumber > 1) {
    if (client?.paymentType === "upfront_fee") return "recurring_fee";
    return "installment";
  }
  if (client?.paymentType === "upfront_fee") return "upfront_portion";
  if (client?.paymentType === "installments") return "installment";
  return "upfront";
}

function collectRevenueEventsFromPayments(
  clients: Client[],
  payments: ClientPayment[]
): RevenueEvent[] {
  const clientById = new Map(clients.map((c) => [c.id, c]));

  return payments.map((payment) => {
    const client = clientById.get(payment.clientId);
    return {
      amount: payment.amount,
      date: payment.paymentDate.slice(0, 10),
      clientId: payment.clientId,
      clientName: client?.name ?? "Cliente",
      platform: client?.platform ?? "other",
      paymentDestinationPlatformId: payment.paymentDestinationPlatformId,
      paymentReceivedFrom: payment.paymentReceivedFrom,
      source: sourceFromPayment(client, payment),
      installmentLabel:
        payment.installmentNumber != null
          ? `Cuota ${payment.installmentNumber}`
          : undefined,
    };
  });
}

function collectRevenueEventsFromClients(clients: Client[]): RevenueEvent[] {
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

export function collectRevenueEvents(
  clients: Client[],
  payments?: ClientPayment[]
): RevenueEvent[] {
  if (payments && payments.length > 0) {
    return collectRevenueEventsFromPayments(clients, payments);
  }
  return collectRevenueEventsFromClients(clients);
}

export function filterRevenueEvents(
  events: RevenueEvent[],
  period: ResolvedRevenuePeriod
): RevenueEvent[] {
  return events.filter((e) => isDateInRange(e.date, period));
}

export function sumRevenueInPeriod(
  clients: Client[],
  period: ResolvedRevenuePeriod,
  payments?: ClientPayment[]
): number {
  const events = filterRevenueEvents(
    collectRevenueEvents(clients, payments),
    period
  );
  return events.reduce((sum, e) => sum + e.amount, 0);
}

/** Total histórico cobrado (sin filtro de período). */
export function sumAllRecognizedRevenue(
  clients: Client[],
  payments?: ClientPayment[]
): number {
  return collectRevenueEvents(clients, payments).reduce(
    (sum, e) => sum + e.amount,
    0
  );
}
