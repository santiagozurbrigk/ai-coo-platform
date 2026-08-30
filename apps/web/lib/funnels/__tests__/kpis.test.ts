/**
 * KPIs universales — sección 03 del documento.
 *
 * "These sit above every funnel type and are how funnels are compared to each
 *  other. Same formula, always."
 */

import { describe, it, expect } from "vitest";
import { UNIVERSAL_KPIS, getUniversalKpi, DECISIVE_RATIOS } from "../kpis";
import { DOC_KPIS } from "./document-fixture";

describe("las 6 tarjetas del documento", () => {
  const byAbbr = (abbr: string) => UNIVERSAL_KPIS.filter((k) => k.abbr === abbr);

  it("CAC copia título y fórmula", () => {
    const kpi = getUniversalKpi("cac")!;
    expect(kpi.label).toBe("Customer Acquisition Cost");
    expect(kpi.formula).toBe("total spend ÷ new customers");
    expect(kpi.direction).toBe("lower_is_better");
  });

  it("ROAS existe en sus dos versiones: blended y by-source", () => {
    // "Report both blended (all revenue ÷ all spend) and by-source from Hyros."
    expect(byAbbr("ROAS")).toHaveLength(2);
    expect(getUniversalKpi("roas_blended")!.formula).toBe("revenue ÷ ad spend");
    expect(getUniversalKpi("roas_by_source")!.formula).toBe("revenue ÷ ad spend");
  });

  it("EPL y EPC son revenue sobre leads y sobre clicks", () => {
    expect(getUniversalKpi("epl")!.denominator).toEqual({ kind: "stage", stageId: "lead" });
    expect(getUniversalKpi("epc")!.denominator).toEqual({ kind: "stage", stageId: "click" });
  });

  it("AOV copia título y fórmula", () => {
    const kpi = getUniversalKpi("aov")!;
    expect(kpi.label).toBe("Average Order Value");
    expect(kpi.formula).toBe("revenue ÷ orders");
  });

  it("LTV es compuesta: AOV × purchases × retention", () => {
    const kpi = getUniversalKpi("ltv")!;
    expect(kpi.formula).toBe("AOV × purchases × retention");
    expect(kpi.compose?.op).toBe("multiply");
    expect(kpi.compose?.refs).toEqual([
      { kind: "metric", metricId: "aov" },
      { kind: "purchases" },
      { kind: "retention_rate" },
    ]);
  });

  it("Cash Collected vs Contracted copia título y fórmula", () => {
    const kpi = getUniversalKpi("cash_collected_vs_contracted")!;
    expect(kpi.label).toBe("Cash Collected vs Contracted");
    expect(kpi.formula).toBe("cash in ÷ total contract value");
  });

  it("están las 6 abreviaturas del documento", () => {
    const abbrs = new Set(UNIVERSAL_KPIS.map((k) => k.abbr).filter(Boolean));
    for (const doc of DOC_KPIS) {
      // El documento agrupa EPL y EPC en una tarjeta; acá son dos métricas.
      const expected = doc.abbr === "EPL / EPC" ? "EPL" : doc.abbr;
      expect(abbrs).toContain(expected);
    }
  });
});

describe("las dos ratios decisivas", () => {
  it("son EPL vs CPL y LTV vs CAC", () => {
    // "every funnel [...] is judged on EPL vs CPL to know if it works and
    //  LTV vs CAC to know if it scales."
    expect(DECISIVE_RATIOS).toEqual(["epl_cpl_ratio", "ltv_cac_ratio"]);
  });

  it("se componen a partir de otros KPIs, no de fuentes sueltas", () => {
    expect(getUniversalKpi("ltv_cac_ratio")!.numerator).toEqual({
      kind: "metric",
      metricId: "ltv",
    });
    expect(getUniversalKpi("ltv_cac_ratio")!.denominator).toEqual({
      kind: "metric",
      metricId: "cac",
    });
    expect(getUniversalKpi("epl_cpl_ratio")!.numerator).toEqual({
      kind: "metric",
      metricId: "epl",
    });
    expect(getUniversalKpi("epl_cpl_ratio")!.denominator).toEqual({
      kind: "metric",
      metricId: "cpl",
    });
  });

  it("cada ratio decisiva resuelve a un KPI existente", () => {
    for (const id of DECISIVE_RATIOS) {
      expect(getUniversalKpi(id)).toBeDefined();
    }
  });
});

describe("integridad del catálogo", () => {
  it("no hay IDs duplicados", () => {
    const ids = UNIVERSAL_KPIS.map((k) => k.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("toda referencia a otra métrica resuelve dentro del catálogo", () => {
    const ids = new Set(UNIVERSAL_KPIS.map((k) => k.id));
    for (const kpi of UNIVERSAL_KPIS) {
      const refs = [kpi.numerator, kpi.denominator, ...(kpi.compose?.refs ?? [])];
      for (const ref of refs) {
        if (ref?.kind === "metric") expect(ids).toContain(ref.metricId);
      }
    }
  });

  it("los KPIs de costo apuntan a lower_is_better y los de valor a higher", () => {
    expect(getUniversalKpi("cac")!.direction).toBe("lower_is_better");
    expect(getUniversalKpi("cpl")!.direction).toBe("lower_is_better");
    expect(getUniversalKpi("epl")!.direction).toBe("higher_is_better");
    expect(getUniversalKpi("aov")!.direction).toBe("higher_is_better");
    expect(getUniversalKpi("roas_blended")!.direction).toBe("higher_is_better");
  });
});

describe("ROAS by-source vs blended (corregido 2026-08-30 con I-8)", () => {
  it("⭐ las dos ROAS NO usan las mismas medidas", () => {
    // El documento declara la separación no negociable: "the two never match
    // exactly, and a report that mixes them without labels is how bad decisions
    // get made". Si las dos leyeran revenue/spend, mostrarían el mismo número y
    // la etiqueta [Hyros] no significaría nada.
    const blended = getUniversalKpi("roas_blended")!;
    const bySource = getUniversalKpi("roas_by_source")!;

    expect(blended.numerator).toEqual({ kind: "revenue" });
    expect(blended.denominator).toEqual({ kind: "spend" });
    expect(bySource.numerator).toEqual({ kind: "attributed_revenue" });
    expect(bySource.denominator).toEqual({ kind: "attributed_spend" });
  });

  it("las dos conservan el texto de fórmula del documento", () => {
    // El documento usa las mismas palabras para las dos: lo que las distingue
    // son las medidas, no el texto.
    expect(getUniversalKpi("roas_blended")!.formula).toBe("revenue ÷ ad spend");
    expect(getUniversalKpi("roas_by_source")!.formula).toBe("revenue ÷ ad spend");
  });
});
