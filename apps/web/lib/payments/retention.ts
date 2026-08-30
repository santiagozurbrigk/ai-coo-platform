/**
 * lib/payments/retention.ts
 *
 * M32 (`purchases_per_customer`) y M33 (`retention_rate`) — unidad I-9.
 *
 * Son las dos medidas que faltaban para **LTV**, y por lo tanto para **LTV:CAC**,
 * una de las dos ratios que el documento fuente llama decisivas:
 *
 *   "every funnel is judged on EPL vs CPL to know if it works and LTV vs CAC to
 *    know if it scales."
 *
 * No hay integración nueva: salen de `payment_orders` y `payment_transactions`,
 * que I-2 ya puebla. Toda esta unidad es cálculo.
 *
 * Puro: se testea sin base de datos.
 *
 * ⚠️ **Las definiciones son una interpretación, no una cita.** El documento
 * escribe la fórmula `LTV = AOV × purchases × retention` y no define qué cuenta
 * como "purchases" ni como "retention". Lo que se eligió acá, y por qué, está en
 * cada función. Va a `docs/PLAN_VERIFICACION.md` para contrastarlo contra el
 * número que el cliente ya usa.
 */

import { customerKey } from "./aggregate";

/**
 * Ventana hacia atrás para medir cuántas veces compra un cliente.
 *
 * ⭐ **No se puede medir dentro del período del embudo.** En una ventana de 7
 * días casi todo cliente tiene exactamente una compra, así que M32 daría ~1.0 y
 * el LTV colapsaría al AOV. "Cuántas veces compra un cliente" es una propiedad
 * lenta del negocio, no una métrica semanal: se mide sobre un año.
 */
export const RETENTION_LOOKBACK_DAYS = 365;

export type RetentionOrderRow = {
  customer_external_id: string | null;
  customer_email: string | null;
  is_recurring: boolean | null;
  ordered_at: string;
};

export type RetentionTransactionRow = {
  customer_external_id: string | null;
  customer_email: string | null;
  kind: "payment" | "refund";
  occurred_at: string;
};

export type RetentionMeasures = {
  /** M32 — compras promedio por cliente en la ventana. */
  purchasesPerCustomer: number | null;
  /** Por qué M32 no se pudo calcular. */
  purchasesReason: "no_orders" | "no_identifiable_customers" | null;
  /** M33 — fracción de la cohorte recurrente que siguió pagando. */
  retentionRate: number | null;
  /** Por qué M33 no se pudo calcular. */
  retentionReason: "no_recurring" | "no_cohort" | null;
  /** Sobre cuántos clientes se midió la retención. Para poder decirlo en la UI. */
  cohortSize: number;
};

/**
 * M32 — compras por cliente.
 *
 * Numerador y denominador se calculan **sobre el mismo conjunto**: las órdenes
 * sin comprador identificable se excluyen de las dos. Contarlas arriba y no
 * abajo inflaría el promedio; contarlas abajo como clientes distintos lo
 * hundiría. Sin identidad, la orden simplemente no participa.
 */
export function computePurchasesPerCustomer(orders: RetentionOrderRow[]): {
  value: number | null;
  reason: RetentionMeasures["purchasesReason"];
} {
  if (orders.length === 0) return { value: null, reason: "no_orders" };

  const customers = new Set<string>();
  let identifiedOrders = 0;

  for (const order of orders) {
    const key = customerKey(order);
    if (!key) continue;
    customers.add(key);
    identifiedOrders += 1;
  }

  // Hay órdenes pero ninguna dice quién compró: el promedio no existe.
  if (customers.size === 0) {
    return { value: null, reason: "no_identifiable_customers" };
  }

  return { value: identifiedOrders / customers.size, reason: null };
}

/**
 * M33 — retención.
 *
 * **La cohorte** son los clientes con una orden recurrente que empezó **antes**
 * del período. **La retención** es qué fracción de ellos registró un pago
 * *dentro* del período.
 *
 * Para el negocio de Santiago esto es concreto: una orden recurrente es un plan
 * de cuotas, y la retención responde "¿las cuotas se siguen pagando?".
 *
 * ⭐ **Dos casos que devuelven `null` y no un número:**
 *
 * - `no_recurring` — la org no tiene ninguna orden recurrente. La retención no
 *   aplica a un negocio de pago único. Devolver `0` sería catastrófico: el LTV
 *   multiplica por este factor y quedaría en cero. Devolver `1` sería inventar
 *   una retención perfecta que nadie midió.
 * - `no_cohort` — hay órdenes recurrentes pero todas empezaron dentro del
 *   período. No hay nadie de quien preguntarse si siguió pagando: es demasiado
 *   pronto para saberlo.
 *
 * Un reembolso no cuenta como pago: la fila `kind = 'refund'` se ignora.
 */
export function computeRetentionRate(
  /** Órdenes de la ventana, con su fecha y si son recurrentes. */
  lookbackOrders: RetentionOrderRow[],
  /** Transacciones del período. */
  periodTransactions: RetentionTransactionRow[],
  periodStartIso: string
): { value: number | null; reason: RetentionMeasures["retentionReason"]; cohortSize: number } {
  const recurring = lookbackOrders.filter((order) => order.is_recurring === true);
  if (recurring.length === 0) {
    return { value: null, reason: "no_recurring", cohortSize: 0 };
  }

  const cohort = new Set<string>();
  for (const order of recurring) {
    if (order.ordered_at >= periodStartIso) continue;
    const key = customerKey(order);
    if (key) cohort.add(key);
  }

  if (cohort.size === 0) {
    return { value: null, reason: "no_cohort", cohortSize: 0 };
  }

  const paidInPeriod = new Set<string>();
  for (const tx of periodTransactions) {
    if (tx.kind !== "payment") continue;
    const key = customerKey(tx);
    if (key && cohort.has(key)) paidInPeriod.add(key);
  }

  return { value: paidInPeriod.size / cohort.size, reason: null, cohortSize: cohort.size };
}

/** Calcula M32 y M33 juntas. */
export function computeRetentionMeasures(
  lookbackOrders: RetentionOrderRow[],
  periodTransactions: RetentionTransactionRow[],
  periodStartIso: string
): RetentionMeasures {
  const purchases = computePurchasesPerCustomer(lookbackOrders);
  const retention = computeRetentionRate(lookbackOrders, periodTransactions, periodStartIso);

  return {
    purchasesPerCustomer: purchases.value,
    purchasesReason: purchases.reason,
    retentionRate: retention.value,
    retentionReason: retention.reason,
    cohortSize: retention.cohortSize,
  };
}

/** Inicio de la ventana de análisis, contando hacia atrás desde el fin del período. */
export function retentionLookbackStart(
  periodEndIso: string,
  days: number = RETENTION_LOOKBACK_DAYS
): string {
  const end = new Date(periodEndIso);
  if (Number.isNaN(end.getTime())) return periodEndIso;
  end.setUTCDate(end.getUTCDate() - days);
  return end.toISOString();
}
