/**
 * lib/payments/types.ts
 *
 * Modelo normalizado de pagos, independiente del proveedor.
 *
 * El documento fuente asigna la etapa Cash a **Whop / Fanbasis** (§05), y separa
 * explícitamente lo contratado de lo cobrado:
 *
 *   "Contracted revenue is a promise; cash collected pays the ad account."
 *
 * Por eso hay dos entidades y no una: la orden es el compromiso, la transacción
 * es el dinero que se movió.
 */

export const PAYMENT_PROVIDERS = ["whop", "fanbasis"] as const;
export type PaymentProvider = (typeof PAYMENT_PROVIDERS)[number];

export function isPaymentProvider(value: string): value is PaymentProvider {
  return (PAYMENT_PROVIDERS as readonly string[]).includes(value);
}

/** El compromiso de compra. Alimenta M26 (orders) y M29 (contracted value). */
export type NormalizedOrder = {
  externalId: string;
  customerExternalId: string | null;
  customerEmail: string | null;
  contractValue: number;
  currency: string;
  productName: string | null;
  isRecurring: boolean;
  status: string | null;
  orderedAt: string;
};

/**
 * El dinero real. Alimenta M27 (revenue), M28 (cash collected) y M30 (refunds).
 *
 * `amount` es SIEMPRE positivo: el signo lo determina `kind`. Un reembolso con
 * monto negativo y kind 'refund' se restaría dos veces.
 */
export type NormalizedTransaction = {
  externalId: string;
  orderExternalId: string | null;
  customerExternalId: string | null;
  customerEmail: string | null;
  kind: "payment" | "refund";
  amount: number;
  currency: string;
  occurredAt: string;
};

/**
 * Resultado de interpretar un webhook.
 *
 * `unmapped` no es un error: es un evento válido cuyo tipo no nos interesa, o
 * cuyo shape todavía no sabemos leer. Se guarda igual para poder reprocesarlo
 * cuando el mapeo se corrija.
 */
export type NormalizedEvent =
  | { kind: "order"; order: NormalizedOrder }
  | { kind: "transaction"; transaction: NormalizedTransaction }
  | { kind: "unmapped"; reason: string };
