import { describe, it, expect } from "vitest";
import {
  FUNNEL_SOURCES,
  DEFAULT_BINDINGS,
  DEFAULT_DM_BINDINGS,
  getFunnelSource,
  isFunnelSourceId,
  sourcesForStage,
} from "../sources";
import { requireFunnelTemplate, FUNNEL_TEMPLATES } from "../templates";
import { getInstrumentationTool } from "../instrumentation";
import { isSpineStageId } from "../spine";

describe("catálogo de fuentes", () => {
  it("no hay ids duplicados", () => {
    const ids = FUNNEL_SOURCES.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("cada fuente declara una procedencia real", () => {
    for (const source of FUNNEL_SOURCES) {
      expect(() => getInstrumentationTool(source.provenance)).not.toThrow();
    }
  });

  it("cada fuente aplica a etapas válidas del spine", () => {
    for (const source of FUNNEL_SOURCES) {
      for (const stageId of source.suitableFor) {
        expect(isSpineStageId(stageId)).toBe(true);
      }
    }
  });

  it("sourcesForStage devuelve sólo fuentes de esa etapa", () => {
    for (const source of sourcesForStage("cash")) {
      expect(source.suitableFor).toContain("cash");
    }
  });

  it("isFunnelSourceId discrimina correctamente", () => {
    expect(isFunnelSourceId("conversations_opened")).toBe(true);
    expect(isFunnelSourceId("inventada")).toBe(false);
    expect(getFunnelSource("inventada")).toBeUndefined();
  });
});

describe("bindings por defecto", () => {
  it("hay una entrada por cada plantilla registrada", () => {
    for (const template of FUNNEL_TEMPLATES) {
      expect(DEFAULT_BINDINGS[template.id]).toBeDefined();
    }
  });

  it("todo binding apunta a un step real de su plantilla", () => {
    for (const [templateId, bindings] of Object.entries(DEFAULT_BINDINGS)) {
      const stepIds = new Set(requireFunnelTemplate(templateId).steps.map((s) => s.id));
      for (const stepId of Object.keys(bindings)) {
        expect(stepIds).toContain(stepId);
      }
    }
  });

  it("todo binding apunta a una fuente real", () => {
    for (const bindings of Object.values(DEFAULT_BINDINGS)) {
      for (const sourceId of Object.values(bindings)) {
        expect(getFunnelSource(sourceId)).toBeDefined();
      }
    }
  });

  it("cada fuente bindeada sirve para la etapa de su step", () => {
    for (const [templateId, bindings] of Object.entries(DEFAULT_BINDINGS)) {
      const template = requireFunnelTemplate(templateId);
      for (const [stepId, sourceId] of Object.entries(bindings)) {
        const step = template.steps.find((s) => s.id === stepId)!;
        const source = getFunnelSource(sourceId)!;
        expect(source.suitableFor).toContain(step.stageId);
      }
    }
  });

  it("el DM cubre 5 de sus 6 pasos", () => {
    const dm = requireFunnelTemplate("dm");
    expect(Object.keys(DEFAULT_DM_BINDINGS)).toHaveLength(dm.steps.length - 1);
  });

  it("dm.trigger queda sin fuente a propósito", () => {
    // OTC no tiene hoy una fuente de disparadores (comentarios / historias / ads
    // que inician conversación). El hueco es honesto y se muestra como falta de
    // instrumentación, no como cero.
    expect(DEFAULT_DM_BINDINGS["dm.trigger"]).toBeUndefined();
  });

  it("webinar y VSL no tienen bindings: esperan sus integraciones", () => {
    expect(DEFAULT_BINDINGS.webinar).toEqual({});
    expect(DEFAULT_BINDINGS.vsl_call).toEqual({});
  });
});
