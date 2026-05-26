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
    pill: "border-emerald-400/25 bg-emerald-500/10 text-emerald-400",
    bar: "from-emerald-400 to-emerald-300",
    glow: "rgba(52,211,153,0.08)",
  },
  down: {
    icon: TrendingDown,
    pill: "border-red-400/25 bg-red-500/10 text-red-400",
    bar: "from-red-400 to-red-300",
    glow: "rgba(239,68,68,0.08)",
  },
  neutral: {
    icon: Minus,
    pill: "border-[rgba(124,58,237,0.30)] bg-[rgba(124,58,237,0.12)] text-[#A78BFA]",
    bar: "from-[#7C3AED] to-[#A78BFA]",
    glow: "rgba(124,58,237,0.06)",
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
  sparklineColor = "#7C3AED",
  sparklineAnimationDelay = 0,
}: MetricCardProps) {
  const cfg = trendConfig[trend];
  const TrendIcon = cfg.icon;
  const progress = deriveProgress(value, trend, trendValue);
  const comparison =
    subtitle ?? (trendValue ? `vs período anterior  ${trendValue}` : undefined);
  const hasSparkline = Boolean(sparklineData?.length);

  return (
    <Card
      className={cn(
        "relative min-h-[120px] overflow-hidden border-t border-white/[0.14]",
        className
      )}
    >
      <div
        className="pointer-events-none absolute left-6 top-1/2 h-[60px] w-[60px] -translate-y-1/2 rounded-full blur-2xl"
        style={{ background: cfg.glow }}
        aria-hidden
      />
      <CardContent className="relative px-6 py-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            {icon && (
              <div className="rounded-[10px] border border-white/[0.08] bg-white/[0.04] p-1.5 text-[#A78BFA] [&_svg]:h-[18px] [&_svg]:w-[18px]">
                {icon}
              </div>
            )}
            <span className="text-[11px] font-medium uppercase tracking-[0.07em] text-white/50">
              {title}
            </span>
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
          <div className="text-[32px] font-semibold leading-none tracking-tight text-white tabular-nums sm:text-[36px]">
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
          <div className="h-0.5 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
            <div
              className={cn(
                "h-full rounded-full bg-gradient-to-r shadow-[0_0_8px_rgba(124,58,237,0.5)] transition-all duration-700",
                cfg.bar
              )}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {(comparison || badge) && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {comparison && (
              <span className="text-xs text-white/50">{comparison}</span>
            )}
            {badge && (
              <span className="rounded-full border border-[rgba(124,58,237,0.30)] bg-[rgba(124,58,237,0.12)] px-2.5 py-[3px] text-[11px] font-medium text-[#A78BFA]">
                {badge}
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
