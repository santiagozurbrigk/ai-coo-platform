/**
 * Instrumentación y cadencia — sección 05 del documento.
 */

import { describe, it, expect } from "vitest";
import {
  INSTRUMENTATION_TOOLS,
  REPORTING_CADENCE,
  DEFAULT_REPORTING_TIMEZONE,
  ATTRIBUTION_STACK,
  blockingTools,
  getInstrumentationTool,
} from "../instrumentation";
import { FUNNEL_TEMPLATES } from "../templates";
import { DOC_TOOLS, DOC_CADENCE } from "./document-fixture";

describe("dueño de cada etapa", () => {
  it("hay una herramienta por cada fila del documento", () => {
    expect(INSTRUMENTATION_TOOLS).toHaveLength(DOC_TOOLS.length);
  });

  it("copia lo que cada herramienta posee", () => {
    INSTRUMENTATION_TOOLS.forEach((tool, i) => {
      expect(tool.label).toBe(DOC_TOOLS[i]!.tool);
      expect(tool.owns).toBe(DOC_TOOLS[i]!.owns);
    });
  });

  it("todo sourceHint de las plantillas resuelve a una herramienta real", () => {
    for (const template of FUNNEL_TEMPLATES) {
      for (const step of template.steps) {
        expect(() => getInstrumentationTool(step.sourceHint)).not.toThrow();
      }
    }
  });
});

describe("track de integraciones bloqueante (§7)", () => {
  it("Hyros, el webinar y el hosting de VSL siguen sin existir en OTC", () => {
    expect(blockingTools().map((t) => t.id).sort()).toEqual([
      "hyros",
      "landing_page",
      "webinar_platform",
    ]);
  });

  it("el checkout está cubierto por un equivalente, así que no bloquea", () => {
    expect(getInstrumentationTool("checkout").otcStatus).toBe("equivalent");
  });

  it("el embudo DM no depende de ninguna herramienta faltante", () => {
    // Por eso es el que se implementa primero en la Fase 1.
    const dm = FUNNEL_TEMPLATES.find((t) => t.id === "dm")!;
    const blocking = new Set(blockingTools().map((t) => t.id));
    for (const step of dm.steps) {
      expect(blocking.has(step.sourceHint)).toBe(false);
    }
  });

  it("el webinar y el VSL sí dependen de herramientas faltantes", () => {
    const blocking = new Set(blockingTools().map((t) => t.id));
    for (const id of ["webinar", "vsl_call"]) {
      const template = FUNNEL_TEMPLATES.find((t) => t.id === id)!;
      expect(template.steps.some((s) => blocking.has(s.sourceHint))).toBe(true);
    }
  });
});

describe("cadencia de reporte", () => {
  it("tiene las tres frecuencias del documento", () => {
    expect(REPORTING_CADENCE.map((c) => c.title)).toEqual(DOC_CADENCE.map((c) => c.title));
  });

  it("el pulso diario todavía no existe en OTC", () => {
    expect(REPORTING_CADENCE.find((c) => c.id === "daily")!.otcStatus).toBe("missing");
  });

  it("los reportes semanal y mensual ya tienen cron", () => {
    expect(REPORTING_CADENCE.find((c) => c.id === "weekly")!.otcStatus).toBe("available");
    expect(REPORTING_CADENCE.find((c) => c.id === "monthly")!.otcStatus).toBe("available");
  });
});

describe("gobernanza (§3.7)", () => {
  it("el timezone de reporte por defecto es EST", () => {
    // "report every metric in EST (the Hyros dashboard defaults to Mountain Time)"
    expect(DEFAULT_REPORTING_TIMEZONE).toBe("America/New_York");
  });

  it("el stack de atribución es Hyros + Meta + GHL", () => {
    expect(ATTRIBUTION_STACK).toEqual(["hyros", "meta_ads", "crm_pipeline"]);
  });
});
