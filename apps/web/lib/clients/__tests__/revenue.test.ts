import { describe, expect, it } from "vitest";
import {
  currentPeriod,
  formatPeriod,
  formatPeriodShort,
  formatRevenue,
  normalizePeriod,
  revenueSeries,
  rowToRevenueEntry,
  summarizeRevenue,
  type ClientRevenueEntry,
} from "@/lib/clients/revenue";

function entry(period: string, amount: number): ClientRevenueEntry {
  return {
    id: period,
    clientId: "c1",
    amount,
    currency: "USD",
    period,
    note: null,
    createdAt: "2026-09-21T00:00:00Z",
  };
}

describe("⭐ el resumen de facturación del negocio del cliente", () => {
  it("sin registros no inventa nada", () => {
    expect(summarizeRevenue([])).toEqual({
      latest: null,
      previous: null,
      changePct: null,
      best: null,
      count: 0,
    });
  });

  /**
   * ⭐ Ordena por período, no por fecha de carga: alguien puede cargar marzo en
   * septiembre y eso no lo convierte en el dato más reciente.
   */
  it("el más reciente es el del período más nuevo, no el último cargado", () => {
    const resumen = summarizeRevenue([
      entry("2026-09-01", 12000),
      entry("2026-03-01", 4000),
      entry("2026-08-01", 9000),
    ]);
    expect(resumen.latest?.period).toBe("2026-09-01");
    expect(resumen.previous?.period).toBe("2026-08-01");
    expect(resumen.count).toBe(3);
  });

  it("calcula la variación contra el mes anterior registrado", () => {
    const resumen = summarizeRevenue([entry("2026-08-01", 10000), entry("2026-09-01", 13000)]);
    expect(resumen.changePct).toBe(30);
  });

  it("una caída da variación negativa", () => {
    const resumen = summarizeRevenue([entry("2026-08-01", 10000), entry("2026-09-01", 7500)]);
    expect(resumen.changePct).toBe(-25);
  });

  /**
   * ⭐ De cero a cualquier cosa no es "infinito por ciento": es empezar. Un
   * número ahí se leería como un crecimiento récord.
   */
  it("no calcula variación cuando el mes anterior fue cero", () => {
    const resumen = summarizeRevenue([entry("2026-08-01", 0), entry("2026-09-01", 5000)]);
    expect(resumen.changePct).toBeNull();
    expect(resumen.latest?.amount).toBe(5000);
  });

  it("con un solo mes no hay con qué comparar", () => {
    const resumen = summarizeRevenue([entry("2026-09-01", 5000)]);
    expect(resumen.previous).toBeNull();
    expect(resumen.changePct).toBeNull();
  });

  it("el mejor mes no es necesariamente el último", () => {
    const resumen = summarizeRevenue([
      entry("2026-07-01", 20000),
      entry("2026-09-01", 12000),
    ]);
    expect(resumen.best?.amount).toBe(20000);
    expect(resumen.latest?.amount).toBe(12000);
  });

  it("un mes de cero es un dato válido, no un vacío", () => {
    const resumen = summarizeRevenue([entry("2026-09-01", 0)]);
    expect(resumen.latest?.amount).toBe(0);
    expect(resumen.count).toBe(1);
  });
});

describe("la serie para el gráfico", () => {
  it("va del mes más viejo al más nuevo", () => {
    expect(
      revenueSeries([entry("2026-09-01", 3), entry("2026-07-01", 1), entry("2026-08-01", 2)])
    ).toEqual([1, 2, 3]);
  });

  it("se queda con los últimos meses, no con los primeros", () => {
    const muchos = Array.from({ length: 20 }, (_, i) =>
      entry(`2025-${String((i % 12) + 1).padStart(2, "0")}-01`, i)
    );
    expect(revenueSeries(muchos, 6)).toHaveLength(6);
  });
});

describe("períodos", () => {
  /**
   * ⭐ El mes se arma con los números locales. `toISOString()` en Buenos Aires
   * convierte un 1° a las 21:00 en el día 2 — y a fin de mes, en el mes
   * siguiente.
   */
  it("el mes actual sale del reloj local y siempre termina en -01", () => {
    expect(currentPeriod(new Date(2026, 8, 30, 21, 0, 0))).toBe("2026-09-01");
    expect(currentPeriod(new Date(2026, 11, 31, 23, 30, 0))).toBe("2026-12-01");
  });

  it("cualquier día del mes se normaliza al primero", () => {
    expect(normalizePeriod("2026-09-17")).toBe("2026-09-01");
    expect(normalizePeriod("2026-09")).toBe("2026-09-01");
  });

  it("rechaza lo que no es un mes", () => {
    expect(normalizePeriod("septiembre")).toBeNull();
    expect(normalizePeriod("2026-13-01")).toBeNull();
    expect(normalizePeriod("")).toBeNull();
  });

  it("se lee en castellano sin correr el mes", () => {
    expect(formatPeriod("2026-09-01")).toBe("septiembre 2026");
    expect(formatPeriod("2026-01-01")).toBe("enero 2026");
  });

  it("la versión corta entra en una celda de tabla", () => {
    expect(formatPeriodShort("2026-09-01")).toBe("sep 2026");
    expect(formatPeriodShort("2026-01-01")).toBe("ene 2026");
    // Lo que no se entiende se devuelve tal cual, no se inventa un mes.
    expect(formatPeriodShort("2026-13-01")).toBe("2026-13-01");
  });
});

describe("formato de montos", () => {
  it("no muestra centavos", () => {
    expect(formatRevenue(12400.75, "USD")).toBe("US$12.401");
    expect(formatRevenue(12400, "ARS")).toBe("$12.400");
  });
});

describe("lectura de la fila de la base", () => {
  /**
   * ⭐ Postgres devuelve `numeric` como string. Sin el `Number()`, sumar dos
   * meses concatenaría los textos: "4000" + "5000" = "40005000".
   */
  it("convierte el numeric de texto a número", () => {
    const parsed = rowToRevenueEntry({
      id: "r1",
      client_id: "c1",
      amount: "4000.00",
      currency: "ARS",
      period: "2026-09-01T00:00:00",
      note: null,
      created_at: "2026-09-21T00:00:00Z",
    });
    expect(parsed.amount).toBe(4000);
    expect(typeof parsed.amount).toBe("number");
    expect(parsed.currency).toBe("ARS");
    expect(parsed.period).toBe("2026-09-01");
  });

  it("una moneda desconocida cae en dólares, no rompe la fila", () => {
    const parsed = rowToRevenueEntry({
      id: "r1",
      client_id: "c1",
      amount: 100,
      currency: "EUR",
      period: "2026-09-01",
      note: null,
      created_at: "2026-09-21T00:00:00Z",
    });
    expect(parsed.currency).toBe("USD");
  });
});
