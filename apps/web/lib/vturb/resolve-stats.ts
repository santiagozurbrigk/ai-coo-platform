/**
 * lib/vturb/resolve-stats.ts
 *
 * Traduce la respuesta cruda de VTurb a las medidas del embudo.
 *
 * Puro: no toca la base ni la red. Es donde viven las reglas de `null` vs `0` de
 * esta integración, que son tres y ninguna es obvia.
 *
 * ⚠️ **El spec de VTurb no describe la semántica de ningún campo de `Stats`.**
 * Los nombres son transparentes, pero qué cuenta exactamente como `viewed`
 * contra `started`, o qué deduplican los sufijos `_uniq`, hay que confirmarlo
 * contra el dashboard. Por eso el payload crudo se persiste antes de pasar por
 * acá — ver docs/PLAN_VERIFICACION.md.
 */

import type { VTurbEngagement, VTurbStats } from "./client";

export type VTurbFunnelMeasures = {
  /** M08 — visitantes de la página con el VSL. */
  pageViews: number | null;
  /** M10 — reproducciones del VSL. */
  plays: number | null;
  /** M11 — porcentaje promedio visto. */
  avgWatchPct: number | null;
  /** M12 — llegaron al segundo del CTA. */
  reachedCta: number | null;
  /**
   * Por qué `reachedCta` es `null`, cuando lo es. Sirve para que la UI diga qué
   * hay que arreglar en vez de un "sin datos" mudo.
   */
  reachedCtaReason: "no_pitch_time" | "no_data" | null;
};

/**
 * Lee un entero de la respuesta sin convertir la ausencia en cero.
 *
 * Un campo que no vino no es un cero: puede ser que VTurb no lo calcule para ese
 * player, o que el nombre haya cambiado. Devolver 0 ahí haría que el embudo
 * reporte "nadie reprodujo el video" cuando la verdad es "no sabemos".
 */
function readNumber(source: Record<string, unknown> | null | undefined, key: string): number | null {
  if (!source) return null;
  const value = source[key];
  if (typeof value === "number" && Number.isFinite(value)) return value;
  return null;
}

/**
 * ¿El `pitch_time` con el que se pidió el período es utilizable?
 *
 * ⭐ VTurb devuelve `pitch_time = 0` para los players que no lo tienen
 * configurado. En ese caso `total_over_pitch` cuenta "los que vieron más de 0
 * segundos", que es prácticamente todos — un número que parece M12 y no lo es.
 * Presentarlo como "llegaron al CTA" sería peor que no mostrarlo.
 */
export function isUsablePitchTime(pitchTime: number | null | undefined): boolean {
  return typeof pitchTime === "number" && Number.isFinite(pitchTime) && pitchTime > 0;
}

/**
 * Cuenta cuántos usuarios llegaron a un segundo dado, leyendo la curva de
 * retención.
 *
 * Es el camino alternativo para M12 cuando no hay `pitch_time` en VTurb pero sí
 * un segundo de CTA configurado del lado de OTC. La curva puede no traer el
 * segundo exacto, así que se toma el **último punto en o antes** del segundo
 * buscado: es la última cantidad conocida de gente que seguía mirando.
 */
export function usersAtSecond(
  engagement: VTurbEngagement | null | undefined,
  second: number
): number | null {
  const curve = engagement?.grouped_timed;
  if (!Array.isArray(curve) || curve.length === 0) return null;

  let best: { timed: number; total_users: number } | null = null;
  for (const point of curve) {
    if (typeof point?.timed !== "number" || typeof point?.total_users !== "number") continue;
    if (point.timed > second) continue;
    if (best === null || point.timed > best.timed) best = point;
  }

  return best ? best.total_users : null;
}

export type ResolveVTurbInput = {
  stats: VTurbStats | null;
  engagement: VTurbEngagement | null;
  /** `pitch_time` con el que se pidió `stats`, ya resuelto. */
  pitchTime: number | null;
};

/**
 * Resuelve las cuatro medidas del embudo VSL.
 *
 * Las reglas, en orden:
 *
 * 1. **Sin respuesta de VTurb, todo es `null`.** Un error de red o una cuota
 *    agotada no significan que el video no se vio.
 * 2. **Un campo ausente es `null`, no `0`.**
 * 3. **Sin `pitch_time` usable, M12 cae a la curva** y, si tampoco hay curva,
 *    queda en `null` con el motivo `no_pitch_time`. Nunca `0`.
 */
export function resolveVTurbMeasures(input: ResolveVTurbInput): VTurbFunnelMeasures {
  const { stats, engagement, pitchTime } = input;

  const pageViews = readNumber(stats, "total_viewed");
  const plays = readNumber(stats, "total_started");

  // `engagement_rate` viene en los dos endpoints. Se prefiere el de
  // `/times/user_engagement`, que es el que tiene la fórmula documentada
  // (average_watched_time / video_duration * 100).
  const avgWatchPct =
    readNumber(engagement, "engagement_rate") ?? readNumber(stats, "engagement_rate");

  if (!isUsablePitchTime(pitchTime)) {
    // Sin un segundo de pitch válido, `total_over_pitch` no representa "llegó al
    // CTA". Se intenta la curva; si tampoco está, la medida no existe.
    return {
      pageViews,
      plays,
      avgWatchPct,
      reachedCta: null,
      reachedCtaReason: "no_pitch_time",
    };
  }

  const overPitch = readNumber(stats, "total_over_pitch");
  if (overPitch !== null) {
    return { pageViews, plays, avgWatchPct, reachedCta: overPitch, reachedCtaReason: null };
  }

  // Camino de respaldo: derivarlo de la curva en el segundo del pitch.
  const fromCurve = usersAtSecond(engagement, pitchTime!);
  return {
    pageViews,
    plays,
    avgWatchPct,
    reachedCta: fromCurve,
    reachedCtaReason: fromCurve === null ? "no_data" : null,
  };
}
