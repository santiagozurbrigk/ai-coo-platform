/**
 * Conformidad de las plantillas contra el documento fuente.
 *
 * Estos tests son la revisión del documento vs. el código, automatizada. Cada
 * fila de cada tabla del `Funnel Metrics Standard v1.0` se compara con lo que la
 * plantilla dice.
 *
 * Si el documento avanza a v1.1: actualizar `document-fixture.ts` primero y
 * dejar que estos tests digan qué plantillas quedaron atrás.
 */

import { describe, it, expect } from "vitest";
import { FUNNEL_TEMPLATES, requireFunnelTemplate } from "../templates";
import { SPINE_STAGES } from "../spine";
import { SOURCE_DOC_VERSION } from "../types";
import type { Benchmark } from "../types";
import {
  DOC_FUNNELS,
  DOC_SPINE,
  DOC_STAGE_TO_ID,
  DOC_VERSION,
} from "./document-fixture";

describe("versión del documento", () => {
  it("el módulo declara la misma versión que la transcripción", () => {
    expect(SOURCE_DOC_VERSION).toBe(DOC_VERSION);
  });

  it("todas las plantillas declaran esa versión", () => {
    for (const template of FUNNEL_TEMPLATES) {
      expect(template.sourceDocVersion).toBe(DOC_VERSION);
    }
  });
});

describe("sección 01 — el spine universal", () => {
  it("tiene exactamente las 7 etapas del documento, en orden", () => {
    expect(SPINE_STAGES).toHaveLength(DOC_SPINE.length);

    SPINE_STAGES.forEach((stage, i) => {
      const doc = DOC_SPINE[i]!;
      expect(stage.order).toBe(doc.n);
      expect(stage.label).toBe(doc.name);
      expect(stage.metric).toBe(doc.metric);
      expect(stage.id).toBe(DOC_STAGE_TO_ID[doc.name]);
    });
  });
});

describe("sección 02 — los tres embudos mapeados", () => {
  it("hay una plantilla por cada embudo del documento, y ninguna de más", () => {
    expect(FUNNEL_TEMPLATES.map((t) => t.id).sort()).toEqual(
      DOC_FUNNELS.map((f) => f.templateId).sort()
    );
  });

  for (const doc of DOC_FUNNELS) {
    describe(doc.title, () => {
      const template = requireFunnelTemplate(doc.templateId);

      it("copia el encabezado del panel", () => {
        expect(template.label).toBe(doc.title);
        expect(template.description).toBe(doc.sub);
        expect(template.badge).toBe(doc.badge);
      });

      it("copia north-star, leading indicator y governing rate", () => {
        expect(template.northStar.label).toBe(doc.northStar);
        expect(template.leadingIndicator.label).toBe(doc.leadingIndicator);
        expect(template.governingRate.label).toBe(doc.governingRate);
      });

      it(`tiene ${doc.rows.length} steps, uno por fila de la tabla`, () => {
        expect(template.steps).toHaveLength(doc.rows.length);
      });

      doc.rows.forEach((row, i) => {
        it(`fila ${i + 1}: "${row.step}"`, () => {
          const step = template.steps[i]!;
          expect(step.stageId).toBe(DOC_STAGE_TO_ID[row.stage]);
          expect(step.label).toBe(row.step);
          expect(step.metricLabel).toBe(row.metric);
          expect(step.benchmarkLabel).toBe(row.range);
          expect(step.order).toBe(i + 1);
        });
      });
    });
  }
});

/**
 * El spine es disperso (§3.1): una etapa sin steps es válida y NO es una rotura.
 * El VSL es el caso fuerte — no tiene opt-in, así que no tiene etapa Lead.
 */
describe("spine disperso", () => {
  const skippedStages = (templateId: string) => {
    const template = requireFunnelTemplate(templateId);
    const used = new Set(template.steps.map((s) => s.stageId));
    return SPINE_STAGES.filter((s) => !used.has(s.id)).map((s) => s.id);
  };

  it("ningún embudo tiene step en Spend: el documento lo deja implícito en Meta Ads", () => {
    for (const doc of DOC_FUNNELS) {
      expect(skippedStages(doc.templateId)).toContain("spend");
    }
  });

  it("el VSL saltea Lead además de Spend", () => {
    expect(skippedStages("vsl_call").sort()).toEqual(["lead", "spend"]);
  });

  it("webinar y DM sólo saltean Spend", () => {
    expect(skippedStages("webinar")).toEqual(["spend"]);
    expect(skippedStages("dm")).toEqual(["spend"]);
  });
});

/**
 * La columna "Healthy range" del documento no es legible por máquina (§3.3).
 * Esto verifica que la normalización produjo los números correctos — es donde
 * un error de transcripción haría que el evaluador calcule mal en silencio.
 */
describe("normalización de los rangos sanos (§3.3)", () => {
  const expected: Record<string, Record<string, Benchmark>> = {
    webinar: {
      "webinar.ctr":                 { kind: "range", min: 1,  max: 3,  unit: "percentage" },
      "webinar.cost_per_click":      { kind: "context_set" },
      "webinar.reg_page_conv":       { kind: "range", min: 25, max: 45, unit: "percentage" },
      "webinar.cost_per_registrant": { kind: "range", min: 3,  max: 15, unit: "currency" },
      "webinar.show_up_rate":        { kind: "range", min: 30, max: 50, unit: "percentage" },
      "webinar.stick_rate":          { kind: "range", min: 50, max: 70, unit: "percentage" },
      "webinar.cta_click_rate":      { kind: "range", min: 15, max: 30, unit: "percentage" },
      "webinar.attendee_to_sale":    { kind: "range", min: 2,  max: 6,  unit: "percentage" },
      "webinar.registrant_to_sale":  { kind: "range", min: 1,  max: 3,  unit: "percentage" },
      "webinar.cash_collected":      { kind: "context_set" },
    },
    vsl_call: {
      "vsl.ctr":                   { kind: "range", min: 1,  max: 3,   unit: "percentage" },
      "vsl.cost_per_click":        { kind: "context_set" },
      "vsl.play_rate":             { kind: "range", min: 55, max: 70,  unit: "percentage" },
      "vsl.page_to_booking":       { kind: "range", min: 2,  max: 8,   unit: "percentage" },
      "vsl.cost_per_booked_call":  { kind: "range", min: 50, max: 300, unit: "currency" },
      "vsl.qualified_rate":        { kind: "range", min: 50, max: 75,  unit: "percentage" },
      "vsl.show_rate":             { kind: "range", min: 50, max: 70,  unit: "percentage" },
      "vsl.close_rate":            { kind: "range", min: 15, max: 30,  unit: "percentage" },
      "vsl.booked_to_close":       { kind: "range", min: 10, max: 20,  unit: "percentage" },
    },
    dm: {
      "dm.trigger_rate":          { kind: "context_set" },
      "dm.cost_per_trigger":      { kind: "context_set" },
      "dm.trigger_to_convo":      { kind: "range", min: 40, max: 70, unit: "percentage" },
      "dm.cost_per_conversation": { kind: "context_set" },
      "dm.active_reply_rate":     { kind: "range", min: 50, max: 70, unit: "percentage" },
      "dm.set_rate":              { kind: "range", min: 20, max: 40, unit: "percentage" },
      "dm.show_rate":             { kind: "range", min: 55, max: 75, unit: "percentage" },
      "dm.convo_to_close":        { kind: "range", min: 3,  max: 10, unit: "percentage" },
      "dm.cash_collected":        { kind: "context_set" },
    },
  };

  for (const [templateId, benchmarks] of Object.entries(expected)) {
    const template = requireFunnelTemplate(templateId);
    const actual = Object.assign({}, ...template.steps.map((s) => s.benchmarks)) as Record<
      string,
      Benchmark
    >;

    for (const [metricId, benchmark] of Object.entries(benchmarks)) {
      it(`${metricId}`, () => {
        expect(actual[metricId]).toMatchObject(benchmark);
      });
    }
  }

  it('el "avg watch %" del VSL queda sin piso: el documento escribe "to CTA" sin número', () => {
    const template = requireFunnelTemplate("vsl_call");
    const step = template.steps.find((s) => s.id === "vsl.watch")!;
    expect(step.benchmarks["vsl.avg_watch_pct"]!.kind).toBe("context_set");
  });

  it('el primer step del DM queda sin piso: el documento dice "context-set"', () => {
    const template = requireFunnelTemplate("dm");
    const step = template.steps[0]!;
    expect(step.benchmarkLabel).toBe("context-set");
    for (const benchmark of Object.values(step.benchmarks)) {
      expect(benchmark.kind).toBe("context_set");
    }
  });
});

/**
 * El denominador es parte de la identidad de la métrica (§3.4).
 *
 * Es el punto donde se aplicó criterio al transcribir, así que se verifica
 * explícitamente: el documento dice "of attendees", "reg → sale", "of shows" y
 * "booked → close", y cada uno tiene que haber quedado apuntando a la base
 * correcta.
 */
describe("denominadores explícitos (§3.4)", () => {
  const denominatorOf = (templateId: string, metricId: string) => {
    const template = requireFunnelTemplate(templateId);
    const all = [...template.funnelMetrics, ...template.steps.flatMap((s) => s.metrics)];
    return all.find((m) => m.id === metricId)?.denominator;
  };

  it('webinar: "Stick rate to offer" va sobre asistentes ("of attendees")', () => {
    expect(denominatorOf("webinar", "webinar.stick_rate")).toEqual({
      kind: "step",
      stepId: "webinar.attendance",
    });
  });

  it('webinar: "Offer-CTA click rate" va sobre asistentes ("of attendees")', () => {
    expect(denominatorOf("webinar", "webinar.cta_click_rate")).toEqual({
      kind: "step",
      stepId: "webinar.attendance",
    });
  });

  it("webinar: el mismo evento de venta tiene dos bases distintas", () => {
    // 2–6% sobre asistentes vs 1–3% sobre registrantes. Es el ejemplo canónico
    // del documento: sin denominador explícito serían indistinguibles.
    expect(denominatorOf("webinar", "webinar.attendee_to_sale")).toEqual({
      kind: "step",
      stepId: "webinar.attendance",
    });
    expect(denominatorOf("webinar", "webinar.registrant_to_sale")).toEqual({
      kind: "step",
      stepId: "webinar.registration",
    });
  });

  it('vsl: "Close rate (of shows)" va sobre shows, y "Booked → close" sobre bookings', () => {
    expect(denominatorOf("vsl_call", "vsl.close_rate")).toEqual({
      kind: "step",
      stepId: "vsl.show",
    });
    expect(denominatorOf("vsl_call", "vsl.booked_to_close")).toEqual({
      kind: "step",
      stepId: "vsl.booking",
    });
  });

  it('dm: "Trigger → convo" va sobre triggers ("of triggers")', () => {
    expect(denominatorOf("dm", "dm.trigger_to_convo")).toEqual({
      kind: "step",
      stepId: "dm.trigger",
    });
  });

  it('dm: "Conversation → close" va sobre conversaciones', () => {
    expect(denominatorOf("dm", "dm.convo_to_close")).toEqual({
      kind: "step",
      stepId: "dm.conversation",
    });
  });
});
