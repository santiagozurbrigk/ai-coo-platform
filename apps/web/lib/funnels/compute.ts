/**
 * lib/funnels/compute.ts
 *
 * Lógica PURA del motor de embudos: dado un conjunto de conteos por step y de
 * medidas a nivel organización, calcula estados de etapa, métricas y
 * transiciones.
 *
 * No toca Supabase ni la red a propósito — todo el IO vive en `resolve.ts`. Esta
 * separación es la que hace que el cálculo sea testeable sin base de datos.
 *
 * REGLA CENTRAL (docs/FUNNELS_ARCHITECTURE.md §9.1): `null` significa SIN DATOS y
 * se propaga. Nunca se sustituye por `0`. Un cero real es un dato — y un
 * problema de negocio; un `null` es un hueco de instrumentación.
 */

import { SPINE_STAGES, spineStageOrder, type SpineStageId } from "./spine";
import { getUniversalKpi } from "./kpis";
import type {
  FunnelTemplate,
  MetricDefinition,
  MetricRef,
  StageState,
} from "./types";

// ─── Entradas ─────────────────────────────────────────────────────────────────

/** stepId → conteo del período. `null` = sin datos. */
export type StepCounts = Record<string, number | null>;

/** Medidas a nivel organización, no atadas a un step. `null` = sin datos. */
export type OrgMeasures = {
  spend?: number | null;
  revenue?: number | null;
  cash_collected?: number | null;
  contracted_value?: number | null;
  reach?: number | null;
  impressions?: number | null;
  orders?: number | null;
  customers?: number | null;
  purchases?: number | null;
  retention_rate?: number | null;
  /** Medidas reportadas directamente por una fuente, ej. "avg_watch_pct". */
  reported?: Record<string, number | null>;
};

// ─── Salidas ──────────────────────────────────────────────────────────────────

export type ComputedStage = {
  stageId: SpineStageId;
  label: string;
  state: StageState;
  /** Conteo de entrada a la etapa. `null` si no hay datos. */
  count: number | null;
  stepIds: string[];
};

export type ComputedMetric = {
  metricId: string;
  label: string;
  unit: MetricDefinition["unit"];
  direction: MetricDefinition["direction"];
  value: number | null;
};

export type ComputedTransition = {
  fromStageId: SpineStageId;
  toStageId: SpineStageId;
  /** Porcentaje. `null` si falta alguno de los dos extremos. */
  rate: number | null;
  fromCount: number | null;
  toCount: number | null;
};

export type ComputedFunnel = {
  stages: ComputedStage[];
  metrics: ComputedMetric[];
  transitions: ComputedTransition[];
};

// ─── Etapas ───────────────────────────────────────────────────────────────────

/**
 * Estado de cada etapa del spine.
 *
 * Tres estados, tres significados distintos:
 * - `skipped`  → la plantilla no tiene steps en esa etapa. Correcto por diseño:
 *                el VSL no tiene Lead porque no hay opt-in.
 * - `no_data`  → hay steps pero ninguno trajo número. Falta instrumentación.
 * - `measured` → hay datos.
 *
 * El conteo de la etapa es el del PRIMER step que la ocupa: es la entrada a la
 * etapa. En el webinar, `engaged` tiene dos steps (asistieron / se quedaron al
 * pitch) y el conteo de la etapa es el de asistentes.
 */
export function computeStages(
  template: FunnelTemplate,
  stepCounts: StepCounts
): ComputedStage[] {
  return SPINE_STAGES.map((stage) => {
    const steps = template.steps
      .filter((s) => s.stageId === stage.id)
      .sort((a, b) => a.order - b.order);

    if (steps.length === 0) {
      return {
        stageId: stage.id,
        label: stage.label,
        state: "skipped" as StageState,
        count: null,
        stepIds: [],
      };
    }

    const entryCount = stepCounts[steps[0]!.id] ?? null;
    const anyData = steps.some((s) => (stepCounts[s.id] ?? null) !== null);

    return {
      stageId: stage.id,
      label: stage.label,
      state: (anyData ? "measured" : "no_data") as StageState,
      count: entryCount,
      stepIds: steps.map((s) => s.id),
    };
  });
}

// ─── Métricas ─────────────────────────────────────────────────────────────────

type ResolveContext = {
  template: FunnelTemplate;
  stepCounts: StepCounts;
  stageCounts: Record<string, number | null>;
  measures: OrgMeasures;
};

function allMetrics(template: FunnelTemplate): MetricDefinition[] {
  return [...template.funnelMetrics, ...template.steps.flatMap((s) => s.metrics)];
}

function resolveRef(
  ref: MetricRef,
  ctx: ResolveContext,
  seen: Set<string>
): number | null {
  switch (ref.kind) {
    case "step":
      return ctx.stepCounts[ref.stepId] ?? null;
    case "stage":
      return ctx.stageCounts[ref.stageId] ?? null;
    case "metric":
      return resolveMetricById(ref.metricId, ctx, seen);
    case "reported":
      return ctx.measures.reported?.[ref.measureId] ?? null;
    default:
      return ctx.measures[ref.kind] ?? null;
  }
}

/**
 * Valor de una métrica.
 *
 * Devuelve `null` cuando falta cualquiera de sus insumos, o cuando el
 * denominador es cero — una tasa sobre cero no es cero, es indefinida, y
 * mostrarla como 0% sería exactamente el error que §9.1 quiere evitar.
 */
export function computeMetricValue(
  metric: MetricDefinition,
  ctx: ResolveContext,
  seen: Set<string> = new Set()
): number | null {
  if (metric.compose) {
    let acc = 1;
    for (const ref of metric.compose.refs) {
      const value = resolveRef(ref, ctx, seen);
      if (value === null) return null;
      acc *= value;
    }
    return acc;
  }

  if (!metric.numerator) return null;

  const numerator = resolveRef(metric.numerator, ctx, seen);
  if (numerator === null) return null;

  if (!metric.denominator) return numerator;

  const denominator = resolveRef(metric.denominator, ctx, seen);
  if (denominator === null || denominator === 0) return null;

  const quotient = numerator / denominator;
  return metric.unit === "percentage" ? quotient * 100 : quotient;
}

function resolveMetricById(
  metricId: string,
  ctx: ResolveContext,
  seen: Set<string>
): number | null {
  // Corta referencias circulares entre métricas compuestas.
  if (seen.has(metricId)) return null;

  const metric =
    allMetrics(ctx.template).find((m) => m.id === metricId) ?? getUniversalKpi(metricId);
  if (!metric) return null;

  return computeMetricValue(metric, ctx, new Set([...seen, metricId]));
}

// ─── Transiciones ─────────────────────────────────────────────────────────────

/**
 * Conversión entre etapas consecutivas OCUPADAS.
 *
 * Las etapas salteadas no cortan la cadena: el VSL va de `click` a `engaged`
 * sin pasar por `lead`, y esa transición es legítima. Saltear no es romper.
 */
export function computeTransitions(stages: ComputedStage[]): ComputedTransition[] {
  const occupied = stages
    .filter((s) => s.state !== "skipped")
    .sort((a, b) => spineStageOrder(a.stageId) - spineStageOrder(b.stageId));

  const transitions: ComputedTransition[] = [];

  for (let i = 1; i < occupied.length; i += 1) {
    const from = occupied[i - 1]!;
    const to = occupied[i]!;
    const canCompute = from.count !== null && to.count !== null && from.count !== 0;

    transitions.push({
      fromStageId: from.stageId,
      toStageId: to.stageId,
      fromCount: from.count,
      toCount: to.count,
      rate: canCompute ? (to.count! / from.count!) * 100 : null,
    });
  }

  return transitions;
}

// ─── Entrada principal ────────────────────────────────────────────────────────

export function computeFunnel(
  template: FunnelTemplate,
  stepCounts: StepCounts,
  measures: OrgMeasures = {}
): ComputedFunnel {
  const stages = computeStages(template, stepCounts);

  const stageCounts: Record<string, number | null> = {};
  for (const stage of stages) stageCounts[stage.stageId] = stage.count;

  const ctx: ResolveContext = { template, stepCounts, stageCounts, measures };

  const metrics = allMetrics(template).map((metric) => ({
    metricId: metric.id,
    label: metric.label,
    unit: metric.unit,
    direction: metric.direction,
    value: computeMetricValue(metric, ctx),
  }));

  return { stages, metrics, transitions: computeTransitions(stages) };
}

/** Valor de un KPI universal para el período, fuera de cualquier plantilla. */
export function computeUniversalKpi(
  metricId: string,
  template: FunnelTemplate,
  stepCounts: StepCounts,
  measures: OrgMeasures
): number | null {
  const stages = computeStages(template, stepCounts);
  const stageCounts: Record<string, number | null> = {};
  for (const stage of stages) stageCounts[stage.stageId] = stage.count;

  return resolveMetricById(metricId, { template, stepCounts, stageCounts, measures }, new Set());
}
