import { describe, expect, it } from "vitest";
import { computeOneOnOneStats } from "@/lib/fathom/one-on-one-types";

const HOY = new Date("2026-09-20T10:00:00Z");

describe("⭐ el contador de 1-1 del cliente", () => {
  it("sin llamadas no inventa nada", () => {
    expect(computeOneOnOneStats([], HOY)).toEqual({
      totalCalls: 0,
      firstDate: null,
      lastDate: null,
      everyDays: null,
      daysSinceLast: null,
    });
  });

  /**
   * ⭐ Con un solo punto no hay ritmo. Un "cada 0 días" se leería como que el
   * cliente tiene llamadas todos los días, que es lo contrario de la verdad.
   */
  it("con una sola llamada cuenta una y deja el ritmo en null", () => {
    const stats = computeOneOnOneStats(["2026-09-06"], HOY);
    expect(stats.totalCalls).toBe(1);
    expect(stats.everyDays).toBeNull();
    expect(stats.daysSinceLast).toBe(14);
  });

  it("calcula el ritmo sobre el período, no sobre los huecos", () => {
    // 1 de julio → 20 de septiembre son 81 días, en 4 intervalos: ~20 días.
    const stats = computeOneOnOneStats(
      ["2026-07-01", "2026-07-22", "2026-08-12", "2026-09-02", "2026-09-20"],
      HOY
    );
    expect(stats.totalCalls).toBe(5);
    expect(stats.firstDate).toBe("2026-07-01");
    expect(stats.lastDate).toBe("2026-09-20");
    expect(stats.everyDays).toBe(20);
    expect(stats.daysSinceLast).toBe(0);
  });

  it("no depende del orden en que vengan las fechas", () => {
    const desordenadas = computeOneOnOneStats(
      ["2026-09-02", "2026-07-01", "2026-08-12"],
      HOY
    );
    const ordenadas = computeOneOnOneStats(
      ["2026-07-01", "2026-08-12", "2026-09-02"],
      HOY
    );
    expect(desordenadas).toEqual(ordenadas);
  });

  /**
   * ⭐ Dos llamadas el mismo día darían división por cero si el ritmo se
   * calculara promediando huecos. Acá el piso es un día.
   */
  it("aguanta dos llamadas el mismo día", () => {
    const stats = computeOneOnOneStats(["2026-09-10", "2026-09-10"], HOY);
    expect(stats.totalCalls).toBe(2);
    expect(stats.everyDays).toBe(1);
  });

  it("acepta timestamps completos y descarta lo que no es una fecha", () => {
    const stats = computeOneOnOneStats(
      ["2026-09-01T14:48:50.000Z", "no es una fecha", "2026-09-15T09:00:00Z"],
      HOY
    );
    expect(stats.totalCalls).toBe(2);
    expect(stats.firstDate).toBe("2026-09-01");
    expect(stats.lastDate).toBe("2026-09-15");
    expect(stats.everyDays).toBe(14);
  });

  /**
   * ⭐ Una fecha a medianoche cae en el día anterior en cualquier huso al oeste
   * de Greenwich — o sea, en todo el mercado de Limitless.
   */
  it("no corre las fechas un día para atrás", () => {
    const stats = computeOneOnOneStats(["2026-09-20"], HOY);
    expect(stats.lastDate).toBe("2026-09-20");
    expect(stats.daysSinceLast).toBe(0);
  });
});
