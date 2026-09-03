/**
 * ⭐ El recorrido de un cliente: punto inicial → punto final, y en cuánto tiempo.
 *
 * Es el problema de diseño central del Encargo A. El tracker registra logros
 * sueltos; el dashboard pregunta otra cosa: *"¿qué recorrido hizo este cliente?"*.
 * Eso sale sólo si los wins llevan una **medida comparable**.
 *
 * ⭐ La regla dura, coherente con el resto del repo: **si el cliente no tiene dos
 * puntos numéricos comparables, el resultado es "sin medir"**. No se estima, no
 * se interpola, y no se muestra una flecha verde sin datos que la sostengan.
 *
 * "Comparables" es estricto: misma clave **y misma unidad**. Facturación en USD
 * y en ARS no se restan.
 *
 * Lógica pura: no toca base ni red.
 */
import type { ClientBaseline, ClientWin } from "@/types/wins";

const DAY_MS = 24 * 60 * 60 * 1000;

export type CasePoint = {
  value: number;
  unit: string | null;
  /** Fecha del punto, ISO. Del baseline o del win. */
  at: string;
  origin: "baseline" | "win";
};

export type MeasuredCase = {
  measured: true;
  metricKey: string;
  unit: string | null;
  start: CasePoint;
  end: CasePoint;
  /** Diferencia absoluta. Puede ser negativa: una métrica puede caer. */
  delta: number;
  /** Variación relativa. `null` cuando el punto inicial es cero: no hay porcentaje desde cero. */
  deltaPercent: number | null;
  /** Días entre los dos puntos. */
  days: number;
};

export type UnmeasuredCase = {
  measured: false;
  /** Por qué no se puede medir. Se muestra: "sin medir" a secas no ayuda a arreglarlo. */
  reason:
    | "sin_wins_con_medida"
    | "un_solo_punto"
    | "unidades_distintas"
    | "misma_fecha";
  /** La clave que más cerca estuvo de servir, si hubo alguna. */
  metricKey: string | null;
};

export type ClientCase = MeasuredCase | UnmeasuredCase;

export const UNMEASURED_REASON_LABEL: Record<UnmeasuredCase["reason"], string> = {
  sin_wins_con_medida: "Ningún win de este cliente tiene un número cargado",
  un_solo_punto: "Hay un solo número: falta otro para comparar",
  unidades_distintas: "Los números están en unidades distintas y no se pueden comparar",
  misma_fecha: "Los dos números son del mismo día: no hay plazo que medir",
};

/**
 * Deriva el recorrido de un cliente a partir de sus wins y su baseline.
 *
 * @param preferredKey fuerza qué medida usar. Sin esto se elige la clave con más
 *   puntos comparables — la que mejor cuenta la historia de ese cliente.
 */
export function deriveClientCase(
  wins: readonly ClientWin[],
  baseline: ClientBaseline | null = null,
  preferredKey?: string
): ClientCase {
  const measured = wins.filter(
    (win) => win.metric !== null && Number.isFinite(win.metric.value)
  );

  if (measured.length === 0 && !baseline) {
    return { measured: false, reason: "sin_wins_con_medida", metricKey: null };
  }

  const key = preferredKey ?? chooseMetricKey(measured, baseline);
  if (!key) {
    return { measured: false, reason: "sin_wins_con_medida", metricKey: null };
  }

  // Todos los puntos de esa clave, en orden cronológico.
  const points: CasePoint[] = [];

  if (baseline && baseline.metricKey === key && Number.isFinite(baseline.metricValue)) {
    points.push({
      value: baseline.metricValue,
      unit: normalizeUnit(baseline.metricUnit),
      // Sin fecha de captura el baseline no sirve para medir un plazo.
      at: baseline.capturedAt ?? "",
      origin: "baseline",
    });
  }

  for (const win of measured) {
    if (win.metric!.key !== key) continue;
    points.push({
      value: win.metric!.value,
      unit: normalizeUnit(win.metric!.unit),
      at: win.winDate,
      origin: "win",
    });
  }

  const dated = points.filter((point) => point.at !== "" && !Number.isNaN(time(point.at)));
  if (dated.length < 2) {
    return { measured: false, reason: "un_solo_punto", metricKey: key };
  }

  dated.sort((a, b) => time(a.at) - time(b.at));

  const start = dated[0]!;
  const end = dated[dated.length - 1]!;

  // ⭐ Unidades distintas no se restan. Preferimos "no se puede comparar" a un
  // número que parece una respuesta.
  if (start.unit !== end.unit) {
    return { measured: false, reason: "unidades_distintas", metricKey: key };
  }

  const days = Math.round((time(end.at) - time(start.at)) / DAY_MS);
  if (days <= 0) {
    return { measured: false, reason: "misma_fecha", metricKey: key };
  }

  const delta = end.value - start.value;

  return {
    measured: true,
    metricKey: key,
    unit: start.unit,
    start,
    end,
    delta,
    // Un porcentaje desde cero es infinito, no un número grande.
    deltaPercent: start.value === 0 ? null : (delta / Math.abs(start.value)) * 100,
    days,
  };
}

/**
 * Qué medida cuenta la historia de este cliente: la que tiene más puntos.
 *
 * Empata a favor de la que incluye el baseline, y después alfabéticamente, para
 * que el resultado sea estable entre recargas.
 */
function chooseMetricKey(
  measured: readonly ClientWin[],
  baseline: ClientBaseline | null
): string | null {
  const counts = new Map<string, number>();

  for (const win of measured) {
    const key = win.metric!.key;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  if (baseline) {
    counts.set(baseline.metricKey, (counts.get(baseline.metricKey) ?? 0) + 1);
  }

  let best: string | null = null;
  let bestCount = 0;
  for (const [key, count] of [...counts.entries()].sort((a, b) =>
    a[0].localeCompare(b[0], "es")
  )) {
    if (count > bestCount) {
      best = key;
      bestCount = count;
    }
  }
  return best;
}

function normalizeUnit(unit: string | null | undefined): string | null {
  const trimmed = unit?.trim();
  return trimmed ? trimmed : null;
}

function time(iso: string): number {
  // Las fechas de win son `date` (yyyy-mm-dd): se anclan a mediodía UTC para que
  // no se corran de día por zona horaria.
  const value = iso.length === 10 ? `${iso}T12:00:00Z` : iso;
  return new Date(value).getTime();
}

/** Todas las claves de medida que aparecen en los wins de un cliente. */
export function availableMetricKeys(wins: readonly ClientWin[]): string[] {
  const keys = new Set<string>();
  for (const win of wins) {
    if (win.metric) keys.add(win.metric.key);
  }
  return [...keys].sort((a, b) => a.localeCompare(b, "es"));
}

/** Agrupa wins por cliente, para armar el dashboard en una pasada. */
export function groupWinsByClient(
  wins: readonly ClientWin[]
): Map<string, ClientWin[]> {
  const map = new Map<string, ClientWin[]>();
  for (const win of wins) {
    const list = map.get(win.clientId) ?? [];
    list.push(win);
    map.set(win.clientId, list);
  }
  return map;
}
