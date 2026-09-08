import { describe, expect, it } from "vitest";
import {
  dealsOfMember,
  matchesCloser,
  normalizePersonName,
} from "@/lib/metrics/match-closer";

describe("⭐ la regla que decide a quién se le paga la comisión", () => {
  it("el mismo nombre matchea", () => {
    expect(matchesCloser({ memberName: "Juan Pérez" }, { closerName: "Juan Pérez" })).toBe(true);
  });

  it("mayúsculas y espacios de más no cambian a la persona", () => {
    expect(
      matchesCloser({ memberName: "  juan   PÉREZ " }, { closerName: "Juan Pérez" })
    ).toBe(true);
  });

  it("⭐ un acento tipeado distinto no debería costar una comisión", () => {
    expect(matchesCloser({ memberName: "Juan Perez" }, { closerName: "Juan Pérez" })).toBe(true);
  });

  it("⭐ el bug caro: un homónimo NO cobra la comisión de otro", () => {
    // La regla vieja hacía `incluye` con el primer nombre: con un Juan en el
    // equipo, cualquier closer llamado Juan le sumaba plata a esa fila.
    expect(matchesCloser({ memberName: "Juan Pérez" }, { closerName: "Juan Gómez" })).toBe(false);
    expect(matchesCloser({ memberName: "Juan Pérez" }, { closerName: "Juan" })).toBe(false);
  });

  it("un apellido de más tampoco matchea", () => {
    expect(
      matchesCloser({ memberName: "Juan Pérez" }, { closerName: "Juan Pérez García" })
    ).toBe(false);
  });

  it("⭐ un nombre vacío no matchea nunca, ni contra otro vacío", () => {
    expect(matchesCloser({ memberName: "" }, { closerName: "" })).toBe(false);
    expect(matchesCloser({ memberName: "   " }, { closerName: "Juan" })).toBe(false);
    expect(matchesCloser({ memberName: "Juan" }, { closerName: null })).toBe(false);
  });
});

describe("cuando hay id, manda el id", () => {
  it("dos ids iguales matchean aunque el nombre esté escrito distinto", () => {
    expect(
      matchesCloser(
        { memberId: "u1", memberName: "Juan P." },
        { closerId: "u1", closerName: "Juan Pérez" }
      )
    ).toBe(true);
  });

  it("⭐ dos ids distintos NO matchean aunque el nombre sea idéntico", () => {
    expect(
      matchesCloser(
        { memberId: "u1", memberName: "Juan Pérez" },
        { closerId: "u2", closerName: "Juan Pérez" }
      )
    ).toBe(false);
  });

  it("si sólo uno tiene id, se cae al nombre", () => {
    expect(
      matchesCloser({ memberId: "u1", memberName: "Juan Pérez" }, { closerName: "Juan Pérez" })
    ).toBe(true);
    expect(
      matchesCloser({ memberName: "Juan Pérez" }, { closerId: "u1", closerName: "Juan Pérez" })
    ).toBe(true);
  });

  it("un id vacío se trata como si no estuviera", () => {
    expect(
      matchesCloser({ memberId: "  ", memberName: "Juan" }, { closerId: "u1", closerName: "Juan" })
    ).toBe(true);
  });
});

describe("filtrar las ventas de un miembro", () => {
  const ventas = [
    { closerName: "Juan Pérez", revenue: 100 },
    { closerName: "Juan Gómez", revenue: 200 },
    { closerName: "juan perez", revenue: 50 },
    { closerName: null, revenue: 999 },
  ];

  it("se queda con las suyas y sólo con las suyas", () => {
    const propias = dealsOfMember({ memberName: "Juan Pérez" }, ventas);
    expect(propias.map((v) => v.revenue)).toEqual([100, 50]);
  });

  it("un miembro sin ventas no se lleva nada", () => {
    expect(dealsOfMember({ memberName: "Ana Ruiz" }, ventas)).toEqual([]);
  });
});

describe("normalizar un nombre", () => {
  it("saca acentos, mayúsculas y espacios repetidos", () => {
    expect(normalizePersonName("  Álvaro   DÍAZ ")).toBe("alvaro diaz");
  });

  it("null y undefined dan vacío", () => {
    expect(normalizePersonName(null)).toBe("");
    expect(normalizePersonName(undefined)).toBe("");
  });
});
