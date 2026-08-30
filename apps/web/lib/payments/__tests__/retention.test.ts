import { describe, expect, it } from "vitest";
import {
  computePurchasesPerCustomer,
  computeRetentionMeasures,
  computeRetentionRate,
  retentionLookbackStart,
  type RetentionOrderRow,
  type RetentionTransactionRow,
} from "../retention";

const PERIOD_START = "2026-08-01T00:00:00.000Z";

function order(overrides: Partial<RetentionOrderRow> = {}): RetentionOrderRow {
  return {
    customer_external_id: "cus_1",
    customer_email: null,
    is_recurring: false,
    ordered_at: "2026-07-01T00:00:00.000Z",
    ...overrides,
  };
}

function payment(
  overrides: Partial<RetentionTransactionRow> = {}
): RetentionTransactionRow {
  return {
    customer_external_id: "cus_1",
    customer_email: null,
    kind: "payment",
    occurred_at: "2026-08-10T00:00:00.000Z",
    ...overrides,
  };
}

describe("computePurchasesPerCustomer (M32)", () => {
  it("promedia órdenes sobre clientes distintos", () => {
    const value = computePurchasesPerCustomer([
      order({ customer_external_id: "a" }),
      order({ customer_external_id: "a" }),
      order({ customer_external_id: "b" }),
    ]);
    expect(value.value).toBeCloseTo(1.5);
  });

  it("identifica al cliente por email cuando no hay id", () => {
    const value = computePurchasesPerCustomer([
      order({ customer_external_id: null, customer_email: "  A@x.com " }),
      order({ customer_external_id: null, customer_email: "a@x.com" }),
    ]);
    // Mismo cliente escrito distinto: una persona, dos compras.
    expect(value.value).toBe(2);
  });

  it("⭐ excluye las órdenes anónimas del numerador Y del denominador", () => {
    // Contarlas arriba y no abajo inflaría el promedio; contarlas abajo como
    // clientes distintos lo hundiría. Sin identidad, la orden no participa.
    const value = computePurchasesPerCustomer([
      order({ customer_external_id: "a" }),
      order({ customer_external_id: "a" }),
      order({ customer_external_id: null, customer_email: null }),
    ]);
    expect(value.value).toBe(2);
  });

  it("devuelve null sin órdenes", () => {
    const value = computePurchasesPerCustomer([]);
    expect(value.value).toBeNull();
    expect(value.reason).toBe("no_orders");
  });

  it("devuelve null si ninguna orden dice quién compró", () => {
    const value = computePurchasesPerCustomer([
      order({ customer_external_id: null, customer_email: null }),
    ]);
    expect(value.value).toBeNull();
    expect(value.reason).toBe("no_identifiable_customers");
  });
});

describe("computeRetentionRate (M33)", () => {
  it("mide qué fracción de la cohorte siguió pagando", () => {
    const result = computeRetentionRate(
      [
        order({ customer_external_id: "a", is_recurring: true }),
        order({ customer_external_id: "b", is_recurring: true }),
      ],
      [payment({ customer_external_id: "a" })],
      PERIOD_START
    );
    expect(result.value).toBe(0.5);
    expect(result.cohortSize).toBe(2);
  });

  it("⭐ sin órdenes recurrentes devuelve null, nunca 0", () => {
    // El LTV multiplica por este factor: un 0 acá lo dejaría en cero y diría
    // que el negocio no vale nada. Un 1 inventaría una retención perfecta.
    const result = computeRetentionRate(
      [order({ is_recurring: false })],
      [payment()],
      PERIOD_START
    );
    expect(result.value).toBeNull();
    expect(result.reason).toBe("no_recurring");
  });

  it("⭐ si todas las recurrentes empezaron dentro del período, devuelve null", () => {
    // No hay nadie de quien preguntarse si siguió pagando: es muy pronto.
    const result = computeRetentionRate(
      [order({ is_recurring: true, ordered_at: "2026-08-15T00:00:00.000Z" })],
      [payment()],
      PERIOD_START
    );
    expect(result.value).toBeNull();
    expect(result.reason).toBe("no_cohort");
  });

  it("un reembolso no cuenta como pago", () => {
    const result = computeRetentionRate(
      [order({ customer_external_id: "a", is_recurring: true })],
      [payment({ customer_external_id: "a", kind: "refund" })],
      PERIOD_START
    );
    expect(result.value).toBe(0);
  });

  it("un cero real se respeta: la cohorte existe y nadie pagó", () => {
    // Distinto de los casos null: acá sí sabemos que nadie siguió pagando.
    const result = computeRetentionRate(
      [order({ customer_external_id: "a", is_recurring: true })],
      [],
      PERIOD_START
    );
    expect(result.value).toBe(0);
    expect(result.reason).toBeNull();
  });

  it("un pago de alguien fuera de la cohorte no la infla", () => {
    const result = computeRetentionRate(
      [order({ customer_external_id: "a", is_recurring: true })],
      [payment({ customer_external_id: "desconocido" })],
      PERIOD_START
    );
    expect(result.value).toBe(0);
  });

  it("dos pagos del mismo cliente cuentan una vez", () => {
    const result = computeRetentionRate(
      [
        order({ customer_external_id: "a", is_recurring: true }),
        order({ customer_external_id: "b", is_recurring: true }),
      ],
      [
        payment({ customer_external_id: "a" }),
        payment({ customer_external_id: "a", occurred_at: "2026-08-20T00:00:00.000Z" }),
      ],
      PERIOD_START
    );
    expect(result.value).toBe(0.5);
  });
});

describe("computeRetentionMeasures", () => {
  it("devuelve las dos medidas con sus motivos", () => {
    const result = computeRetentionMeasures([], [], PERIOD_START);
    expect(result.purchasesPerCustomer).toBeNull();
    expect(result.purchasesReason).toBe("no_orders");
    expect(result.retentionRate).toBeNull();
    expect(result.retentionReason).toBe("no_recurring");
    expect(result.cohortSize).toBe(0);
  });
});

describe("retentionLookbackStart", () => {
  it("retrocede un año desde el fin del período", () => {
    expect(retentionLookbackStart("2026-08-31T00:00:00.000Z")).toBe(
      "2025-08-31T00:00:00.000Z"
    );
  });

  it("acepta una ventana distinta", () => {
    expect(retentionLookbackStart("2026-08-31T00:00:00.000Z", 30)).toBe(
      "2026-08-01T00:00:00.000Z"
    );
  });

  it("devuelve la entrada si no es una fecha", () => {
    expect(retentionLookbackStart("no-es-fecha")).toBe("no-es-fecha");
  });
});
