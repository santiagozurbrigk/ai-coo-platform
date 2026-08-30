/**
 * lib/funnels/types.ts
 *
 * Tipos núcleo del motor de embudos.
 *
 * Referencia: docs/FUNNELS_ARCHITECTURE.md §3
 */

import type { SpineStageId } from "./spine";
import type { InstrumentationToolId } from "./instrumentation";

/**
 * Versión del documento fuente que estas plantillas transcriben.
 *
 * Si llega una versión nueva del `Funnel Metrics Standard`, comparar antes de
 * asumir que las plantillas están vigentes: una plantilla desactualizada miente
 * en silencio (docs/FUNNELS_ARCHITECTURE.md §9.6).
 */
export const SOURCE_DOC_VERSION = "1.0";

// ─── Unidades y dirección ─────────────────────────────────────────────────────

export type MetricUnit = "count" | "percentage" | "currency" | "ratio";

/**
 * Si un valor alto es bueno o malo.
 *
 * Imprescindible para evaluar benchmarks: un costo por registrante por debajo
 * del rango es excelente, pero un show-up rate por debajo del rango es un
 * problema. Sin esta dirección, el evaluador marcaría lo primero como falla.
 */
export type MetricDirection = "higher_is_better" | "lower_is_better";

// ─── Referencias a cantidades medibles ────────────────────────────────────────

/**
 * Una cantidad que el resolver puede computar para un período dado.
 *
 * El caso `step` es el que sostiene §3.4 del documento de arquitectura: una tasa
 * NUNCA es un nombre con un número, es `numerador ÷ denominador` con ambos
 * explícitos. En el webinar, "Attendee → sale" (2–6%) y "Registrant → sale"
 * (1–3%) son el mismo evento de venta sobre dos bases distintas; sin
 * denominador explícito serían indistinguibles.
 */
export type MetricRef =
  | { kind: "step"; stepId: string }
  /**
   * Agregado de una etapa del spine, sumando todos sus steps.
   *
   * Lo usan los KPIs universales, que tienen que valer para cualquier embudo:
   * EPL es `revenue ÷ leads` y "leads" es la etapa, no un step de una plantilla
   * concreta.
   */
  | { kind: "stage"; stageId: SpineStageId }
  | { kind: "metric"; metricId: string }
  /**
   * Medida que la fuente reporta directamente y no se deriva de conteos, ej. el
   * "avg watch %" del VSL: es un promedio por sesión, no un cociente entre dos
   * etapas del embudo.
   */
  | { kind: "reported"; measureId: string }
  | { kind: "spend" }
  | { kind: "revenue" }
  | { kind: "cash_collected" }
  | { kind: "contracted_value" }
  | { kind: "reach" }
  | { kind: "impressions" }
  | { kind: "orders" }
  | { kind: "customers" }
  | { kind: "purchases" }
  | { kind: "retention_rate" }
  /**
   * Revenue y spend **atribuidos por Hyros**, distintos del revenue de la
   * pasarela y del spend de Meta.
   *
   * El documento declara la separación no negociable: *"the two never match
   * exactly, and a report that mixes them without labels is how bad decisions
   * get made"*. Por eso son medidas propias y no un respaldo de las otras.
   */
  | { kind: "attributed_revenue" }
  | { kind: "attributed_spend" };

// ─── Métricas ─────────────────────────────────────────────────────────────────

export type MetricDefinition = {
  /** ID estable. Referenciable desde punteros y benchmarks (§3.6). */
  id: string;
  /** Etiqueta tal como figura en el documento fuente. */
  label: string;
  /** Abreviatura de la sección 03 del doc ("CAC", "ROAS", "EPL / EPC"). */
  abbr?: string;
  unit: MetricUnit;
  direction: MetricDirection;
  /** `null` sólo en métricas compuestas (ver `compose`). */
  numerator: MetricRef | null;
  /** `null` = valor directo, no es una tasa ni un cociente. */
  denominator: MetricRef | null;
  /** Métrica compuesta, ej. LTV = AOV × compras × retención. */
  compose?: { op: "multiply"; refs: MetricRef[] };
  /** Fórmula para mostrar en UI, tal cual el documento. */
  formula?: string;
  note?: string;
};

// ─── Benchmarks ───────────────────────────────────────────────────────────────

/**
 * Rango sano de una métrica.
 *
 * La columna "Healthy range" del documento mezcla cinco formatos distintos
 * (rango, rango compuesto de dos métricas, rango con denominador explícito, y
 * texto libre "context-set"). Guardarla como string haría imposible computar
 * las health bands, así que se normaliza acá — ver §3.3.
 */
export type Benchmark =
  | { kind: "range"; min: number; max: number; unit: MetricUnit }
  | { kind: "floor"; min: number; unit: MetricUnit }
  | { kind: "ceiling"; max: number; unit: MetricUnit }
  /** El doc dice "context-set": no hay piso universal, se calibra por contexto. */
  | { kind: "context_set"; note?: string };

// ─── Steps ────────────────────────────────────────────────────────────────────

/**
 * Un paso concreto de un embudo, mapeado a una etapa del spine.
 *
 * La relación step → stage es N:1 y ordenada (§3.2): el webinar tiene dos steps
 * en `engaged` (show-up y stick rate), el VSL tiene dos en `intent` y dos en
 * `sales_conv`.
 */
export type FunnelStep = {
  id: string;
  stageId: SpineStageId;
  order: number;
  /** Columna "Funnel step" del documento. */
  label: string;
  /** Columna "Metric" del documento, textual. */
  metricLabel: string;
  /**
   * Columna "Healthy range" del documento, textual y sin normalizar.
   *
   * Se conserva a propósito: permite mostrar el texto original en la UI y
   * diffear contra una versión futura del documento sin depender de que la
   * normalización haya sido correcta.
   */
  benchmarkLabel: string;
  metrics: MetricDefinition[];
  /** metricId → benchmark. Un step puede tener N métricas con N benchmarks. */
  benchmarks: Record<string, Benchmark>;
  /** Qué herramienta debería alimentar este step (sección 05 del doc). */
  sourceHint: InstrumentationToolId;
};

// ─── Punteros ─────────────────────────────────────────────────────────────────

/**
 * North-star / leading indicator / governing rate.
 *
 * Conserva la etiqueta literal del documento además del ID resoluble, porque no
 * siempre coinciden: el DM declara "Reply / set rate" como leading indicator y
 * eso no es el nombre exacto de ninguna métrica del embudo.
 */
export type MetricPointer = {
  label: string;
  metricId: string;
};

// ─── Plantilla ────────────────────────────────────────────────────────────────

export type FunnelTemplate = {
  id: string;
  label: string;
  description: string;
  /** "Registration-led" | "Application-led" | "Conversation-led" */
  badge: string;
  /** Token del design system. Nunca un hex — ver DESIGN.md. */
  accentToken: string;
  sourceDocVersion: string;
  northStar: MetricPointer;
  leadingIndicator: MetricPointer;
  governingRate: MetricPointer;
  steps: FunnelStep[];
  /**
   * Métricas a nivel embudo que no pertenecen a ningún step.
   *
   * Existe porque el webinar declara "Cost per Sale" como north-star y esa
   * métrica no aparece en ninguna fila de su tabla.
   */
  funnelMetrics: MetricDefinition[];
};

// ─── Estados de resolución ────────────────────────────────────────────────────

/**
 * El riesgo principal del diseño (docs/FUNNELS_ARCHITECTURE.md §9.1).
 *
 * Un embudo con datos parciales haría que el diagnóstico señale como "roturas"
 * lo que en realidad son huecos de instrumentación. El resolver NUNCA devuelve
 * `0` por ausencia de datos, y estos tres estados se muestran distinto en la UI:
 *
 * - `skipped`  → el embudo no tiene esa etapa por diseño (el VSL no tiene Lead).
 *                Neutro, sin alerta.
 * - `no_data`  → la fuente no está conectada o no reportó.
 *                Alerta de INSTRUMENTACIÓN, no de negocio.
 * - `measured` → hay datos. Recién acá aplica el diagnóstico de negocio.
 */
export type StageState = "skipped" | "no_data" | "measured";

/** Todo valor resuelto carga su procedencia (§3.7, regla 3 del documento). */
export type ResolvedMetric = {
  metricId: string;
  /** `null` = sin datos. NUNCA `0` por ausencia — ver `StageState`. */
  value: number | null;
  provenance: InstrumentationToolId | "derived" | "unknown";
  resolvedAt: string;
  isEstimated: boolean;
};
