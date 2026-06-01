"use client";

import * as React from "react";
import { TrendingDown, TrendingUp, Minus } from "lucide-react";
import { cn } from "../lib/utils";
import { Card, CardContent } from "../primitives/card";
import { Sparkline } from "./sparkline";

export type MetricTrend = "up" | "down" | "neutral";

export interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: MetricTrend;
  trendValue?: string;
  badge?: string;
  className?: string;
  icon?: React.ReactNode;
  /** Last 7 points for inline sparkline (visual only). */
  sparklineData?: number[];
  sparklineColor?: string;
  /** Stagger sparkline draw animation on mount (ms). */
  sparklineAnimationDelay?: number;
}

const trendConfig = {
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

function deriveProgress(
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

export function MetricCard({
  title,
  value,
  subtitle,
  trend = "neutral",
  trendValue,
  badge,
  className,
  icon,
  sparklineData,
  sparklineColor = "hsl(var(--foreground))",
  sparklineAnimationDelay = 0,
}: MetricCardProps) {
  const cfg = trendConfig[trend];
  const TrendIcon = cfg.icon;
  const progress = deriveProgress(value, trend, trendValue);
  const comparison =
    subtitle ?? (trendValue ? `vs período anterior  ${trendValue}` : undefined);
  const hasSparkline = Boolean(sparklineData?.length);

  return (
    <Card className={cn("relative min-h-[120px] overflow-hidden", className)}>
      <div
        className="pointer-events-none absolute left-6 top-1/2 h-[60px] w-[60px] -translate-y-1/2 rounded-full blur-2xl"
        style={{ background: cfg.glow }}
        aria-hidden
      />
      <CardContent className="relative px-6 py-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            {icon && (
              <div className="rounded-[10px] border border-border bg-muted p-1.5 text-muted-foreground [&_svg]:h-[18px] [&_svg]:w-[18px] dark:border-white/[0.08] dark:bg-white/[0.04]">
                {icon}
              </div>
            )}
            <span className="metric-label">{title}</span>
          </div>
          {trendValue && (
            <span
              className={cn(
                "inline-flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-[3px] text-[11px] font-medium",
                cfg.pill
              )}
            >
              <TrendIcon className="h-3 w-3" />
              {trendValue}
            </span>
          )}
        </div>

        <div
          className={cn(
            "relative mt-2",
            hasSparkline &&
              "flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3"
          )}
        >
          <div className="metric-value text-[32px] leading-none tracking-tight tabular-nums sm:text-[36px]">
            {value}
          </div>
          {hasSparkline && (
            <Sparkline
              data={sparklineData!}
              color={sparklineColor}
              animationDelay={sparklineAnimationDelay}
              className="h-8 w-full shrink-0 sm:h-10 sm:w-[80px] md:h-11 md:w-[96px] lg:h-12 lg:w-[120px]"
            />
          )}
        </div>

        <div className="mt-4 flex items-center gap-3">
          <div className="h-0.5 flex-1 overflow-hidden rounded-full bg-muted dark:bg-white/[0.06]">
            <div
              className={cn(
                "h-full rounded-full bg-gradient-to-r transition-all duration-700",
                cfg.bar
              )}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {(comparison || badge) && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {comparison && (
              <span className="text-xs text-muted-foreground">{comparison}</span>
            )}
            {badge && (
              <span className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-[3px] text-[11px] font-medium text-primary dark:text-[#A78BFA]">
                {badge}
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
