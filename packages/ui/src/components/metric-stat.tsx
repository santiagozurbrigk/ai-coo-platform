"use client";

import * as React from "react";
import { cn } from "../lib/utils";
import {
  deriveMetricProgress,
  metricTrendConfig,
  type MetricTrend,
} from "../lib/metric-trend";
import { Sparkline } from "./sparkline";

export type { MetricTrend } from "../lib/metric-trend";

export interface MetricStatProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: MetricTrend;
  trendValue?: string;
  badge?: string;
  className?: string;
  icon?: React.ReactNode;
  sparklineData?: number[];
  sparklineColor?: string;
  sparklineAnimationDelay?: number;
  showProgressBar?: boolean;
  progress?: number;
  progressCaption?: string;
  progressVariant?: "trend" | "violet";
}

export function MetricStat({
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
  showProgressBar = false,
  progress,
  progressCaption,
  progressVariant = "trend",
}: MetricStatProps) {
  const cfg = metricTrendConfig[trend];
  const TrendIcon = cfg.icon;
  const hasDataSparkline = Boolean(sparklineData?.length);
  const derivedProgress = deriveMetricProgress(value, trend, trendValue);
  const barWidth = progress ?? derivedProgress;
  const comparison =
    subtitle ?? (trendValue ? `vs período anterior  ${trendValue}` : undefined);
  const barClassName =
    progressVariant === "violet"
      ? "from-violet-600 to-violet-400"
      : cfg.bar;

  return (
    <div className={cn("metric-stat min-w-0", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          {icon ? (
            <div className="rounded-lg border border-border bg-muted p-1.5 text-muted-foreground [&_svg]:h-4 [&_svg]:w-4 dark:border-white/[0.08] dark:bg-white/[0.04]">
              {icon}
            </div>
          ) : null}
          <span className="metric-stat-label">{title}</span>
        </div>
        {trendValue ? (
          <span
            className={cn(
              "inline-flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-[3px] text-micro font-medium",
              cfg.pill
            )}
          >
            <TrendIcon className="h-3 w-3" />
            {trendValue}
          </span>
        ) : null}
      </div>

      <div
        className={cn(
          "relative mt-2",
          hasDataSparkline &&
            "flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between sm:gap-3"
        )}
      >
        <div className="metric-stat-value tabular-nums">{value}</div>
        {hasDataSparkline ? (
          <Sparkline
            data={sparklineData!}
            color={sparklineColor}
            animationDelay={sparklineAnimationDelay}
            className="h-8 w-full shrink-0 sm:h-9 sm:w-[88px]"
          />
        ) : null}
      </div>

      {showProgressBar ? (
        <div className="mt-3">
          <div
            className={cn(
              "h-0.5 overflow-hidden rounded-full bg-muted dark:bg-white/[0.06]",
              progress != null && progressCaption && "h-1.5"
            )}
          >
            <div
              className={cn(
                "h-full rounded-full bg-gradient-to-r transition-all duration-700",
                barClassName
              )}
              style={{ width: `${barWidth}%` }}
            />
          </div>
          {progressCaption ? (
            <p className="mt-1.5 text-micro text-muted-foreground">
              {progressCaption}
            </p>
          ) : null}
        </div>
      ) : null}

      {(comparison || badge) && (
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {comparison ? (
            <span className="text-caption text-muted-foreground">{comparison}</span>
          ) : null}
          {badge ? (
            <span className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-[3px] text-micro font-medium text-primary dark:text-[#A78BFA]">
              {badge}
            </span>
          ) : null}
        </div>
      )}
    </div>
  );
}

export { deriveMetricProgress };
