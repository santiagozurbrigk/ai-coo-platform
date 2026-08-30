import { describe, it, expect } from "vitest";
import {
  FUNNEL_SOURCES,
  DEFAULT_BINDINGS,
  DEFAULT_DM_BINDINGS,
  getFunnelSource,
  isFunnelSourceId,
  missingSourceConfig,
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

  it("la etapa Click del webinar y del VSL ya se alimenta con clicks de Meta", () => {
    // I-1 desbloquea Spend y Click en los tres embudos a la vez.
    expect(DEFAULT_BINDINGS.webinar["webinar.click"]).toBe("ad_clicks");
    expect(DEFAULT_BINDINGS.vsl_call["vsl.click"]).toBe("ad_clicks");
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

  it("webinar y VSL sólo tienen bindeado el click: el resto espera sus integraciones", () => {
    expect(Object.keys(DEFAULT_BINDINGS.webinar)).toEqual(["webinar.click"]);
    expect(Object.keys(DEFAULT_BINDINGS.vsl_call)).toEqual(["vsl.click"]);
  });
});

describe("compatibilidad fuente ↔ etapa (validación de setFunnelStepBindingAction)", () => {
  it("una fuente de llamadas no aplica a la etapa Lead", () => {
    // Bindear conteos de llamadas a Lead daría un número sin sentido. La action
    // valida esto antes de escribir.
    const source = getFunnelSource("closing_calls_attended")!;
    expect(source.suitableFor).not.toContain("lead");
  });

  it("una fuente de conversaciones no aplica a la etapa Cash", () => {
    const source = getFunnelSource("conversations_opened")!;
    expect(source.suitableFor).not.toContain("cash");
  });

  it("toda etapa que algún step del DM ocupa tiene al menos una fuente posible", () => {
    const dm = requireFunnelTemplate("dm");
    const sinOpciones = dm.steps.filter((s) => sourcesForStage(s.stageId).length === 0);
    // Desde I-1 la etapa `click` tiene fuente, así que ya no queda ningún paso
    // del DM sin ninguna opción posible.
    expect(sinOpciones).toEqual([]);
  });
});

describe("missingSourceConfig", () => {
  it("una fuente sin parámetros nunca falta configuración", () => {
    const source = getFunnelSource("conversations_opened")!;
    expect(missingSourceConfig(source, null)).toEqual([]);
    expect(missingSourceConfig(source, {})).toEqual([]);
  });

  it("ghl_stage_entered pide la etapa", () => {
    // Sin saber a qué etapa se refiere, contar "entradas a la etapa" sería
    // contar todas: una respuesta a una pregunta que nadie hizo.
    const source = getFunnelSource("ghl_stage_entered")!;
    expect(missingSourceConfig(source, null)).toEqual(["stageId"]);
    expect(missingSourceConfig(source, {})).toEqual(["stageId"]);
    expect(missingSourceConfig(source, { stageId: "   " })).toEqual(["stageId"]);
    expect(missingSourceConfig(source, { stageId: 42 })).toEqual(["stageId"]);
  });

  it("con la etapa elegida no falta nada", () => {
    const source = getFunnelSource("ghl_stage_entered")!;
    expect(missingSourceConfig(source, { stageId: "stage_2" })).toEqual([]);
  });

  it("toda fuente con parámetros requeridos los declara con kind y label", () => {
    for (const source of FUNNEL_SOURCES) {
      const fields = (source as { configFields?: readonly { key: string; label: string; kind: string }[] })
        .configFields;
      for (const field of fields ?? []) {
        expect(field.key.length).toBeGreaterThan(0);
        expect(field.label.length).toBeGreaterThan(0);
        expect(["ghl_stage", "ghl_pipeline", "vturb_player", "webinarjam_webinar"]).toContain(
          field.kind
        );
      }
    }
  });
});
