/**
 * Capa pura de cálculo.
 *
 * El grupo que más importa es la propagación de `null`: es la regla que evita
 * que el módulo confunda un hueco de instrumentación con una rotura de negocio
 * (docs/FUNNELS_ARCHITECTURE.md §9.1).
 */

import { describe, it, expect } from "vitest";
import {
  computeFunnel,
  computeStages,
  computeUniversalKpi,
  type OrgMeasures,
  type StepCounts,
} from "../compute";
import { requireFunnelTemplate } from "../templates";
import { DECISIVE_RATIOS, UNIVERSAL_KPIS } from "../kpis";

const dm = requireFunnelTemplate("dm");
const vsl = requireFunnelTemplate("vsl_call");
const webinar = requireFunnelTemplate("webinar");

/** Un embudo DM con números redondos, para que las tasas sean verificables a mano. */
const dmCounts: StepCounts = {
  "dm.trigger": 1000,
  "dm.conversation": 500,
  "dm.replied": 300,
  "dm.set": 120,
  "dm.show": 72,
  "dm.close": 18,
};

describe("estados de etapa", () => {
  it("una etapa sin steps en la plantilla queda salteada, no rota", () => {
    const stages = computeStages(vsl, {});
    const lead = stages.find((s) => s.stageId === "lead")!;
    expect(lead.state).toBe("skipped");
    expect(lead.stepIds).toEqual([]);
  });

  it("una etapa con steps pero sin datos queda en no_data", () => {
    const stages = computeStages(dm, {});
    const conversations = stages.find((s) => s.stageId === "lead")!;
    expect(conversations.state).toBe("no_data");
    expect(conversations.count).toBeNull();
  });

  it("una etapa con datos queda medida", () => {
    const stages = computeStages(dm, dmCounts);
    expect(stages.find((s) => s.stageId === "lead")!.state).toBe("measured");
    expect(stages.find((s) => s.stageId === "lead")!.count).toBe(500);
  });

  it("un cero real es un dato, no un hueco", () => {
    const stages = computeStages(dm, { ...dmCounts, "dm.conversation": 0 });
    const lead = stages.find((s) => s.stageId === "lead")!;
    expect(lead.state).toBe("measured");
    expect(lead.count).toBe(0);
  });

  it("el conteo de una etapa con varios steps es el del primero", () => {
    // En el webinar, `engaged` tiene dos steps: asistentes y los que se quedaron
    // al pitch. El conteo de la etapa es la entrada, o sea los asistentes.
    const stages = computeStages(webinar, {
      "webinar.attendance": 400,
      "webinar.stick": 250,
    });
    expect(stages.find((s) => s.stageId === "engaged")!.count).toBe(400);
  });

  it("siempre devuelve las 7 etapas del spine", () => {
    expect(computeStages(dm, dmCounts)).toHaveLength(7);
  });
});

describe("transiciones entre etapas", () => {
  it("calcula la conversión entre etapas consecutivas ocupadas", () => {
    const { transitions } = computeFunnel(dm, dmCounts);
    const leadToEngaged = transitions.find(
      (t) => t.fromStageId === "lead" && t.toStageId === "engaged"
    )!;
    expect(leadToEngaged.rate).toBeCloseTo(60); // 300 / 500
  });

  it("saltear una etapa no corta la cadena", () => {
    // El VSL va de click a engaged sin pasar por lead. Esa transición es legítima.
    const { transitions } = computeFunnel(vsl, {
      "vsl.click": 1000,
      "vsl.watch": 600,
    });
    const clickToEngaged = transitions.find((t) => t.fromStageId === "click");
    expect(clickToEngaged?.toStageId).toBe("engaged");
    expect(clickToEngaged?.rate).toBeCloseTo(60);
  });

  it("una transición sin datos en un extremo no se computa", () => {
    const { transitions } = computeFunnel(dm, { ...dmCounts, "dm.replied": null });
    const leadToEngaged = transitions.find((t) => t.fromStageId === "lead")!;
    expect(leadToEngaged.rate).toBeNull();
  });

  it("dividir por cero da null, no cero por ciento", () => {
    // Una tasa sobre cero es indefinida. Mostrarla como 0% sería justamente el
    // error que §9.1 quiere evitar.
    const { transitions } = computeFunnel(dm, { ...dmCounts, "dm.conversation": 0 });
    const leadToEngaged = transitions.find((t) => t.fromStageId === "lead")!;
    expect(leadToEngaged.rate).toBeNull();
  });
});

describe("cálculo de métricas", () => {
  it("una tasa usa su denominador declarado", () => {
    const { metrics } = computeFunnel(dm, dmCounts);
    // Active-reply rate = replied / conversations = 300 / 500
    expect(metrics.find((m) => m.metricId === "dm.active_reply_rate")!.value).toBeCloseTo(60);
    // Set rate = set / conversations = 120 / 500
    expect(metrics.find((m) => m.metricId === "dm.set_rate")!.value).toBeCloseTo(24);
    // Show rate = show / set = 72 / 120
    expect(metrics.find((m) => m.metricId === "dm.show_rate")!.value).toBeCloseTo(60);
  });

  it("el mismo evento con dos denominadores da dos valores distintos", () => {
    const { metrics } = computeFunnel(webinar, {
      "webinar.registration": 1000,
      "webinar.attendance": 400,
      "webinar.sale": 20,
    });
    // 20 / 400 = 5% sobre asistentes; 20 / 1000 = 2% sobre registrantes.
    expect(metrics.find((m) => m.metricId === "webinar.attendee_to_sale")!.value).toBeCloseTo(5);
    expect(metrics.find((m) => m.metricId === "webinar.registrant_to_sale")!.value).toBeCloseTo(2);
  });

  it("una métrica con un insumo faltante da null", () => {
    const { metrics } = computeFunnel(dm, { ...dmCounts, "dm.replied": null });
    expect(metrics.find((m) => m.metricId === "dm.active_reply_rate")!.value).toBeNull();
  });

  it("un costo por unidad necesita el spend, que hoy no tiene fuente", () => {
    const { metrics } = computeFunnel(dm, dmCounts, { spend: null });
    expect(metrics.find((m) => m.metricId === "dm.cost_per_conversation")!.value).toBeNull();
  });

  it("con spend disponible, el costo por unidad se calcula", () => {
    const { metrics } = computeFunnel(dm, dmCounts, { spend: 5000 });
    // 5000 / 500 conversaciones
    expect(metrics.find((m) => m.metricId === "dm.cost_per_conversation")!.value).toBeCloseTo(10);
  });

  it("una medida directa no divide por nada", () => {
    const { metrics } = computeFunnel(dm, dmCounts, { cash_collected: 42000 });
    expect(metrics.find((m) => m.metricId === "dm.cash_collected")!.value).toBe(42000);
  });
});

describe("KPIs universales sobre un embudo", () => {
  const measures: OrgMeasures = {
    spend: 10000,
    revenue: 45000,
    customers: 18,
    orders: 20,
    cash_collected: 45000,
    contracted_value: 90000,
  };

  it("CAC es spend sobre clientes nuevos", () => {
    expect(computeUniversalKpi("cac", dm, dmCounts, measures)).toBeCloseTo(10000 / 18);
  });

  it("ROAS blended es revenue sobre spend", () => {
    expect(computeUniversalKpi("roas_blended", dm, dmCounts, measures)).toBeCloseTo(4.5);
  });

  it("EPL usa el conteo de la etapa lead, no un step de una plantilla", () => {
    // 45000 / 500 conversaciones (la etapa lead del DM)
    expect(computeUniversalKpi("epl", dm, dmCounts, measures)).toBeCloseTo(90);
  });

  it("CPL y EPL se comparan sobre la misma base", () => {
    const epl = computeUniversalKpi("epl", dm, dmCounts, measures)!;
    const cpl = computeUniversalKpi("cpl", dm, dmCounts, measures)!;
    expect(epl / cpl).toBeCloseTo(4.5);
  });

  it("una ratio compuesta se resuelve a través de otras métricas", () => {
    // LTV = AOV × purchases × retention; sin purchases ni retention no hay LTV,
    // y por lo tanto tampoco LTV:CAC.
    expect(computeUniversalKpi("ltv", dm, dmCounts, measures)).toBeNull();
    expect(computeUniversalKpi("ltv_cac_ratio", dm, dmCounts, measures)).toBeNull();

    const full: OrgMeasures = { ...measures, purchases: 2, retention_rate: 0.8 };
    const aov = 45000 / 20;
    expect(computeUniversalKpi("ltv", dm, dmCounts, full)).toBeCloseTo(aov * 2 * 0.8);
  });

  it("cash collected vs contracted es un porcentaje", () => {
    expect(
      computeUniversalKpi("cash_collected_vs_contracted", dm, dmCounts, measures)
    ).toBeCloseTo(50);
  });

  it("una métrica desconocida da null en vez de romper", () => {
    expect(computeUniversalKpi("no_existe", dm, dmCounts, measures)).toBeNull();
  });
});

describe("embudo completo", () => {
  it("un embudo sin ningún dato no reporta ceros", () => {
    const { stages, metrics, transitions } = computeFunnel(dm, {});
    expect(stages.every((s) => s.count === null)).toBe(true);
    expect(metrics.every((m) => m.value === null)).toBe(true);
    expect(transitions.every((t) => t.rate === null)).toBe(true);
  });

  it("el DM con datos reales resuelve etapas, métricas y transiciones", () => {
    const result = computeFunnel(dm, dmCounts, { spend: 5000 });
    expect(result.stages.filter((s) => s.state === "measured")).toHaveLength(6);
    expect(result.transitions).toHaveLength(5);
    expect(result.metrics.some((m) => m.value !== null)).toBe(true);
  });
});

describe("KPIs universales en la salida (agregado con la UI, 2026-08-30)", () => {
  const template = dm;

  it("devuelve los KPIs universales aparte de las métricas de la plantilla", () => {
    // Van separados porque son de otra naturaleza: el documento los pone por
    // encima de cualquier embudo, como la forma de compararlos entre sí.
    const result = computeFunnel(template, {}, {});
    expect(result.kpis.length).toBe(UNIVERSAL_KPIS.length);
    expect(result.metrics.every((m) => !result.kpis.some((k) => k.metricId === m.metricId))).toBe(
      true
    );
  });

  it("incluye las dos ratios decisivas", () => {
    const result = computeFunnel(template, {}, {});
    for (const id of DECISIVE_RATIOS) {
      expect(result.kpis.some((k) => k.metricId === id)).toBe(true);
    }
  });

  it("⭐ sin medidas, todos los KPIs valen null y ninguno cero", () => {
    const result = computeFunnel(template, {}, {});
    expect(result.kpis.every((k) => k.value === null)).toBe(true);
  });

  it("calcula el ROAS blended con las medidas de la pasarela y de Meta", () => {
    const result = computeFunnel(template, {}, { revenue: 1000, spend: 250 });
    expect(result.kpis.find((k) => k.metricId === "roas_blended")!.value).toBe(4);
  });

  it("⭐ el ROAS by-source usa las medidas atribuidas y da distinto", () => {
    // Es la razón por la que existen dos tarjetas. Si compartieran medidas,
    // mostrarían el mismo número y la etiqueta [Hyros] no significaría nada.
    const result = computeFunnel(
      template,
      {},
      { revenue: 1000, spend: 250, attributed_revenue: 800, attributed_spend: 250 }
    );
    expect(result.kpis.find((k) => k.metricId === "roas_blended")!.value).toBe(4);
    expect(result.kpis.find((k) => k.metricId === "roas_by_source")!.value).toBe(3.2);
  });

  it("el by-source es null aunque el blended se pueda calcular", () => {
    // Sin Hyros conectado, la tarjeta atribuida dice "sin datos" en vez de
    // repetir el número del blended.
    const result = computeFunnel(template, {}, { revenue: 1000, spend: 250 });
    expect(result.kpis.find((k) => k.metricId === "roas_by_source")!.value).toBeNull();
  });
});
