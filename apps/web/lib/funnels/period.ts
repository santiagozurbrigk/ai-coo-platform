/**
 * lib/funnels/period.ts
 *
 * Ventanas temporales de medición.
 *
 * `custom-metrics.ts` cuenta sobre toda la historia de la org; un embudo siempre
 * se mide en un período, así que el módulo necesita su propia noción de ventana
 * (docs/FUNNELS_ARCHITECTURE.md §9.4).
 */

export const FUNNEL_PERIOD_PRESETS = [
  { id: "7d", label: "7 días", days: 7 },
  { id: "30d", label: "30 días", days: 30 },
  { id: "90d", label: "90 días", days: 90 },
] as const;

export type FunnelPeriodPresetId = (typeof FUNNEL_PERIOD_PRESETS)[number]["id"];

export const DEFAULT_PERIOD_PRESET: FunnelPeriodPresetId = "30d";

export type FunnelPeriod = {
  presetId: FunnelPeriodPresetId;
  /** Inicio inclusivo, "YYYY-MM-DD". */
  start: string;
  /** Fin inclusivo, "YYYY-MM-DD". */
  end: string;
};

export function isPeriodPresetId(value: string): value is FunnelPeriodPresetId {
  return FUNNEL_PERIOD_PRESETS.some((p) => p.id === value);
}

function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/**
 * Construye la ventana de un preset.
 *
 * El período incluye hoy y retrocede `days - 1` días, de modo que "7 días"
 * abarque exactamente 7 fechas y no 8.
 */
export function resolvePeriod(
  presetId: FunnelPeriodPresetId = DEFAULT_PERIOD_PRESET,
  now: Date = new Date()
): FunnelPeriod {
  const preset = FUNNEL_PERIOD_PRESETS.find((p) => p.id === presetId) ?? FUNNEL_PERIOD_PRESETS[1];
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - (preset.days - 1));

  return { presetId: preset.id, start: toIsoDate(start), end: toIsoDate(end) };
}

/** Límites como timestamptz para columnas que no son `date`. */
export function periodBounds(period: FunnelPeriod): { fromIso: string; toIso: string } {
  return {
    fromIso: `${period.start}T00:00:00.000Z`,
    // Fin exclusivo: el día siguiente a las 00:00, para incluir todo el último día.
    toIso: `${nextDay(period.end)}T00:00:00.000Z`,
  };
}

function nextDay(isoDate: string): string {
  const date = new Date(`${isoDate}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + 1);
  return toIsoDate(date);
}
