/**
 * Evaluador de health bands.
 *
 * El grupo más importante es el de `null` vs `0`: es el riesgo principal del
 * diseño (docs/FUNNELS_ARCHITECTURE.md §9.1). Confundir un hueco de
 * instrumentación con una rotura de negocio hace que el diagnóstico mienta.
 */

import { describe, it, expect } from "vitest";
import {
  applyHealthBand,
  applyCrossFunnelBand,
  resolveBenchmark,
  requiresDiagnosis,
  requiresInstrumentationFix,
  BENCHMARK_TOLERANCE,
  CROSS_FUNNEL_BANDS,
} from "../health-bands";
import type { Benchmark } from "../types";
import { DOC_HEALTH_BANDS } from "./document-fixture";

const showUpRate: Benchmark = { kind: "range", min: 30, max: 50, unit: "percentage" };
const costPerRegistrant: Benchmark = { kind: "range", min: 3, max: 15, unit: "currency" };

describe("null vs 0 — el riesgo principal (§9.1)", () => {
  it("sin datos devuelve no_data, no below", () => {
    expect(applyHealthBand(null, showUpRate, "higher_is_better")).toBe("no_data");
  });

  it("NaN también cuenta como sin datos", () => {
    expect(applyHealthBand(Number.NaN, showUpRate, "higher_is_better")).toBe("no_data");
  });

  it("un cero real sí es una rotura de negocio", () => {
    expect(applyHealthBand(0, showUpRate, "higher_is_better")).toBe("below");
  });

  it("sin datos pide arreglar instrumentación, no diagnosticar el negocio", () => {
    expect(requiresInstrumentationFix("no_data")).toBe(true);
    expect(requiresDiagnosis("no_data")).toBe(false);
  });

  it("below sí dispara diagnóstico de negocio", () => {
    expect(requiresDiagnosis("below")).toBe(true);
    expect(requiresInstrumentationFix("below")).toBe(false);
  });
});

describe("dirección de la métrica", () => {
  it("una tasa por encima del piso está on target", () => {
    expect(applyHealthBand(35, showUpRate, "higher_is_better")).toBe("good");
  });

  it("una tasa dentro del 20% por debajo del piso está en watch", () => {
    // piso 30, tolerancia 20% → 24
    expect(applyHealthBand(26, showUpRate, "higher_is_better")).toBe("watch");
    expect(applyHealthBand(24, showUpRate, "higher_is_better")).toBe("watch");
  });

  it("una tasa más de 20% por debajo del piso está below", () => {
    expect(applyHealthBand(23.9, showUpRate, "higher_is_better")).toBe("below");
  });

  it("un costo por debajo del rango es bueno, no malo", () => {
    expect(applyHealthBand(2, costPerRegistrant, "lower_is_better")).toBe("good");
  });

  it("un costo por encima del techo, dentro del 20%, está en watch", () => {
    // techo 15, tolerancia 20% → 18
    expect(applyHealthBand(17, costPerRegistrant, "lower_is_better")).toBe("watch");
  });

  it("un costo más de 20% por encima del techo está below", () => {
    expect(applyHealthBand(25, costPerRegistrant, "lower_is_better")).toBe("below");
  });

  it("la misma cifra da resultados opuestos según la dirección", () => {
    expect(applyHealthBand(2, costPerRegistrant, "lower_is_better")).toBe("good");
    expect(applyHealthBand(2, costPerRegistrant, "higher_is_better")).toBe("below");
  });
});

describe("benchmarks sin piso", () => {
  it('un "context-set" no se evalúa', () => {
    expect(applyHealthBand(42, { kind: "context_set" }, "higher_is_better")).toBe("no_benchmark");
  });

  it("un floor no aplica a una métrica donde menos es mejor", () => {
    const floor: Benchmark = { kind: "floor", min: 10, unit: "percentage" };
    expect(applyHealthBand(5, floor, "lower_is_better")).toBe("no_benchmark");
  });

  it("un ceiling no aplica a una métrica donde más es mejor", () => {
    const ceiling: Benchmark = { kind: "ceiling", max: 10, unit: "currency" };
    expect(applyHealthBand(5, ceiling, "higher_is_better")).toBe("no_benchmark");
  });
});

describe("precedencia de benchmark (§3.5)", () => {
  const template: Benchmark = { kind: "range", min: 30, max: 50, unit: "percentage" };
  const override: Benchmark = { kind: "range", min: 35, max: 55, unit: "percentage" };
  const baseline: Benchmark = { kind: "range", min: 42, max: 60, unit: "percentage" };

  it("sin overrides gana la plantilla", () => {
    expect(resolveBenchmark(template)).toEqual({ benchmark: template, source: "template" });
  });

  it("el override por oferta le gana a la plantilla", () => {
    expect(resolveBenchmark(template, override)).toEqual({
      benchmark: override,
      source: "offer_override",
    });
  });

  it("el baseline propio de la org le gana a todo", () => {
    // "Reset each floor against the client's own 30-day baseline once there is
    //  one, then treat the baseline as the benchmark."
    expect(resolveBenchmark(template, override, baseline)).toEqual({
      benchmark: baseline,
      source: "org_baseline",
    });
  });

  it("un override nulo no pisa a la plantilla", () => {
    expect(resolveBenchmark(template, null, null).source).toBe("template");
  });
});

describe("sección 04 — tabla cross-funnel", () => {
  it("tiene una fila por cada métrica del documento, en orden", () => {
    expect(CROSS_FUNNEL_BANDS.map((b) => b.label)).toEqual(
      DOC_HEALTH_BANDS.map((b) => b.metric)
    );
  });

  it("conserva los textos literales de cada celda del documento", () => {
    CROSS_FUNNEL_BANDS.forEach((band, i) => {
      const doc = DOC_HEALTH_BANDS[i]!;
      expect(band.sourceLabels.good).toBe(doc.good);
      expect(band.sourceLabels.watch).toBe(doc.watch);
      expect(band.sourceLabels.below).toBe(doc.below);
      expect(band.readAs).toBe(doc.readAs);
    });
  });

  const band = (metricId: string) => CROSS_FUNNEL_BANDS.find((b) => b.metricId === metricId)!;

  it("LTV:CAC — ≥3.0 on target, 2.0–3.0 watch, <2.0 below", () => {
    expect(applyCrossFunnelBand(3.4, band("ltv_cac_ratio"))).toBe("good");
    expect(applyCrossFunnelBand(3.0, band("ltv_cac_ratio"))).toBe("good");
    expect(applyCrossFunnelBand(2.5, band("ltv_cac_ratio"))).toBe("watch");
    expect(applyCrossFunnelBand(1.9, band("ltv_cac_ratio"))).toBe("below");
    expect(applyCrossFunnelBand(null, band("ltv_cac_ratio"))).toBe("no_data");
  });

  it("EPL vs CPL — >1.5× on target, ≈CPL watch, <CPL below", () => {
    expect(applyCrossFunnelBand(1.8, band("epl_cpl_ratio"))).toBe("good");
    expect(applyCrossFunnelBand(1.0, band("epl_cpl_ratio"))).toBe("watch");
    expect(applyCrossFunnelBand(0.9, band("epl_cpl_ratio"))).toBe("below");
  });

  it("Blended ROAS — ≥2.0 on target, 1.3–2.0 watch, <1.3 below", () => {
    expect(applyCrossFunnelBand(2.2, band("roas_blended"))).toBe("good");
    expect(applyCrossFunnelBand(1.5, band("roas_blended"))).toBe("watch");
    expect(applyCrossFunnelBand(1.2, band("roas_blended"))).toBe("below");
  });

  it("Show rate — ≥60% on target, 45–60% watch, <45% below", () => {
    expect(applyCrossFunnelBand(62, band("show_rate"))).toBe("good");
    expect(applyCrossFunnelBand(50, band("show_rate"))).toBe("watch");
    expect(applyCrossFunnelBand(40, band("show_rate"))).toBe("below");
  });

  it("Close rate — ≥25% on target, 15–25% watch, <15% below", () => {
    expect(applyCrossFunnelBand(30, band("close_rate"))).toBe("good");
    expect(applyCrossFunnelBand(20, band("close_rate"))).toBe("watch");
    expect(applyCrossFunnelBand(10, band("close_rate"))).toBe("below");
  });

  describe("Lead → Intent (comparador relativo al benchmark)", () => {
    const leadToIntent = band("lead_to_intent");

    it("al nivel del benchmark o por encima está on target", () => {
      expect(applyCrossFunnelBand(30, leadToIntent, 30)).toBe("good");
      expect(applyCrossFunnelBand(33, leadToIntent, 30)).toBe("good");
    });

    it("dentro del 20% por debajo está en watch", () => {
      expect(applyCrossFunnelBand(25, leadToIntent, 30)).toBe("watch");
      expect(applyCrossFunnelBand(24, leadToIntent, 30)).toBe("watch");
    });

    it("más de 20% por debajo está below", () => {
      // El documento imprime "> −20%" en esta celda, que es una errata: por
      // contexto, "below floor" es estar MÁS de 20% por debajo del benchmark.
      expect(applyCrossFunnelBand(20, leadToIntent, 30)).toBe("below");
    });

    it("sin benchmark de referencia no se puede evaluar", () => {
      expect(applyCrossFunnelBand(25, leadToIntent, null)).toBe("no_benchmark");
      expect(applyCrossFunnelBand(25, leadToIntent)).toBe("no_benchmark");
    });

    it("usa la tolerancia del documento", () => {
      expect(leadToIntent.comparator).toBe("relative_to_benchmark");
      if (leadToIntent.comparator === "relative_to_benchmark") {
        expect(leadToIntent.watchTolerance).toBe(BENCHMARK_TOLERANCE);
      }
    });
  });
});

describe("tolerancia por defecto", () => {
  it('vale 0.2, tomado del "−20% of bench" de la sección 04', () => {
    expect(BENCHMARK_TOLERANCE).toBe(0.2);
  });

  it("se puede sobreescribir por llamada", () => {
    // Con tolerancia 0.5, el piso efectivo de un rango 30–50 baja a 15.
    expect(applyHealthBand(20, showUpRate, "higher_is_better", 0.5)).toBe("watch");
    expect(applyHealthBand(20, showUpRate, "higher_is_better")).toBe("below");
  });
});
