import { describe, expect, it } from "vitest";
import { funnelScale } from "@/lib/chart/funnel-scale";

describe("funnelScale", () => {
  it("normaliza un embudo sano contra su primera etapa, como antes", () => {
    const { norms, percentages } = funnelScale([1000, 500, 250, 50]);

    expect(norms).toEqual([1, 0.5, 0.25, 0.05]);
    expect(percentages).toEqual([100, 50, 25, 5]);
  });

  it("acota un embudo que crece en vez de decrecer", () => {
    // El caso del panel general: 1 cierre seguido de 263 clientes activos.
    const { norms, percentages } = funnelScale([1, 263]);

    expect(norms.every((n) => n >= 0 && n <= 1)).toBe(true);
    expect(percentages.every((p) => p >= 0 && p <= 100)).toBe(true);
    expect(percentages[1]).toBe(100);
  });

  it("no divide por cero cuando ninguna etapa tiene datos", () => {
    const { norms, percentages } = funnelScale([0, 0, 0]);

    expect(norms).toEqual([0, 0, 0]);
    expect(percentages).toEqual([0, 0, 0]);
  });

  it("trata los valores negativos y no finitos como cero", () => {
    const { norms } = funnelScale([100, -20, Number.NaN, Number.POSITIVE_INFINITY]);

    expect(norms[0]).toBe(1);
    expect(norms[1]).toBe(0);
    expect(norms[2]).toBe(0);
    expect(norms[3]).toBe(0);
  });

  it("devuelve una escala por cada valor recibido", () => {
    expect(funnelScale([]).norms).toEqual([]);
    expect(funnelScale([7]).norms).toEqual([1]);
  });
});
