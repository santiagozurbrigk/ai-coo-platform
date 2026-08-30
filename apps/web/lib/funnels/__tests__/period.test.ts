import { describe, it, expect } from "vitest";
import {
  resolvePeriod,
  periodBounds,
  isPeriodPresetId,
  DEFAULT_PERIOD_PRESET,
  FUNNEL_PERIOD_PRESETS,
} from "../period";

const NOW = new Date("2026-08-29T15:30:00.000Z");

describe("ventanas de período", () => {
  it("7 días abarca exactamente 7 fechas, incluyendo hoy", () => {
    const period = resolvePeriod("7d", NOW);
    expect(period.end).toBe("2026-08-29");
    expect(period.start).toBe("2026-08-23");
  });

  it("30 días abarca 30 fechas", () => {
    const period = resolvePeriod("30d", NOW);
    expect(period.start).toBe("2026-07-31");
    expect(period.end).toBe("2026-08-29");
  });

  it("90 días abarca 90 fechas", () => {
    const period = resolvePeriod("90d", NOW);
    expect(period.start).toBe("2026-06-01");
    expect(period.end).toBe("2026-08-29");
  });

  it("sin preset usa el default de 30 días", () => {
    expect(resolvePeriod(undefined, NOW).presetId).toBe(DEFAULT_PERIOD_PRESET);
  });

  it("la hora del día no mueve la ventana", () => {
    const early = resolvePeriod("7d", new Date("2026-08-29T00:00:01.000Z"));
    const late = resolvePeriod("7d", new Date("2026-08-29T23:59:59.000Z"));
    expect(early).toEqual(late);
  });
});

describe("límites como timestamp", () => {
  it("el fin es exclusivo, al inicio del día siguiente", () => {
    // Si fuera inclusivo a las 00:00 del último día, se perdería todo lo que
    // pasó durante esa jornada.
    const bounds = periodBounds(resolvePeriod("7d", NOW));
    expect(bounds.fromIso).toBe("2026-08-23T00:00:00.000Z");
    expect(bounds.toIso).toBe("2026-08-30T00:00:00.000Z");
  });

  it("cruza fin de mes correctamente", () => {
    const bounds = periodBounds(resolvePeriod("7d", new Date("2026-08-31T10:00:00.000Z")));
    expect(bounds.toIso).toBe("2026-09-01T00:00:00.000Z");
  });
});

describe("validación de presets", () => {
  it("acepta los presets declarados", () => {
    for (const preset of FUNNEL_PERIOD_PRESETS) {
      expect(isPeriodPresetId(preset.id)).toBe(true);
    }
  });

  it("rechaza cualquier otra cosa", () => {
    expect(isPeriodPresetId("todo")).toBe(false);
    expect(isPeriodPresetId("")).toBe(false);
  });
});
