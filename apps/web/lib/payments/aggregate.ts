/**
 * lib/payments/aggregate.ts
 *
 * Calcula las medidas de dinero que pide el documento fuente a partir de las
 * órdenes y transacciones normalizadas.
 *
 * Puro: se testea sin base de datos.
 *
 * Cubre M26 (orders), M27 (revenue), M28 (cash collected), M29 (contracted
 * value), M30 (refunds) y M31 (new customers) del mapa de fuentes.
 */

export type OrderRow = {
  external_id: string;
  customer_external_id: string | null;
  customer_email: string | null;
  contract_value: number | string;
  ordered_at: string;
};

export type TransactionRow = {
  external_id: string;
  customer_external_id: string | null;
  customer_email: string | null;
  kind: "payment" | "refund";
  amount: number | string;
  occurred_at: string;
};

export type PaymentMeasures = {
  /** M26 — cantidad de órdenes del período. */
  orders: number;
  /** M29 — suma de lo contratado. Es la promesa, no el dinero. */
  contractedValue: number;
  /** M28 — dinero que entró menos reembolsos. Es lo que paga la cuenta de ads. */
  cashCollected: number;
  /** M27 — revenue reconocido. Igual a cash collected: sólo cuenta lo cobrado. */
  revenue: number;
  /** M30 — total reembolsado en el período, positivo. */
  refunds: number;
  /** M31 — compradores distintos con al menos una orden en el período. */
  newCustomers: number;
};

function numeric(value: number | string): number {
  const parsed = typeof value === "string" ? Number(value) : value;
  return typeof parsed === "number" && Number.isFinite(parsed) ? parsed : 0;
}

/**
 * Identidad del comprador.
 *
 * Se prefiere el id del proveedor y se cae al email normalizado. Sin ninguno de
 * los dos, la fila no puede contarse como cliente distinto y se ignora para
 * `newCustomers` — contar cada compra anónima como un cliente nuevo inflaría el
 * CAC hacia abajo, que es el error más caro posible acá.
 */
export function customerKey(row: {
  customer_external_id: string | null;
  customer_email: string | null;
}): string | null {
  if (row.customer_external_id) return `id:${row.customer_external_id}`;
  if (row.customer_email) return `email:${row.customer_email.trim().toLowerCase()}`;
  return null;
}

/**
 * Agrega órdenes y transacciones a las medidas del documento.
 *
 * Devuelve `null` cuando no hay NINGUNA fila de ninguna de las dos tablas: sin
 * datos no se puede afirmar que se cobró cero (§9.1). Con al menos una fila, los
 * ceros que salgan son reales.
 */
export function aggregatePayments(
  orders: OrderRow[],
  transactions: TransactionRow[]
): PaymentMeasures | null {
  if (orders.length === 0 && transactions.length === 0) return null;

  let paid = 0;
  let refunds = 0;

  for (const tx of transactions) {
    const amount = Math.abs(numeric(tx.amount));
    if (tx.kind === "refund") refunds += amount;
    else paid += amount;
  }

  const contractedValue = orders.reduce((sum, o) => sum + numeric(o.contract_value), 0);

  const customers = new Set<string>();
  for (const order of orders) {
    const key = customerKey(order);
    if (key) customers.add(key);
  }

  // Los reembolsos se restan del cobrado: el documento pide el neto, porque es
  // lo que efectivamente queda en la cuenta.
  const cashCollected = paid - refunds;

  return {
    orders: orders.length,
    contractedValue,
    cashCollected,
    revenue: cashCollected,
    refunds,
    newCustomers: customers.size,
  };
}
