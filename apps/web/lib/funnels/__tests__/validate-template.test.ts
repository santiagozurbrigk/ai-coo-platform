/**
 * Validador de integridad de plantillas.
 *
 * Cubre las dos mitades: que las plantillas reales pasen, y que el validador
 * efectivamente atrape cada clase de error. Un validador que nunca falla no
 * protege nada.
 */

import { describe, it, expect } from "vitest";
import { validateAllTemplates, validateTemplate } from "../validate-template";
import { FUNNEL_TEMPLATES, requireFunnelTemplate } from "../templates";
import type { FunnelTemplate } from "../types";

const clone = (template: FunnelTemplate): FunnelTemplate =>
  structuredClone(template) as FunnelTemplate;

describe("las plantillas reales", () => {
  it("pasan el validador sin ningún problema", () => {
    expect(validateAllTemplates()).toEqual([]);
  });

  it("todas usan un token del design system, no un hex", () => {
    for (const template of FUNNEL_TEMPLATES) {
      expect(template.accentToken.startsWith("#")).toBe(false);
      expect(template.accentToken.startsWith("--")).toBe(true);
    }
  });

  it("toda métrica de un step tiene su benchmark declarado", () => {
    for (const template of FUNNEL_TEMPLATES) {
      for (const step of template.steps) {
        for (const metric of step.metrics) {
          expect(step.benchmarks[metric.id]).toBeDefined();
        }
      }
    }
  });
});

describe("el validador atrapa errores", () => {
  it("un step que referencia una etapa de spine inexistente", () => {
    const broken = clone(requireFunnelTemplate("dm"));
    // @ts-expect-error — se rompe a propósito para probar el validador
    broken.steps[0]!.stageId = "no_existe";

    const issues = validateTemplate(broken);
    expect(issues.some((i) => i.message.includes("Etapa de spine desconocida"))).toBe(true);
  });

  it("un denominador que apunta a un step inexistente", () => {
    const broken = clone(requireFunnelTemplate("dm"));
    broken.steps[2]!.metrics[0]!.denominator = { kind: "step", stepId: "dm.fantasma" };

    const issues = validateTemplate(broken);
    expect(issues.some((i) => i.message.includes("step inexistente: dm.fantasma"))).toBe(true);
  });

  it("un puntero north-star a una métrica que no existe", () => {
    const broken = clone(requireFunnelTemplate("webinar"));
    broken.northStar = { label: "Cost per Sale", metricId: "webinar.no_existe" };

    const issues = validateTemplate(broken);
    expect(issues.some((i) => i.path === "northStar")).toBe(true);
  });

  it("dos métricas con el mismo ID", () => {
    const broken = clone(requireFunnelTemplate("dm"));
    broken.steps[3]!.metrics[0]!.id = "dm.active_reply_rate";

    const issues = validateTemplate(broken);
    expect(issues.some((i) => i.message.includes("ID de métrica duplicado"))).toBe(true);
  });

  it("steps con el orden mal numerado", () => {
    const broken = clone(requireFunnelTemplate("dm"));
    broken.steps[1]!.order = 5;

    const issues = validateTemplate(broken);
    expect(issues.some((i) => i.path === "steps[].order")).toBe(true);
  });

  it("un step que retrocede en el spine", () => {
    // Es lo que haría imposible el diagnóstico "caminar el spine de izquierda a
    // derecha" del documento.
    const broken = clone(requireFunnelTemplate("dm"));
    broken.steps[3]!.stageId = "click";

    const issues = validateTemplate(broken);
    expect(issues.some((i) => i.message.includes("retrocede en el spine"))).toBe(true);
  });

  it("un benchmark que no corresponde a ninguna métrica del step", () => {
    const broken = clone(requireFunnelTemplate("dm"));
    broken.steps[2]!.benchmarks["dm.metrica_fantasma"] = {
      kind: "range",
      min: 1,
      max: 2,
      unit: "percentage",
    };

    const issues = validateTemplate(broken);
    expect(
      issues.some((i) => i.message.includes('El benchmark "dm.metrica_fantasma"'))
    ).toBe(true);
  });

  it("una métrica sin benchmark declarado", () => {
    const broken = clone(requireFunnelTemplate("dm"));
    delete broken.steps[2]!.benchmarks["dm.active_reply_rate"];

    const issues = validateTemplate(broken);
    expect(issues.some((i) => i.message.includes("Falta el benchmark"))).toBe(true);
  });

  it("un rango invertido", () => {
    const broken = clone(requireFunnelTemplate("dm"));
    broken.steps[2]!.benchmarks["dm.active_reply_rate"] = {
      kind: "range",
      min: 70,
      max: 50,
      unit: "percentage",
    };

    const issues = validateTemplate(broken);
    expect(issues.some((i) => i.message.includes("Rango invertido"))).toBe(true);
  });

  it("un accentToken hardcodeado como hex", () => {
    const broken = clone(requireFunnelTemplate("dm"));
    broken.accentToken = "#b0417a";

    const issues = validateTemplate(broken);
    expect(issues.some((i) => i.path === "accentToken")).toBe(true);
  });

  it("una plantilla que transcribe una versión distinta del documento", () => {
    const broken = clone(requireFunnelTemplate("dm"));
    broken.sourceDocVersion = "0.9";

    const issues = validateTemplate(broken);
    expect(issues.some((i) => i.path === "sourceDocVersion")).toBe(true);
  });

  it("un id que no está registrado en FUNNEL_TEMPLATE_IDS", () => {
    const broken = clone(requireFunnelTemplate("dm"));
    broken.id = "embudo_inventado";

    const issues = validateTemplate(broken);
    expect(issues.some((i) => i.path === "id")).toBe(true);
  });

  it("una métrica sin numerador ni compose no es computable", () => {
    const broken = clone(requireFunnelTemplate("dm"));
    broken.steps[2]!.metrics[0]!.numerator = null;

    const issues = validateTemplate(broken);
    expect(issues.some((i) => i.message.includes("debe declarar `compose`"))).toBe(true);
  });
});
