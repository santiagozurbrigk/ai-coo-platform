/**
 * lib/payments/normalize.ts
 *
 * Traduce los webhooks de Whop y Fanbasis al modelo normalizado.
 *
 * ⚠️ EL MAPEO DE CAMPOS NO ESTÁ VERIFICADO CONTRA LAS APIS REALES.
 *
 * Los sitios de documentación de ambos proveedores no son alcanzables desde el
 * entorno de desarrollo, así que los nombres de campo de acá abajo son una
 * lectura razonable de sus modelos publicados, no una transcripción de sus
 * specs. Por eso:
 *
 *  1. Cada extractor acepta varios nombres plausibles para el mismo dato.
 *  2. Lo que no se entiende devuelve `unmapped` con un motivo, nunca un número
 *     inventado ni un cero.
 *  3. El webhook crudo se persiste SIEMPRE en `payment_webhook_events` antes de
 *     pasar por acá, así que el primer evento real de cada proveedor es la
 *     fuente de verdad para corregir este archivo.
 *
 * Al corregirlo con payloads reales, borrar los nombres de campo que sobren y
 * quitar esta advertencia.
 *
 * Todo lo de este archivo es puro: se testea sin red ni base de datos.
 */

import type {
  NormalizedEvent,
  NormalizedOrder,
  NormalizedTransaction,
  PaymentProvider,
} from "./types";

type Json = Record<string, unknown>;

// ─── Extractores tolerantes ───────────────────────────────────────────────────

function asRecord(value: unknown): Json | null {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Json)
    : null;
}

/** Busca la primera clave presente con valor no vacío. */
function pick(source: Json, keys: string[]): unknown {
  for (const key of keys) {
    const value = source[key];
    if (value !== undefined && value !== null && value !== "") return value;
  }
  return undefined;
}

function pickString(source: Json, keys: string[]): string | null {
  const value = pick(source, keys);
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  return null;
}

function pickBoolean(source: Json, keys: string[]): boolean {
  return pick(source, keys) === true;
}

/**
 * Montos.
 *
 * Devuelve `null` si no se puede leer un número — nunca 0. Un cobro cuyo monto
 * no se entiende NO es un cobro de cero.
 *
 * Muchas plataformas de pago envían el monto en centavos. Las claves que
 * terminan en `_cents` o `_in_cents` se dividen por 100; el resto se toma tal
 * cual.
 */
export function pickAmount(source: Json, keys: string[]): number | null {
  for (const key of keys) {
    const raw = source[key];
    if (raw === undefined || raw === null || raw === "") continue;

    const parsed = typeof raw === "string" ? Number(raw) : raw;
    if (typeof parsed !== "number" || !Number.isFinite(parsed)) continue;

    const isCents = /_?(cents|in_cents)$/i.test(key);
    return isCents ? parsed / 100 : parsed;
  }
  return null;
}

/** Fechas. Acepta ISO y epoch en segundos o milisegundos. */
export function pickTimestamp(source: Json, keys: string[]): string | null {
  for (const key of keys) {
    const raw = source[key];
    if (raw === undefined || raw === null || raw === "") continue;

    if (typeof raw === "number") {
      // Menos de 10^12 es epoch en segundos; por encima, milisegundos.
      const ms = raw < 1_000_000_000_000 ? raw * 1000 : raw;
      const date = new Date(ms);
      if (!Number.isNaN(date.getTime())) return date.toISOString();
      continue;
    }

    if (typeof raw === "string") {
      const numeric = Number(raw);
      if (Number.isFinite(numeric) && raw.trim() !== "") {
        const ms = numeric < 1_000_000_000_000 ? numeric * 1000 : numeric;
        const date = new Date(ms);
        if (!Number.isNaN(date.getTime())) return date.toISOString();
      }
      const date = new Date(raw);
      if (!Number.isNaN(date.getTime())) return date.toISOString();
    }
  }
  return null;
}

// ─── Claves candidatas ────────────────────────────────────────────────────────

const KEYS = {
  eventId: ["id", "event_id", "eventId"],
  eventType: ["type", "event", "event_type", "eventType", "action"],
  externalId: ["id", "transaction_id", "transactionId", "payment_id", "paymentId"],
  orderId: ["order_id", "orderId", "membership_id", "membershipId", "checkout_id", "checkoutId"],
  customerId: ["user_id", "userId", "customer_id", "customerId", "client_id", "clientId"],
  email: ["email", "customer_email", "customerEmail", "user_email", "userEmail"],
  amount: [
    "amount",
    "amount_cents",
    "final_amount",
    "total",
    "total_amount",
    "subtotal",
    "settled_amount",
    "value",
  ],
  contractValue: [
    "contract_value",
    "total_contract_value",
    "plan_total",
    "total_amount",
    "initial_price",
    "price",
    "amount",
  ],
  currency: ["currency", "currency_code", "iso_currency_code"],
  productName: ["product_name", "productName", "plan_name", "planName", "product", "title"],
  recurring: ["is_recurring", "recurring", "isRecurring", "is_subscription"],
  status: ["status", "state"],
  occurredAt: ["created_at", "createdAt", "paid_at", "paidAt", "timestamp", "occurred_at", "date"],
} as const;

/** Tipos de evento que cuentan como cobro, por proveedor. */
const PAYMENT_EVENTS = /payment.*(succe|complet|paid|success)|charge.*(succe|complet)|transaction.*(succe|complet|paid)/i;
/** Tipos de evento que cuentan como reembolso. */
const REFUND_EVENTS = /refund|chargeback|dispute.*(won|lost)|reversal/i;
/** Tipos de evento que crean o actualizan una orden. */
const ORDER_EVENTS = /membership.*(went_valid|created|activat)|order.*(creat|complet)|subscription.*(creat|activat)|checkout.*(complet)/i;

// ─── Normalizador ─────────────────────────────────────────────────────────────

/** Extrae el id del evento, para deduplicar reentregas del webhook. */
export function extractEventId(body: Json): string | null {
  return pickString(body, [...KEYS.eventId]);
}

/** Extrae el tipo de evento. */
export function extractEventType(body: Json): string | null {
  return pickString(body, [...KEYS.eventType]);
}

/**
 * El payload útil suele venir anidado bajo `data`, `object` o `payload`. Si no
 * hay ninguno, el cuerpo entero es el dato.
 */
export function extractData(body: Json): Json {
  for (const key of ["data", "object", "payload", "resource"]) {
    const nested = asRecord(body[key]);
    if (nested) {
      // Algunas plataformas anidan dos veces: { data: { object: {...} } }
      const doubleNested = asRecord(nested.object) ?? asRecord(nested.data);
      return doubleNested ?? nested;
    }
  }
  return body;
}

export function normalizeWebhook(
  provider: PaymentProvider,
  body: Json
): NormalizedEvent {
  const eventType = extractEventType(body) ?? "";
  const data = extractData(body);

  const externalId = pickString(data, [...KEYS.externalId]);
  if (!externalId) {
    return { kind: "unmapped", reason: "El evento no trae un id identificable" };
  }

  const currency = (pickString(data, [...KEYS.currency]) ?? "USD").toUpperCase();
  const customerExternalId = pickString(data, [...KEYS.customerId]);
  const customerEmail = pickString(data, [...KEYS.email]);

  if (REFUND_EVENTS.test(eventType)) {
    return buildTransaction("refund", data, {
      externalId,
      currency,
      customerExternalId,
      customerEmail,
    });
  }

  if (PAYMENT_EVENTS.test(eventType)) {
    return buildTransaction("payment", data, {
      externalId,
      currency,
      customerExternalId,
      customerEmail,
    });
  }

  if (ORDER_EVENTS.test(eventType)) {
    const contractValue = pickAmount(data, [...KEYS.contractValue]);
    const orderedAt = pickTimestamp(data, [...KEYS.occurredAt]);

    if (contractValue === null) {
      return { kind: "unmapped", reason: `Orden "${eventType}" sin valor contratado legible` };
    }
    if (!orderedAt) {
      return { kind: "unmapped", reason: `Orden "${eventType}" sin fecha legible` };
    }

    const order: NormalizedOrder = {
      externalId,
      customerExternalId,
      customerEmail,
      contractValue,
      currency,
      productName: pickString(data, [...KEYS.productName]),
      isRecurring: pickBoolean(data, [...KEYS.recurring]),
      status: pickString(data, [...KEYS.status]),
      orderedAt,
    };
    return { kind: "order", order };
  }

  return {
    kind: "unmapped",
    reason: eventType
      ? `Tipo de evento no contemplado: "${eventType}"`
      : "El evento no declara tipo",
  };
}

function buildTransaction(
  kind: "payment" | "refund",
  data: Json,
  base: {
    externalId: string;
    currency: string;
    customerExternalId: string | null;
    customerEmail: string | null;
  }
): NormalizedEvent {
  const amount = pickAmount(data, [...KEYS.amount]);
  if (amount === null) {
    return { kind: "unmapped", reason: `Movimiento "${kind}" sin monto legible` };
  }

  const occurredAt = pickTimestamp(data, [...KEYS.occurredAt]);
  if (!occurredAt) {
    return { kind: "unmapped", reason: `Movimiento "${kind}" sin fecha legible` };
  }

  const transaction: NormalizedTransaction = {
    externalId: base.externalId,
    orderExternalId: pickString(data, [...KEYS.orderId]),
    customerExternalId: base.customerExternalId,
    customerEmail: base.customerEmail,
    kind,
    // Siempre positivo: el signo lo da `kind`.
    amount: Math.abs(amount),
    currency: base.currency,
    occurredAt,
  };
  return { kind: "transaction", transaction };
}
