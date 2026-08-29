"use client";

import * as React from "react";
import { cn } from "../lib/utils";
import {
  DecorativeSparkline,
  type MetricSparklinePreset,
} from "./decorative-sparkline";
import {
  deriveMetricProgress,
  metricTrendConfig,
  type MetricTrend,
} from "../lib/metric-trend";
import { Sparkline } from "./sparkline";
import { MetricAnimatedValue } from "./animated-number";
import { MetricLineChart } from "./metric-line-chart";

export type { MetricTrend } from "../lib/metric-trend";
export type { MetricSparklinePreset } from "./decorative-sparkline";

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
  sparklinePreset?: MetricSparklinePreset;
  showProgressBar?: boolean;
  progress?: number;
  progressCaption?: string;
  progressVariant?: "trend" | "violet";
  children?: React.ReactNode;
  /** Datos para el gráfico de línea full-width en el fondo (estilo Whop) */
  chartData?: number[];
  /** Datos período anterior para línea de comparación */
  chartPreviousData?: number[];
  chartStartLabel?: string;
  chartEndLabel?: string;
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
  sparklinePreset,
  showProgressBar = false,
  progress,
  progressCaption,
  progressVariant = "trend",
  children,
  chartData,
  chartPreviousData,
  chartStartLabel,
  chartEndLabel,
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
    <div className={cn("metric-stat relative min-w-0 overflow-hidden", className)}>
      {sparklinePreset ? (
        <DecorativeSparkline preset={sparklinePreset} color={sparklineColor} />
      ) : null}
      <div
        className="pointer-events-none absolute left-4 top-1/2 h-[60px] w-[60px] -translate-y-1/2 rounded-full blur-2xl"
        style={{ background: cfg.glow }}
        aria-hidden
      />
      <div className="relative">
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
        <div className="metric-stat-value tabular-nums">
          <MetricAnimatedValue value={value} />
        </div>
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
            <span className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-[3px] text-micro font-medium text-primary dark:text-primary-light">
              {badge}
            </span>
          ) : null}
        </div>
      )}

      {children ? <div className="relative mt-2">{children}</div> : null}
      </div>

      {chartData && chartData.length >= 2 && (
        <div className="mt-2 h-[64px] w-full">
          <MetricLineChart
            data={chartData}
            previousData={chartPreviousData}
            startLabel={chartStartLabel}
            endLabel={chartEndLabel}
            color={sparklineColor !== "hsl(var(--foreground))" ? sparklineColor : "hsl(var(--primary))"}
            className="h-full px-4 pb-2"
          />
        </div>
      )}
    </div>
  );
}

export { deriveMetricProgress };
