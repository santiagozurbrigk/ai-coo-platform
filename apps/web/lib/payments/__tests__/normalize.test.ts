/**
 * Normalización de webhooks de pago.
 *
 * ⚠️ El mapeo de campos NO está verificado contra las APIs reales de Whop y
 * Fanbasis: sus sitios de documentación no son alcanzables desde el entorno.
 * Estos tests fijan el COMPORTAMIENTO del normalizador —qué hace ante un payload
 * con tal forma— y no afirman que ese sea el shape real de los proveedores.
 *
 * Cuando llegue el primer webhook real, `payment_webhook_events` tiene el payload
 * crudo: ahí se corrige el mapeo y se actualizan estos tests con datos ciertos.
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

describe("lectura de montos", () => {
  it("lee un número directo", () => {
    expect(pickAmount({ amount: 1250.5 }, ["amount"])).toBe(1250.5);
  });

  it("lee un número que viene como texto", () => {
    expect(pickAmount({ amount: "1250.5" }, ["amount"])).toBe(1250.5);
  });

  it("convierte centavos a unidades cuando la clave lo indica", () => {
    expect(pickAmount({ amount_cents: 125050 }, ["amount_cents"])).toBe(1250.5);
    expect(pickAmount({ total_in_cents: 5000 }, ["total_in_cents"])).toBe(50);
  });

  it("NO divide una clave que no habla de centavos", () => {
    expect(pickAmount({ amount: 125050 }, ["amount"])).toBe(125050);
  });

  it("devuelve null si no hay monto legible, nunca cero", () => {
    // Un cobro cuyo monto no se entiende no es un cobro de cero.
    expect(pickAmount({ amount: "abc" }, ["amount"])).toBeNull();
    expect(pickAmount({}, ["amount"])).toBeNull();
    expect(pickAmount({ amount: null }, ["amount"])).toBeNull();
  });

  it("respeta el orden de preferencia de claves", () => {
    expect(pickAmount({ total: 10, amount: 20 }, ["amount", "total"])).toBe(20);
  });

  it("un cero explícito sí se lee como cero", () => {
    expect(pickAmount({ amount: 0 }, ["amount"])).toBe(0);
  });
});

describe("lectura de fechas", () => {
  it("lee ISO", () => {
    expect(pickTimestamp({ created_at: "2026-08-10T10:00:00Z" }, ["created_at"]))
      .toBe("2026-08-10T10:00:00.000Z");
  });

  it("lee epoch en segundos", () => {
    expect(pickTimestamp({ created_at: 1_800_000_000 }, ["created_at"]))
      .toBe(new Date(1_800_000_000_000).toISOString());
  });

  it("lee epoch en milisegundos", () => {
    expect(pickTimestamp({ created_at: 1_800_000_000_000 }, ["created_at"]))
      .toBe(new Date(1_800_000_000_000).toISOString());
  });

  it("devuelve null ante una fecha ilegible", () => {
    expect(pickTimestamp({ created_at: "ayer" }, ["created_at"])).toBeNull();
    expect(pickTimestamp({}, ["created_at"])).toBeNull();
  });
});

describe("desanidado del payload", () => {
  it("toma el cuerpo entero si no hay envoltorio", () => {
    expect(extractData({ id: "x" })).toEqual({ id: "x" });
  });

  it("desanida un nivel", () => {
    expect(extractData({ data: { id: "x" } })).toEqual({ id: "x" });
  });

  it("desanida dos niveles", () => {
    expect(extractData({ data: { object: { id: "x" } } })).toEqual({ id: "x" });
  });

  it("lee el id y el tipo del evento", () => {
    const body = { id: "evt_1", type: "payment.succeeded", data: {} };
    expect(extractEventId(body)).toBe("evt_1");
    expect(extractEventType(body)).toBe("payment.succeeded");
  });
});

describe("clasificación de eventos", () => {
  const payment = {
    type: "payment.succeeded",
    data: {
      id: "tx_1",
      amount: 1250,
      currency: "usd",
      user_id: "cus_1",
      email: "a@test.com",
      order_id: "ord_1",
      created_at: "2026-08-10T10:00:00Z",
    },
  };

  it("reconoce un cobro", () => {
    const result = normalizeWebhook("whop", payment);
    expect(result.kind).toBe("transaction");
    if (result.kind === "transaction") {
      expect(result.transaction.kind).toBe("payment");
      expect(result.transaction.amount).toBe(1250);
      expect(result.transaction.currency).toBe("USD");
      expect(result.transaction.orderExternalId).toBe("ord_1");
      expect(result.transaction.customerEmail).toBe("a@test.com");
    }
  });

  it("reconoce un reembolso y guarda el monto en positivo", () => {
    const result = normalizeWebhook("whop", {
      ...payment,
      type: "payment.refunded",
      data: { ...payment.data, amount: -500 },
    });
    expect(result.kind).toBe("transaction");
    if (result.kind === "transaction") {
      expect(result.transaction.kind).toBe("refund");
      expect(result.transaction.amount).toBe(500);
    }
  });

  it("reconoce una orden y separa el valor contratado", () => {
    const result = normalizeWebhook("fanbasis", {
      type: "membership.went_valid",
      data: {
        id: "mem_1",
        contract_value: 5000,
        currency: "USD",
        user_id: "cus_1",
        is_recurring: true,
        created_at: "2026-08-10T10:00:00Z",
      },
    });
    expect(result.kind).toBe("order");
    if (result.kind === "order") {
      expect(result.order.contractValue).toBe(5000);
      expect(result.order.isRecurring).toBe(true);
    }
  });

  it("un tipo de evento que no interesa queda unmapped, no rompe", () => {
    const result = normalizeWebhook("whop", { type: "app.installed", data: { id: "x" } });
    expect(result.kind).toBe("unmapped");
    if (result.kind === "unmapped") expect(result.reason).toMatch(/no contemplado/i);
  });

  it("un cobro sin monto legible queda unmapped en vez de valer cero", () => {
    const result = normalizeWebhook("whop", {
      type: "payment.succeeded",
      data: { id: "tx_1", created_at: "2026-08-10T10:00:00Z" },
    });
    expect(result.kind).toBe("unmapped");
    if (result.kind === "unmapped") expect(result.reason).toMatch(/monto/i);
  });

  it("un cobro sin fecha legible queda unmapped", () => {
    const result = normalizeWebhook("whop", {
      type: "payment.succeeded",
      data: { id: "tx_1", amount: 100 },
    });
    expect(result.kind).toBe("unmapped");
    if (result.kind === "unmapped") expect(result.reason).toMatch(/fecha/i);
  });

  it("un evento sin id queda unmapped", () => {
    const result = normalizeWebhook("whop", { type: "payment.succeeded", data: { amount: 100 } });
    expect(result.kind).toBe("unmapped");
    if (result.kind === "unmapped") expect(result.reason).toMatch(/id/i);
  });

  it("un evento sin tipo queda unmapped", () => {
    const result = normalizeWebhook("fanbasis", { data: { id: "x", amount: 10 } });
    expect(result.kind).toBe("unmapped");
  });

  it("la moneda se normaliza a mayúsculas y cae a USD", () => {
    const sinMoneda = normalizeWebhook("whop", {
      type: "payment.succeeded",
      data: { id: "tx_1", amount: 10, created_at: "2026-08-10T10:00:00Z" },
    });
    if (sinMoneda.kind === "transaction") expect(sinMoneda.transaction.currency).toBe("USD");
  });
});
