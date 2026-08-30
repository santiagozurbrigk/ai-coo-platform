/**
 * Normalización de webhooks de pago.
 *
 * VERIFICADO el 2026-08-30: los payloads de estos tests salen de la documentación
 * local en `docs/external-apis/whop/` y `docs/external-apis/commas/`, no de
 * suposiciones.
 *
 * Los dos proveedores usan convenciones opuestas — Whop manda decimales y Commas
 * centavos — así que buena parte de estos tests existe para fijar que el mapeo es
 * por proveedor y no una heurística global.
 */

import { describe, it, expect } from "vitest";
import {
  normalizeWebhook,
  pickAmount,
  pickTimestamp,
  extractData,
  extractEventId,
  extractEventType,
} from "../normalize";

/** Payload real de Whop, de developer/guides/webhooks.md. */
const whopPayment = {
  id: "msg_bQPHmO2eBnHYtWWuxAN9K3Xd",
  type: "payment.succeeded",
  api_version: "v1",
  api_version_date: "2026-08-14",
  timestamp: "2026-08-10T17:03:24.291Z",
  account_id: "biz_XXXXXXXX",
  data: {
    id: "pay_XXXXXXXX",
    status: "paid",
    currency: "usd",
    // "The total amount charged to the customer" — esto es cash collected.
    settlement_amount: 497.5,
    // "to show to the creator (excluding buyer fees)" — NO es lo cobrado.
    subtotal: 450,
    total: 470,
    usd_total: 470,
    paid_at: "2026-08-10T17:03:20.000Z",
    created_at: "2026-08-10T17:03:00.000Z",
    user: { id: "user_abc", email: "comprador@test.com" },
    membership: { id: "mem_123" },
  },
};

/** Payload real de Commas, de webhook-events-reference.md. */
const commasPayment = {
  id: "9b2f5c1e-4a7d-4c9e-b1f3-2d8e6a1c0f45",
  type: "payment.succeeded",
  data: {
    payment_id: "ORD-8F3K-2MQ9-X7LP",
    amount_cents: 2900,
    currency: "USD",
    status: "succeeded",
    created_at: "2026-07-13T21:42:47+00:00",
    payment_type: "subscription",
    buyer: { id: "user_4Kd9mQ2xZ7Lp", name: "Alex Johnson", email: "alex@example.com" },
    item: { id: "NLxj6", title: "Pro Membership", type: "subscription" },
    subscription: { id: "qYyEp", status: "active", payment_frequency: "monthly" },
  },
};

describe("Whop — montos en decimales", () => {
  it("usa settlement_amount, que es lo que se le cobró al cliente", () => {
    // El bug que este test fija: `total` y `subtotal` existen en el payload pero
    // son "para mostrarle al creador, sin los fees del comprador". Tomarlos como
    // cash collected daría un número más chico que el real.
    const result = normalizeWebhook("whop", whopPayment);
    expect(result.kind).toBe("transaction");
    if (result.kind === "transaction") {
      expect(result.transaction.amount).toBe(497.5);
      expect(result.transaction.amount).not.toBe(470);
      expect(result.transaction.amount).not.toBe(450);
    }
  });

  it("NO divide por 100: Whop manda decimales en la moneda", () => {
    const result = normalizeWebhook("whop", whopPayment);
    if (result.kind === "transaction") expect(result.transaction.amount).toBe(497.5);
  });

  it("saca la identidad del comprador de `user`", () => {
    const result = normalizeWebhook("whop", whopPayment);
    if (result.kind === "transaction") {
      expect(result.transaction.customerExternalId).toBe("user_abc");
      expect(result.transaction.customerEmail).toBe("comprador@test.com");
    }
  });

  it("ata la transacción a la membresía", () => {
    const result = normalizeWebhook("whop", whopPayment);
    if (result.kind === "transaction") {
      expect(result.transaction.orderExternalId).toBe("mem_123");
    }
  });

  it("reconoce refund.created", () => {
    const result = normalizeWebhook("whop", {
      ...whopPayment,
      type: "refund.created",
      data: { ...whopPayment.data, settlement_amount: -100 },
    });
    if (result.kind === "transaction") {
      expect(result.transaction.kind).toBe("refund");
      expect(result.transaction.amount).toBe(100);
    }
  });

  it("membership.activated crea la orden — `membership.created` no existe en Whop", () => {
    const result = normalizeWebhook("whop", {
      id: "msg_1",
      type: "membership.activated",
      data: {
        id: "mem_999",
        total: 5000,
        currency: "usd",
        created_at: "2026-08-10T17:03:00.000Z",
        user: { id: "user_abc", email: "a@test.com" },
      },
    });
    expect(result.kind).toBe("order");
    if (result.kind === "order") expect(result.order.contractValue).toBe(5000);
  });

  it("un evento de Commas no se interpreta como si fuera de Whop", () => {
    const result = normalizeWebhook("whop", { id: "x", type: "product.purchased", data: { id: "y" } });
    expect(result.kind).toBe("unmapped");
  });
});

describe("Commas — montos en centavos", () => {
  it("divide amount_cents por 100", () => {
    const result = normalizeWebhook("fanbasis", commasPayment);
    expect(result.kind).toBe("transaction");
    if (result.kind === "transaction") expect(result.transaction.amount).toBe(29);
  });

  it("saca la identidad del comprador de `buyer`", () => {
    const result = normalizeWebhook("fanbasis", commasPayment);
    if (result.kind === "transaction") {
      expect(result.transaction.customerExternalId).toBe("user_4Kd9mQ2xZ7Lp");
      expect(result.transaction.customerEmail).toBe("alex@example.com");
    }
  });

  it("usa payment_id como id externo", () => {
    const result = normalizeWebhook("fanbasis", commasPayment);
    if (result.kind === "transaction") {
      expect(result.transaction.externalId).toBe("ORD-8F3K-2MQ9-X7LP");
    }
  });

  it("reconoce product.purchased como cobro", () => {
    const result = normalizeWebhook("fanbasis", { ...commasPayment, type: "product.purchased" });
    if (result.kind === "transaction") expect(result.transaction.kind).toBe("payment");
  });

  it("acepta el payload plano de los webhooks de prueba", () => {
    // La doc avisa que el endpoint de test manda payloads sin envelope.
    const result = normalizeWebhook("fanbasis", {
      type: "payment.succeeded",
      payment_id: "ORD-TEST",
      amount_cents: 5000,
      currency: "USD",
      created_at: "2026-07-13T21:42:47+00:00",
    });
    if (result.kind === "transaction") expect(result.transaction.amount).toBe(50);
  });
});

describe("valor contratado — la promesa, no la cuota", () => {
  const base = {
    id: "evt_1",
    type: "subscription.created",
    data: {
      payment_id: "ORD-1",
      amount_cents: 50000,
      currency: "USD",
      created_at: "2026-07-13T21:42:47+00:00",
      buyer: { id: "u1", email: "a@test.com" },
    },
  };

  it("con final conocido, multiplica la cuota por la cantidad de ciclos", () => {
    const result = normalizeWebhook("fanbasis", {
      ...base,
      data: { ...base.data, subscription: { id: "s1", auto_expire_after_x_periods: 6 } },
    });
    expect(result.kind).toBe("order");
    // $500 por cuota × 6 cuotas = $3000 contratados
    if (result.kind === "order") expect(result.order.contractValue).toBe(3000);
  });

  it("una suscripción indefinida NO tiene valor contratado: queda unmapped", () => {
    // Estimarlo sería inventar una promesa que el cliente nunca hizo.
    const result = normalizeWebhook("fanbasis", {
      ...base,
      data: { ...base.data, subscription: { id: "s1", auto_expire_after_x_periods: null } },
    });
    expect(result.kind).toBe("unmapped");
    if (result.kind === "unmapped") expect(result.reason).toMatch(/contratado/i);
  });

  it("sin suscripción, el monto es el contratado", () => {
    const result = normalizeWebhook("fanbasis", base);
    if (result.kind === "order") expect(result.order.contractValue).toBe(500);
  });

  it("marca la orden como recurrente cuando hay suscripción", () => {
    const result = normalizeWebhook("fanbasis", {
      ...base,
      data: { ...base.data, subscription: { id: "s1", auto_expire_after_x_periods: 3 } },
    });
    if (result.kind === "order") expect(result.order.isRecurring).toBe(true);
  });
});

describe("lectura de montos", () => {
  it("respeta la unidad que se le pasa", () => {
    expect(pickAmount({ amount: 2900 }, ["amount"], "cents")).toBe(29);
    expect(pickAmount({ amount: 2900 }, ["amount"], "decimal")).toBe(2900);
  });

  it("por defecto asume decimales", () => {
    expect(pickAmount({ amount: 10.43 }, ["amount"])).toBe(10.43);
  });

  it("acepta números como texto", () => {
    expect(pickAmount({ amount: "1250.5" }, ["amount"])).toBe(1250.5);
  });

  it("devuelve null si no hay monto legible, nunca cero", () => {
    expect(pickAmount({ amount: "abc" }, ["amount"])).toBeNull();
    expect(pickAmount({}, ["amount"])).toBeNull();
  });

  it("respeta el orden de preferencia de claves", () => {
    expect(pickAmount({ total: 10, settlement_amount: 20 }, ["settlement_amount", "total"])).toBe(20);
  });

  it("un cero explícito se lee como cero", () => {
    expect(pickAmount({ amount: 0 }, ["amount"])).toBe(0);
  });
});

describe("lectura de fechas", () => {
  it("lee el ISO con offset que manda Commas", () => {
    expect(pickTimestamp({ created_at: "2026-07-13T21:42:47+00:00" }, ["created_at"]))
      .toBe("2026-07-13T21:42:47.000Z");
  });

  it("lee el ISO en Z que manda Whop", () => {
    expect(pickTimestamp({ paid_at: "2026-08-10T17:03:20.000Z" }, ["paid_at"]))
      .toBe("2026-08-10T17:03:20.000Z");
  });

  it("lee epoch en segundos y en milisegundos", () => {
    expect(pickTimestamp({ t: 1_800_000_000 }, ["t"])).toBe(new Date(1_800_000_000_000).toISOString());
    expect(pickTimestamp({ t: 1_800_000_000_000 }, ["t"])).toBe(new Date(1_800_000_000_000).toISOString());
  });

  it("devuelve null ante una fecha ilegible", () => {
    expect(pickTimestamp({ t: "ayer" }, ["t"])).toBeNull();
  });
});

describe("envelope", () => {
  it("desanida `data`", () => {
    expect(extractData({ data: { id: "x" } })).toEqual({ id: "x" });
  });

  it("toma el cuerpo entero si no hay envelope", () => {
    expect(extractData({ id: "x" })).toEqual({ id: "x" });
  });

  it("lee el id del evento, que es la clave de deduplicación", () => {
    expect(extractEventId(whopPayment)).toBe("msg_bQPHmO2eBnHYtWWuxAN9K3Xd");
    expect(extractEventId(commasPayment)).toBe("9b2f5c1e-4a7d-4c9e-b1f3-2d8e6a1c0f45");
  });

  it("lee el tipo de evento", () => {
    expect(extractEventType(whopPayment)).toBe("payment.succeeded");
  });
});

describe("eventos que no se interpretan", () => {
  it("un tipo no contemplado queda unmapped con su motivo", () => {
    const result = normalizeWebhook("whop", { id: "x", type: "app.installed", data: { id: "y" } });
    expect(result.kind).toBe("unmapped");
    if (result.kind === "unmapped") expect(result.reason).toMatch(/no contemplado/i);
  });

  it("un cobro sin monto legible queda unmapped en vez de valer cero", () => {
    const result = normalizeWebhook("whop", {
      id: "x", type: "payment.succeeded",
      data: { id: "pay_1", created_at: "2026-08-10T17:03:00.000Z" },
    });
    expect(result.kind).toBe("unmapped");
    if (result.kind === "unmapped") expect(result.reason).toMatch(/monto/i);
  });

  it("un evento sin id queda unmapped", () => {
    const result = normalizeWebhook("whop", { type: "payment.succeeded", data: { settlement_amount: 10 } });
    expect(result.kind).toBe("unmapped");
  });
});
