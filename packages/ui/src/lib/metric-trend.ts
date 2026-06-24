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

export function deriveMetricProgress(
  value: string | number,
  trend?: MetricTrend,
  trendValue?: string
): number {
  const str = String(value);
  const pctInValue = str.match(/([\d.]+)\s*%/);
  if (pctInValue) return Math.min(100, parseFloat(pctInValue[1]));

  const pctInTrend = trendValue?.match(/([\d.]+)/);
  if (pctInTrend) {
    const n = parseFloat(pctInTrend[1]);
    return Math.min(100, Math.max(12, n * 4));
  }

  if (trend === "up") return 72;
  if (trend === "down") return 38;
  return 56;
}
