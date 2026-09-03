import { describe, expect, it } from "vitest";
import {
  availableMetricKeys,
  deriveClientCase,
  groupWinsByClient,
} from "@/lib/wins/derive-case";
import type { ClientBaseline, ClientWin } from "@/types/wins";

function win(overrides: Partial<ClientWin> = {}): ClientWin {
  return {
    id: "w1",
    organizationId: "org-1",
    clientId: "cl1",
    winDate: "2026-01-01",
    achievement: "Un logro",
    metric: null,
    custom: {},
    source: "manual",
    sourceRef: null,
    notes: null,
    createdBy: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    attachments: [],
    usages: [],
    ...overrides,
  };
}

const metric = (key: string, value: number, unit: string | null = "USD") => ({
  key,
  value,
  unit,
});

describe("el recorrido medido", () => {
  it("⭐ dos puntos comparables dan inicial, final, diferencia y plazo", () => {
    const result = deriveClientCase([
      win({ id: "a", winDate: "2026-01-01", metric: metric("facturacion", 2000) }),
      win({ id: "b", winDate: "2026-04-01", metric: metric("facturacion", 8000) }),
    ]);
    expect(result.measured).toBe(true);
    if (!result.measured) return;
    expect(result.start.value).toBe(2000);
    expect(result.end.value).toBe(8000);
    expect(result.delta).toBe(6000);
    expect(result.deltaPercent).toBe(300);
    expect(result.days).toBe(90);
  });

  it("el punto inicial puede ser el baseline del cliente", () => {
    const baseline: ClientBaseline = {
      metricKey: "facturacion",
      metricValue: 500,
      metricUnit: "USD",
      capturedAt: "2026-01-01",
    };
    const result = deriveClientCase(
      [win({ winDate: "2026-03-01", metric: metric("facturacion", 5000) })],
      baseline
    );
    expect(result.measured).toBe(true);
    if (!result.measured) return;
    expect(result.start.origin).toBe("baseline");
    expect(result.start.value).toBe(500);
  });

  it("ordena por fecha, no por el orden en que vinieron los wins", () => {
    const result = deriveClientCase([
      win({ id: "b", winDate: "2026-06-01", metric: metric("facturacion", 9000) }),
      win({ id: "a", winDate: "2026-01-01", metric: metric("facturacion", 1000) }),
    ]);
    if (!result.measured) throw new Error("debería medir");
    expect(result.start.value).toBe(1000);
    expect(result.end.value).toBe(9000);
  });

  it("una métrica puede caer: la diferencia es negativa, no se esconde", () => {
    const result = deriveClientCase([
      win({ id: "a", winDate: "2026-01-01", metric: metric("churn", 20, "%") }),
      win({ id: "b", winDate: "2026-02-01", metric: metric("churn", 8, "%") }),
    ]);
    if (!result.measured) throw new Error("debería medir");
    expect(result.delta).toBe(-12);
    expect(result.deltaPercent).toBe(-60);
  });

  it("elige la medida con más puntos cuando hay varias", () => {
    const result = deriveClientCase([
      win({ id: "a", winDate: "2026-01-01", metric: metric("facturacion", 1000) }),
      win({ id: "b", winDate: "2026-02-01", metric: metric("facturacion", 2000) }),
      win({ id: "c", winDate: "2026-03-01", metric: metric("seguidores", 500, null) }),
    ]);
    if (!result.measured) throw new Error("debería medir");
    expect(result.metricKey).toBe("facturacion");
  });

  it("se puede forzar qué medida usar", () => {
    const result = deriveClientCase(
      [
        win({ id: "a", winDate: "2026-01-01", metric: metric("facturacion", 1000) }),
        win({ id: "b", winDate: "2026-02-01", metric: metric("facturacion", 2000) }),
        win({ id: "c", winDate: "2026-01-01", metric: metric("seguidores", 100, null) }),
        win({ id: "d", winDate: "2026-03-01", metric: metric("seguidores", 900, null) }),
      ],
      null,
      "seguidores"
    );
    if (!result.measured) throw new Error("debería medir");
    expect(result.metricKey).toBe("seguidores");
    expect(result.delta).toBe(800);
  });
});

describe("⭐ sin medir: cuándo el dashboard se niega a estimar", () => {
  it("ningún win tiene número", () => {
    const result = deriveClientCase([win({ id: "a" }), win({ id: "b" })]);
    expect(result).toMatchObject({ measured: false, reason: "sin_wins_con_medida" });
  });

  it("un solo punto no es un recorrido", () => {
    const result = deriveClientCase([
      win({ winDate: "2026-01-01", metric: metric("facturacion", 5000) }),
    ]);
    expect(result).toMatchObject({ measured: false, reason: "un_solo_punto" });
  });

  it("⭐ unidades distintas no se restan", () => {
    // Facturación en USD y en ARS no son el mismo número. Preferimos
    // "no se puede comparar" a algo que parece una respuesta.
    const result = deriveClientCase([
      win({ id: "a", winDate: "2026-01-01", metric: metric("facturacion", 2000, "USD") }),
      win({ id: "b", winDate: "2026-04-01", metric: metric("facturacion", 900000, "ARS") }),
    ]);
    expect(result).toMatchObject({ measured: false, reason: "unidades_distintas" });
  });

  it("dos números del mismo día no tienen plazo", () => {
    const result = deriveClientCase([
      win({ id: "a", winDate: "2026-01-01", metric: metric("facturacion", 1000) }),
      win({ id: "b", winDate: "2026-01-01", metric: metric("facturacion", 3000) }),
    ]);
    expect(result).toMatchObject({ measured: false, reason: "misma_fecha" });
  });

  it("un baseline sin fecha no sirve como punto de partida", () => {
    const baseline: ClientBaseline = {
      metricKey: "facturacion",
      metricValue: 100,
      metricUnit: "USD",
      capturedAt: null,
    };
    const result = deriveClientCase(
      [win({ winDate: "2026-03-01", metric: metric("facturacion", 5000) })],
      baseline
    );
    expect(result).toMatchObject({ measured: false, reason: "un_solo_punto" });
  });

  it("un porcentaje desde cero es null, no un número enorme", () => {
    const result = deriveClientCase([
      win({ id: "a", winDate: "2026-01-01", metric: metric("clientes", 0, null) }),
      win({ id: "b", winDate: "2026-02-01", metric: metric("clientes", 7, null) }),
    ]);
    if (!result.measured) throw new Error("debería medir");
    expect(result.delta).toBe(7);
    expect(result.deltaPercent).toBeNull();
  });
});

describe("ayudas del dashboard", () => {
  it("lista las medidas disponibles, ordenadas y sin repetir", () => {
    expect(
      availableMetricKeys([
        win({ id: "a", metric: metric("seguidores", 1, null) }),
        win({ id: "b", metric: metric("facturacion", 2) }),
        win({ id: "c", metric: metric("facturacion", 3) }),
        win({ id: "d" }),
      ])
    ).toEqual(["facturacion", "seguidores"]);
  });

  it("agrupa wins por cliente sin mezclarlos", () => {
    const grouped = groupWinsByClient([
      win({ id: "a", clientId: "cl1" }),
      win({ id: "b", clientId: "cl2" }),
      win({ id: "c", clientId: "cl1" }),
    ]);
    expect(grouped.get("cl1")).toHaveLength(2);
    expect(grouped.get("cl2")).toHaveLength(1);
  });
});
