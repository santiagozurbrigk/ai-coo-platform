/**
 * lib/payments/normalize.ts
 *
 * Traduce los webhooks de Whop y Fanbasis al modelo normalizado.
 *
 * VERIFICADO el 2026-08-30 contra la documentación local:
 *   - docs/external-apis/whop/RESUMEN-OTC.md
 *   - docs/external-apis/commas/RESUMEN-OTC.md
 *
 * Los dos proveedores usan convenciones OPUESTAS en casi todo, así que el mapeo
 * es por proveedor y no por heurística global:
 *
 * | | Whop | Commas (ex Fanbasis) |
 * |---|---|---|
 * | Montos | decimales en la moneda (10.43 = $10.43) | **enteros en centavos** |
 * | Monto cobrado | `settlement_amount` | `amount_cents` |
 * | Entrega | at least once, con reintentos | **at most once, sin reintentos** |
 * | Firma | Standard Webhooks | HMAC-SHA256 hex simple |
 *
 * Lo que no se entiende devuelve `unmapped` con su motivo, nunca un número
 * inventado ni un cero. El webhook crudo se persiste igual en
 * `payment_webhook_events` antes de pasar por acá.
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
 * La conversión de centavos NO se infiere del nombre del campo: se decide por
 * proveedor. Whop manda decimales en la moneda ("10.43 for $10.43 USD") y Commas
 * manda enteros en centavos ("2999 = $29.99"). Adivinar por sufijo haría que un
 * campo nuevo sin `_cents` se colara como si fuera unidad.
 */
export function pickAmount(
  source: Json,
  keys: string[],
  unit: AmountUnit = "decimal"
): number | null {
  for (const key of keys) {
    const raw = source[key];
    if (raw === undefined || raw === null || raw === "") continue;

    const parsed = typeof raw === "string" ? Number(raw) : raw;
    if (typeof parsed !== "number" || !Number.isFinite(parsed)) continue;

    return unit === "cents" ? parsed / 100 : parsed;
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

// ─── Configuración por proveedor ──────────────────────────────────────────────

/** Cómo expresa los montos cada proveedor. */
export type AmountUnit = "decimal" | "cents";

type ProviderConfig = {
  amountUnit: AmountUnit;
  /** Claves de monto, en orden de preferencia. La primera que exista gana. */
  amountKeys: string[];
  /** Claves del valor contratado total. */
  contractKeys: string[];
  /** Tipos de evento literales. Sin regex: los nombres reales están documentados. */
  paymentEvents: string[];
  refundEvents: string[];
  orderEvents: string[];
};

const PROVIDER_CONFIG: Record<PaymentProvider, ProviderConfig> = {
  whop: {
    // "The refunded amount as a decimal in the specified currency, such as
    //  10.43 for $10.43 USD".
    amountUnit: "decimal",
    // `settlement_amount` es "the total amount charged to the customer", que es
    // lo que el documento fuente llama cash collected. `total` y `subtotal` son
    // "to show to the creator (excluding buyer fees)": otra cosa.
    amountKeys: ["settlement_amount", "amount", "usd_total", "total", "subtotal"],
    contractKeys: ["total", "usd_total", "settlement_amount"],
    paymentEvents: ["payment.succeeded"],
    refundEvents: ["refund.created", "refund.updated"],
    // `membership.created` NO existe en Whop; el alta es `membership.activated`.
    orderEvents: ["membership.activated", "invoice.paid"],
  },
  fanbasis: {
    // "Price in cents (e.g., 2999 = $29.99)".
    amountUnit: "cents",
    amountKeys: ["amount_cents", "amount", "total_price", "unit_price"],
    contractKeys: ["amount_cents", "amount"],
    paymentEvents: ["payment.succeeded", "product.purchased", "subscription.renewed"],
    refundEvents: ["refund.created"],
    orderEvents: ["subscription.created"],
  },
};

const KEYS = {
  eventId: ["id", "event_id", "eventId"],
  eventType: ["type", "event", "event_type", "eventType", "action"],
  externalId: ["payment_id", "id", "transaction_id", "transactionId"],
  orderId: ["subscription_id", "order_id", "membership_id", "checkout_id", "transaction_history_id"],
  customerId: ["user_id", "customer_id", "client_id"],
  email: ["email", "customer_email", "user_email"],
  currency: ["currency", "currency_code"],
  productName: ["product_name", "plan_name", "title", "product"],
  recurring: ["is_recurring", "recurring", "is_subscription"],
  status: ["status", "state"],
  occurredAt: ["created_at", "paid_at", "timestamp", "occurred_at", "date"],
} as const;

/** Campos anidados que traen la identidad del comprador. */
const BUYER_CONTAINERS = ["buyer", "customer", "user", "member"];

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

/**
 * Identidad del comprador.
 *
 * Commas la anida bajo `buyer`; Whop bajo `user` o `member`. Se busca en los
 * contenedores conocidos y se cae a la raíz.
 */
function pickBuyer(data: Json): { id: string | null; email: string | null } {
  for (const key of BUYER_CONTAINERS) {
    const nested = asRecord(data[key]);
    if (nested) {
      const id = pickString(nested, ["id", ...KEYS.customerId]);
      const email = pickString(nested, [...KEYS.email]);
      if (id || email) return { id, email };
    }
  }
  return {
    id: pickString(data, [...KEYS.customerId]),
    email: pickString(data, [...KEYS.email]),
  };
}

export function normalizeWebhook(
  provider: PaymentProvider,
  body: Json
): NormalizedEvent {
  const config = PROVIDER_CONFIG[provider];
  const eventType = extractEventType(body) ?? "";
  const data = extractData(body);

  const externalId = pickString(data, [...KEYS.externalId]);
  if (!externalId) {
    return { kind: "unmapped", reason: "El evento no trae un id identificable" };
  }

  const currency = (pickString(data, [...KEYS.currency]) ?? "USD").toUpperCase();
  const buyer = pickBuyer(data);
  const base = {
    externalId,
    currency,
    customerExternalId: buyer.id,
    customerEmail: buyer.email,
  };

  if (config.refundEvents.includes(eventType)) {
    return buildTransaction("refund", data, config, base);
  }

  if (config.paymentEvents.includes(eventType)) {
    return buildTransaction("payment", data, config, base);
  }

  if (config.orderEvents.includes(eventType)) {
    const contractValue = resolveContractValue(data, config);
    if (contractValue === null) {
      return {
        kind: "unmapped",
        reason: `Orden "${eventType}" sin valor contratado calculable`,
      };
    }

    const orderedAt = pickTimestamp(data, [...KEYS.occurredAt]);
    if (!orderedAt) {
      return { kind: "unmapped", reason: `Orden "${eventType}" sin fecha legible` };
    }

    const order: NormalizedOrder = {
      externalId,
      customerExternalId: buyer.id,
      customerEmail: buyer.email,
      contractValue,
      currency,
      productName: pickString(data, [...KEYS.productName]),
      isRecurring: pickBoolean(data, [...KEYS.recurring]) || Boolean(data.subscription),
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

/**
 * Valor contratado total — M29 del mapa de fuentes.
 *
 * Es la medida que el documento fuente separa del dinero cobrado: "Contracted
 * revenue is a promise; cash collected pays the ad account."
 *
 * En Commas una suscripción sólo tiene valor contratado conocido si declara
 * `auto_expire_after_x_periods`: ahí es `importe por ciclo × cantidad de ciclos`.
 * Si es `null`, la suscripción es indefinida y **no existe** un valor contratado
 * total. No se estima: devuelve `null` y el evento queda `unmapped`.
 */
export function resolveContractValue(
  data: Json,
  config: ProviderConfig
): number | null {
  const perCharge = pickAmount(data, config.contractKeys, config.amountUnit);
  if (perCharge === null) return null;

  const subscription = asRecord(data.subscription);
  if (!subscription) return perCharge;

  const periods = subscription.auto_expire_after_x_periods;
  if (typeof periods === "number" && Number.isFinite(periods) && periods > 0) {
    return perCharge * periods;
  }

  // Suscripción indefinida: no hay total contratado que afirmar.
  return null;
}

function buildTransaction(
  kind: "payment" | "refund",
  data: Json,
  config: ProviderConfig,
  base: {
    externalId: string;
    currency: string;
    customerExternalId: string | null;
    customerEmail: string | null;
  }
): NormalizedEvent {
  const amount = pickAmount(data, config.amountKeys, config.amountUnit);
  if (amount === null) {
    return { kind: "unmapped", reason: `Movimiento "${kind}" sin monto legible` };
  }

  const occurredAt = pickTimestamp(data, [...KEYS.occurredAt]);
  if (!occurredAt) {
    return { kind: "unmapped", reason: `Movimiento "${kind}" sin fecha legible` };
  }

  const transaction: NormalizedTransaction = {
    externalId: base.externalId,
    orderExternalId: pickOrderId(data),
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

/** El id de la orden puede venir plano o anidado bajo `subscription` / `membership`. */
function pickOrderId(data: Json): string | null {
  for (const key of ["subscription", "membership", "plan"]) {
    const nested = asRecord(data[key]);
    const id = nested ? pickString(nested, ["id"]) : null;
    if (id) return id;
  }
  return pickString(data, [...KEYS.orderId]);
}
