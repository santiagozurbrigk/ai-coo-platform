import { describe, expect, it } from "vitest";
import {
  getReportCadence,
  isReportPeriod,
  isStale,
  REPORT_CADENCES,
} from "../cadences";

describe("catálogo de cadencias", () => {
  it("tiene exactamente las tres del documento fuente", () => {
    expect(REPORT_CADENCES.map((c) => c.id)).toEqual(["daily", "weekly", "monthly"]);
  });

  it("⭐ sólo el diario lleva advertencia de lectura", () => {
    // El documento es explícito en que no se decide con un solo día de datos.
    // Poner la advertencia en las tres la volvería ruido de fondo y nadie la
    // leería en la que importa.
    const conAdvertencia = REPORT_CADENCES.filter((c) => c.caution !== null);
    expect(conAdvertencia.map((c) => c.id)).toEqual(["daily"]);
  });

  it("cada cadencia dice qué mira y cuándo corre", () => {
    for (const cadence of REPORT_CADENCES) {
      expect(cadence.label.length).toBeGreaterThan(0);
      expect(cadence.title.length).toBeGreaterThan(0);
      expect(cadence.watches.length).toBeGreaterThan(0);
      expect(cadence.schedule.length).toBeGreaterThan(0);
    }
  });

  it("getReportCadence lanza ante una cadencia desconocida", () => {
    expect(() => getReportCadence("anual" as never)).toThrow();
  });

  it("isReportPeriod reconoce las tres y rechaza el resto", () => {
    expect(isReportPeriod("daily")).toBe(true);
    expect(isReportPeriod("weekly")).toBe(true);
    expect(isReportPeriod("monthly")).toBe(true);
    expect(isReportPeriod("anual")).toBe(false);
    expect(isReportPeriod("")).toBe(false);
  });
});

describe("isStale", () => {
  const ahora = new Date("2026-08-30T12:00:00.000Z");
  const haceDias = (d: number) =>
    new Date(ahora.getTime() - d * 24 * 60 * 60 * 1000).toISOString();

  it("un diario de hoy o ayer está vigente", () => {
    expect(isStale("daily", haceDias(0), ahora)).toBe(false);
    expect(isStale("daily", haceDias(1), ahora)).toBe(false);
  });

  it("un diario de hace tres días quedó viejo", () => {
    // Con margen de un día sobre el ciclo: si el cron falló una vez no se
    // grita, pero dos días seguidos sin pulso sí es una señal.
    expect(isStale("daily", haceDias(3), ahora)).toBe(true);
  });

  it("un semanal aguanta más de una semana antes de marcarse viejo", () => {
    expect(isStale("weekly", haceDias(7), ahora)).toBe(false);
    expect(isStale("weekly", haceDias(9), ahora)).toBe(true);
  });

  it("un mensual aguanta más de un mes", () => {
    expect(isStale("monthly", haceDias(30), ahora)).toBe(false);
    expect(isStale("monthly", haceDias(40), ahora)).toBe(true);
  });

  it("una fecha ilegible no se marca vieja", () => {
    // Un reporte que existe pero cuya fecha no se pudo leer no es un reporte
    // vencido: es un dato que falta. Gritar "quedó viejo" sería inventar.
    expect(isStale("weekly", "no-es-fecha", ahora)).toBe(false);
    expect(isStale("weekly", "", ahora)).toBe(false);
  });

  it("una fecha futura no se marca vieja", () => {
    const futuro = new Date(ahora.getTime() + 86400000).toISOString();
    expect(isStale("daily", futuro, ahora)).toBe(false);
  });
});
