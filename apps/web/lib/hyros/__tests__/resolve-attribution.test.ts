import { describe, expect, it } from "vitest";
import { resolveHyrosMeasures, sumAttributionField } from "../resolve-attribution";

const ROWS = [
  { id: "acc_1", revenue: 12500.5, cost: 4200, leads: 310, new_leads: 260, new_visits: 8900 },
  { id: "acc_2", revenue: 3100, cost: 900, leads: 95, new_leads: 80, new_visits: 2100 },
];

describe("sumAttributionField", () => {
  it("suma el campo entre cuentas", () => {
    expect(sumAttributionField(ROWS, "revenue")).toBeCloseTo(15600.5);
    expect(sumAttributionField(ROWS, "leads")).toBe(405);
  });

  it("⭐ devuelve null si ninguna fila trae el campo", () => {
    // Que Hyros no reporte revenue para ninguna cuenta no significa que la
    // atribución sea cero: significa que no la sabemos.
    expect(sumAttributionField(ROWS, "no_existe")).toBeNull();
  });

  it("cuenta como cero las filas que no traen el campo, si alguna sí lo trae", () => {
    // Acá sí hay señal de que el campo existe: esa cuenta no tuvo nada.
    expect(sumAttributionField([{ revenue: 100 }, { id: "x" }], "revenue")).toBe(100);
  });

  it("parsea números que vienen como texto con símbolo de moneda", () => {
    expect(sumAttributionField([{ revenue: "$1,200.50" }], "revenue")).toBeCloseTo(1200.5);
  });

  it("ignora valores que no son numéricos", () => {
    expect(sumAttributionField([{ revenue: "n/a" }], "revenue")).toBeNull();
  });

  it("respeta un cero real", () => {
    expect(sumAttributionField([{ revenue: 0 }], "revenue")).toBe(0);
  });
});

describe("resolveHyrosMeasures", () => {
  it("mapea las cuatro medidas", () => {
    const result = resolveHyrosMeasures(ROWS);
    expect(result.attributedRevenue).toBeCloseTo(15600.5);
    expect(result.attributedSpend).toBe(5100);
    expect(result.attributedLeads).toBe(405);
    expect(result.landingVisitors).toBe(11000);
  });

  it("usa new_leads si no vino leads", () => {
    const result = resolveHyrosMeasures([{ new_leads: 42 }]);
    expect(result.attributedLeads).toBe(42);
  });

  it("⭐ sin filas, todo es null", () => {
    // Un cero de revenue atribuido afirmaría que ninguna venta vino de los
    // anuncios, que es una afirmación fuerte y probablemente falsa.
    const result = resolveHyrosMeasures([]);
    expect(result.attributedRevenue).toBeNull();
    expect(result.attributedSpend).toBeNull();
    expect(result.attributedLeads).toBeNull();
    expect(result.landingVisitors).toBeNull();
  });

  it("⭐ usa new_visits y no clicks para los visitantes", () => {
    // Un mismo visitante puede clickear varias veces: clicks no responde
    // "cuánta gente llegó a la página".
    const result = resolveHyrosMeasures([{ clicks: 9999, new_visits: 120 }]);
    expect(result.landingVisitors).toBe(120);
  });

  it("una medida faltante no arrastra a las demás", () => {
    const result = resolveHyrosMeasures([{ revenue: 500 }]);
    expect(result.attributedRevenue).toBe(500);
    expect(result.attributedSpend).toBeNull();
  });
});
