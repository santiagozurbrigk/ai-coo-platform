/**
 * lib/funnels/health-bands.ts
 *
 * Sección 04 del documento fuente: el vocabulario compartido de estado.
 *
 * "Set the exact thresholds per offer, but the color language stays constant
 *  across every client report."
 *
 * Dos cosas viven acá:
 *  1. La tabla cross-funnel del documento, con sus umbrales literales.
 *  2. El evaluador genérico que aplica un benchmark a un valor resuelto.
 *
 * Referencia: docs/FUNNELS_ARCHITECTURE.md §3.5 y §9.1
 */

import type {
  Benchmark,
  MetricDirection,
  MetricUnit,
} from "./types";

// ─── Estado de salud ──────────────────────────────────────────────────────────

export type HealthStatus =
  /** On target. */
  | "good"
  /** Watch. */
  | "watch"
  /** Below floor. Dispara diagnóstico, no pánico. */
  | "below"
  /**
   * Sin datos. NO es "below".
   *
   * Es el riesgo principal del diseño (§9.1): confundir un hueco de
   * instrumentación con una rotura de negocio destruye la confianza en el
   * módulo. Se muestra como alerta de instrumentación, nunca de performance.
   */
  | "no_data"
  /** Hay dato pero el documento no define piso ("context-set") y no hay override. */
  | "no_benchmark";

/**
 * Tolerancia por defecto para benchmarks relativos.
 *
 * No es un número inventado: sale de la fila "Lead → Intent" de la sección 04,
 * donde el documento define "watch" como "−20% of bench". Es la regla genérica
 * que el documento da para conversiones de etapa, así que se aplica como
 * default a cualquier benchmark de rango.
 */
export const BENCHMARK_TOLERANCE = 0.2;

// ─── Tabla cross-funnel (sección 04) ──────────────────────────────────────────

export type CrossFunnelBand = {
  metricId: string;
  /** Etiqueta literal de la primera columna del documento. */
  label: string;
  /** Columna "Read as" del documento. */
  readAs: string;
  direction: MetricDirection;
  unit: MetricUnit;
  /** Textos literales de las tres columnas de estado, para mostrarlos tal cual. */
  sourceLabels: { good: string; watch: string; below: string };
} & (
  | {
      comparator: "absolute";
      /** Piso de "on target". */
      good: number;
      /** Piso de "watch". Por debajo es "below floor". */
      watch: number;
    }
  | {
      comparator: "relative_to_benchmark";
      /** Fracción por debajo del benchmark que todavía cuenta como "watch". */
      watchTolerance: number;
    }
);

export const CROSS_FUNNEL_BANDS: CrossFunnelBand[] = [
  {
    metricId: "ltv_cac_ratio",
    label: "LTV : CAC",
    readAs: "Room to scale vs. margin risk",
    direction: "higher_is_better",
    unit: "ratio",
    comparator: "absolute",
    good: 3.0,
    watch: 2.0,
    sourceLabels: { good: "≥ 3.0", watch: "2.0–3.0", below: "< 2.0" },
  },
  {
    metricId: "epl_cpl_ratio",
    label: "EPL vs CPL",
    readAs: "Unit economics of the front end",
    direction: "higher_is_better",
    unit: "ratio",
    comparator: "absolute",
    // "EPL > 1.5× CPL" / "EPL ≈ CPL" / "EPL < CPL" expresado como cociente.
    good: 1.5,
    watch: 1.0,
    sourceLabels: { good: "EPL > 1.5× CPL", watch: "EPL ≈ CPL", below: "EPL < CPL" },
  },
  {
    metricId: "roas_blended",
    label: "Blended ROAS",
    readAs: "Whole-account profitability",
    direction: "higher_is_better",
    unit: "ratio",
    comparator: "absolute",
    good: 2.0,
    watch: 1.3,
    sourceLabels: { good: "≥ 2.0", watch: "1.3–2.0", below: "< 1.3" },
  },
  {
    metricId: "lead_to_intent",
    label: "Lead → Intent",
    readAs: "Offer / mechanism strength",
    direction: "higher_is_better",
    unit: "percentage",
    comparator: "relative_to_benchmark",
    watchTolerance: BENCHMARK_TOLERANCE,
    // El documento imprime "> −20%" en la columna "Below floor", que es un error
    // de tipeo: por contexto, "below floor" es estar MÁS de 20% por debajo del
    // benchmark. Se codifica la intención, no la errata.
    sourceLabels: { good: "at / above bench", watch: "−20% of bench", below: "> −20%" },
  },
  {
    metricId: "show_rate",
    label: "Show rate",
    readAs: "Reminder / qualification quality",
    direction: "higher_is_better",
    unit: "percentage",
    comparator: "absolute",
    good: 60,
    watch: 45,
    sourceLabels: { good: "≥ 60%", watch: "45–60%", below: "< 45%" },
  },
  {
    metricId: "close_rate",
    label: "Close rate (of shows)",
    readAs: "Sales + lead-quality match",
    direction: "higher_is_better",
    unit: "percentage",
    comparator: "absolute",
    good: 25,
    watch: 15,
    sourceLabels: { good: "≥ 25%", watch: "15–25%", below: "< 15%" },
  },
];

// ─── Precedencia de benchmark (§3.5) ──────────────────────────────────────────

export type BenchmarkSource = "template" | "offer_override" | "org_baseline";

export type ResolvedBenchmark = {
  benchmark: Benchmark;
  source: BenchmarkSource;
};

/**
 * Resuelve qué benchmark aplica, en el orden que manda el documento:
 *
 *   plantilla  →  override por oferta  →  baseline propio de la org
 *
 * El nivel más alto gana. El documento es explícito sobre el último:
 * "Reset each floor against the client's own 30-day baseline once there is one,
 *  then treat the baseline as the benchmark."
 */
export function resolveBenchmark(
  templateBenchmark: Benchmark,
  offerOverride?: Benchmark | null,
  orgBaseline?: Benchmark | null
): ResolvedBenchmark {
  if (orgBaseline) return { benchmark: orgBaseline, source: "org_baseline" };
  if (offerOverride) return { benchmark: offerOverride, source: "offer_override" };
  return { benchmark: templateBenchmark, source: "template" };
}

// ─── Evaluador ────────────────────────────────────────────────────────────────

/**
 * Aplica un benchmark a un valor resuelto.
 *
 * `value === null` significa SIN DATOS y devuelve `no_data`. El resolver nunca
 * debe pasar `0` por ausencia de datos — ver `StageState` en types.ts.
 *
 * La dirección importa: un costo por registrante por debajo del rango es
 * excelente, mientras que un show-up rate por debajo del rango es un problema.
 */
export function applyHealthBand(
  value: number | null,
  benchmark: Benchmark,
  direction: MetricDirection,
  tolerance: number = BENCHMARK_TOLERANCE
): HealthStatus {
  if (value === null || Number.isNaN(value)) return "no_data";
  if (benchmark.kind === "context_set") return "no_benchmark";

  if (direction === "higher_is_better") {
    const floor =
      benchmark.kind === "range"
        ? benchmark.min
        : benchmark.kind === "floor"
          ? benchmark.min
          : // Un `ceiling` con dirección "higher_is_better" no tiene piso que evaluar.
            null;
    if (floor === null) return "no_benchmark";
    if (value >= floor) return "good";
    if (value >= floor * (1 - tolerance)) return "watch";
    return "below";
  }

  // lower_is_better
  const cap =
    benchmark.kind === "range"
      ? benchmark.max
      : benchmark.kind === "ceiling"
        ? benchmark.max
        : // Un `floor` con dirección "lower_is_better" no tiene techo que evaluar.
          null;
  if (cap === null) return "no_benchmark";
  if (value <= cap) return "good";
  if (value <= cap * (1 + tolerance)) return "watch";
  return "below";
}

/** Aplica una fila de la tabla cross-funnel (sección 04). */
export function applyCrossFunnelBand(
  value: number | null,
  band: CrossFunnelBand,
  /** Requerido sólo para bandas relativas al benchmark. */
  benchmarkValue?: number | null
): HealthStatus {
  if (value === null || Number.isNaN(value)) return "no_data";

  if (band.comparator === "absolute") {
    if (band.direction === "higher_is_better") {
      if (value >= band.good) return "good";
      if (value >= band.watch) return "watch";
      return "below";
    }
    if (value <= band.good) return "good";
    if (value <= band.watch) return "watch";
    return "below";
  }

  // relative_to_benchmark
  if (benchmarkValue === null || benchmarkValue === undefined) return "no_benchmark";
  if (value >= benchmarkValue) return "good";
  if (value >= benchmarkValue * (1 - band.watchTolerance)) return "watch";
  return "below";
}

/** ¿Este estado exige diagnóstico de negocio? */
export function requiresDiagnosis(status: HealthStatus): boolean {
  return status === "below";
}

/** ¿Este estado exige revisar la instrumentación en vez del negocio? */
export function requiresInstrumentationFix(status: HealthStatus): boolean {
  return status === "no_data";
}
