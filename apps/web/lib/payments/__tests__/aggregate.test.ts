/**
 * Agregación de pagos a las medidas del documento.
 *
 * La distinción que gobierna todo acá es la del documento: "Contracted revenue
 * is a promise; cash collected pays the ad account."
 */

import { describe, it, expect } from "vitest";
import { aggregatePayments, type OrderRow, type TransactionRow } from "../aggregate";

const order = (over: Partial<OrderRow> = {}): OrderRow => ({
  external_id: "ord-1",
  customer_external_id: "cus-1",
  customer_email: "uno@test.com",
  contract_value: 5000,
  ordered_at: "2026-08-10T10:00:00.000Z",
  ...over,
});

const tx = (over: Partial<TransactionRow> = {}): TransactionRow => ({
  external_id: "tx-1",
  customer_external_id: "cus-1",
  customer_email: "uno@test.com",
  kind: "payment",
  amount: 1250,
  occurred_at: "2026-08-10T10:00:00.000Z",
  ...over,
});

describe("sin datos", () => {
  it("devuelve null y no ceros", () => {
    // Sin ninguna fila no se puede afirmar que se cobró cero (§9.1).
    expect(aggregatePayments([], [])).toBeNull();
  });

  it("con una sola fila ya devuelve medidas", () => {
    expect(aggregatePayments([order()], [])).not.toBeNull();
    expect(aggregatePayments([], [tx()])).not.toBeNull();
  });
});

describe("contratado vs cobrado", () => {
  it("son números distintos y no se confunden", () => {
    // Una venta de $5.000 en cuotas, con una cuota de $1.250 pagada.
    const result = aggregatePayments([order({ contract_value: 5000 })], [tx({ amount: 1250 })])!;
    expect(result.contractedValue).toBe(5000);
    expect(result.cashCollected).toBe(1250);
  });

  it("una orden sin ningún pago tiene contratado pero cero cobrado", () => {
    const result = aggregatePayments([order()], [])!;
    expect(result.contractedValue).toBe(5000);
    expect(result.cashCollected).toBe(0);
  });

  it("un pago sin orden suma a cobrado sin inventar contratado", () => {
    const result = aggregatePayments([], [tx({ amount: 800 })])!;
    expect(result.cashCollected).toBe(800);
    expect(result.contractedValue).toBe(0);
  });
});

describe("reembolsos", () => {
  it("se restan del cobrado", () => {
    const result = aggregatePayments(
      [],
      [tx({ external_id: "a", amount: 1000 }), tx({ external_id: "b", kind: "refund", amount: 300 })]
    )!;
    expect(result.cashCollected).toBe(700);
    expect(result.refunds).toBe(300);
  });

  it("un reembolso guardado con monto negativo no se resta dos veces", () => {
    // El signo lo da `kind`, no el monto.
    const result = aggregatePayments([], [tx({ kind: "refund", amount: -300 })])!;
    expect(result.refunds).toBe(300);
    expect(result.cashCollected).toBe(-300);
  });

  it("más reembolsos que cobros da cobrado negativo, que es real", () => {
    const result = aggregatePayments(
      [],
      [tx({ external_id: "a", amount: 100 }), tx({ external_id: "b", kind: "refund", amount: 500 })]
    )!;
    expect(result.cashCollected).toBe(-400);
  });
});

describe("clientes nuevos", () => {
  it("cuenta compradores distintos, no órdenes", () => {
    const result = aggregatePayments(
      [
        order({ external_id: "o1", customer_external_id: "cus-1" }),
        order({ external_id: "o2", customer_external_id: "cus-1" }),
        order({ external_id: "o3", customer_external_id: "cus-2" }),
      ],
      []
    )!;
    expect(result.orders).toBe(3);
    expect(result.newCustomers).toBe(2);
  });

  it("cae al email cuando no hay id del proveedor", () => {
    const result = aggregatePayments(
      [
        order({ external_id: "o1", customer_external_id: null, customer_email: "a@test.com" }),
        order({ external_id: "o2", customer_external_id: null, customer_email: "A@TEST.com" }),
      ],
      []
    )!;
    expect(result.newCustomers).toBe(1);
  });

  it("una orden sin id ni email no cuenta como cliente", () => {
    // Contar cada compra anónima como cliente nuevo bajaría el CAC de mentira,
    // que es el error más caro posible acá.
    const result = aggregatePayments(
      [order({ customer_external_id: null, customer_email: null })],
      []
    )!;
    expect(result.orders).toBe(1);
    expect(result.newCustomers).toBe(0);
  });
});

describe("números que llegan como texto", () => {
  it("acepta montos en string", () => {
    const result = aggregatePayments(
      [order({ contract_value: "5000.50" })],
      [tx({ amount: "1250.25" })]
    )!;
    expect(result.contractedValue).toBeCloseTo(5000.5);
    expect(result.cashCollected).toBeCloseTo(1250.25);
  });

  it("descarta valores ilegibles en vez de romper", () => {
    const result = aggregatePayments([order({ contract_value: "no-es-numero" })], [])!;
    expect(result.contractedValue).toBe(0);
  });
});

describe("revenue", () => {
  it("es igual a cash collected: sólo cuenta lo cobrado", () => {
    const result = aggregatePayments([order()], [tx({ amount: 900 })])!;
    expect(result.revenue).toBe(result.cashCollected);
    expect(result.revenue).not.toBe(result.contractedValue);
  });
});
