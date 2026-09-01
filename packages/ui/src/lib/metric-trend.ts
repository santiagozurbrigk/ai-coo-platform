import { TrendingDown, TrendingUp, Minus } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type MetricTrend = "up" | "down" | "neutral";

export const metricTrendConfig: Record<
  MetricTrend,
  { icon: LucideIcon; pill: string; bar: string; glow: string }
> = {
  up: {
    icon: TrendingUp,
    pill: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/25 dark:bg-emerald-500/10 dark:text-emerald-400",
    bar: "from-emerald-500 to-emerald-400",
    glow: "rgba(52,211,153,0.06)",
  },
  down: {
    icon: TrendingDown,
    pill: "border-red-200 bg-red-50 text-red-700 dark:border-red-400/25 dark:bg-red-500/10 dark:text-red-400",
    bar: "from-red-500 to-red-400",
    glow: "rgba(239,68,68,0.06)",
  },
  neutral: {
    icon: Minus,
    pill: "border-border bg-muted text-muted-foreground dark:border-white/10 dark:bg-white/[0.08] dark:text-white/60",
    bar: "from-foreground/40 to-foreground/25",
    glow: "rgba(255,255,255,0.03)",
  },
};

/**
 * Progreso 0–100 de la métrica, **sólo cuando el valor mismo es un porcentaje**.
 *
 * Devuelve `null` en cualquier otro caso. La versión anterior inventaba un
 * ancho cuando no había porcentaje (`up → 72`, `down → 38`, si no `56`, o el
 * delta de tendencia multiplicado por 4): la barra se veía como un dato y no lo
 * era. Una barra que no codifica nada es peor que no tener barra.
 */
export function deriveMetricProgress(
  value: string | number,
  _trend?: MetricTrend,
  _trendValue?: string
): number | null {
  const pctInValue = String(value).match(/([\d.]+)\s*%/);
  if (!pctInValue) return null;

  const parsed = Number.parseFloat(pctInValue[1]);
  if (!Number.isFinite(parsed)) return null;

  return Math.min(100, Math.max(0, parsed));
}
