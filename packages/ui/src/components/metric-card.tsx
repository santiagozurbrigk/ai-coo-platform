"use client";

import * as React from "react";
import { TrendingDown, TrendingUp, Minus } from "lucide-react";
import { cn } from "../lib/utils";
import { Card, CardContent } from "../primitives/card";
import {
  DecorativeSparkline,
  type MetricSparklinePreset,
} from "./decorative-sparkline";
import { Sparkline } from "./sparkline";
import { MetricAnimatedValue } from "./animated-number";
import { MetricLineChart } from "./metric-line-chart";
import { deriveMetricProgress } from "../lib/metric-trend";

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
  /** Decorative background sparkline preset (marketing overview style). */
  sparklinePreset?: MetricSparklinePreset;
  /** Glass surface in dark mode (marketing / operational cards). */
  glass?: boolean;
  /** Show the bottom progress bar. Default true. */
  showProgressBar?: boolean;
  /** Explicit progress width 0–100 (operational metrics). */
  progress?: number;
  progressCaption?: string;
  /** Bar color when `progress` is set. */
  progressVariant?: "trend" | "brand";
  children?: React.ReactNode;
  /** Datos para el gráfico de línea full-width en el fondo de la card (estilo Whop) */
  chartData?: number[];
  /** Datos período anterior para línea de comparación gris */
  chartPreviousData?: number[];
  /** Etiqueta izquierda del gráfico (fecha inicio) */
  chartStartLabel?: string;
  /** Etiqueta derecha del gráfico. Default "Hoy" */
  chartEndLabel?: string;
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
  sparklinePreset,
  glass = false,
  showProgressBar = true,
  progress,
  progressCaption,
  progressVariant = "trend",
  children,
  chartData,
  chartPreviousData,
  chartStartLabel,
  chartEndLabel,
}: MetricCardProps) {
  const cfg = trendConfig[trend];
  const TrendIcon = cfg.icon;
  // Igual que en `MetricStat`: sin porcentaje real no se dibuja barra.
  const barWidth = progress ?? deriveMetricProgress(value, trend, trendValue);
  const comparison =
    subtitle ?? (trendValue ? `vs período anterior  ${trendValue}` : undefined);
  const hasDataSparkline = Boolean(sparklineData?.length);
  const barClassName =
    progressVariant === "brand"
      ? "from-brand-600 to-brand-400"
      : cfg.bar;

  return (
    <Card
      className={cn(
        "relative min-h-[120px] overflow-hidden",
        glass &&
          "dark:border-glass dark:bg-glass dark:backdrop-blur-md hover:dark:border-glass-strong hover:dark:bg-glass-hover transition-all duration-200",
        className
      )}
    >
      {sparklinePreset ? (
        <DecorativeSparkline preset={sparklinePreset} color={sparklineColor} />
      ) : null}
      <div
        className="pointer-events-none absolute left-6 top-1/2 h-[60px] w-[60px] -translate-y-1/2 rounded-full blur-2xl"
        style={{ background: cfg.glow }}
        aria-hidden
      />
      <CardContent className="relative px-6 py-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            {icon ? (
              <div className="rounded-[10px] border border-border bg-muted p-1.5 text-muted-foreground [&_svg]:h-[18px] [&_svg]:w-[18px] dark:border-white/[0.08] dark:bg-white/[0.04]">
                {icon}
              </div>
            ) : null}
            <span className="metric-label">{title}</span>
          </div>
          {trendValue ? (
            <span
              className={cn(
                "inline-flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-[3px] text-[11px] font-medium",
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
              "flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3"
          )}
        >
          <div className="metric-value text-[32px] leading-none tracking-tight sm:text-[36px]">
            <MetricAnimatedValue value={value} />
          </div>
          {hasDataSparkline ? (
            <Sparkline
              data={sparklineData!}
              color={sparklineColor}
              animationDelay={sparklineAnimationDelay}
              className="h-8 w-full shrink-0 sm:h-10 sm:w-[80px] md:h-11 md:w-[96px] lg:h-12 lg:w-[120px]"
            />
          ) : null}
        </div>

        {showProgressBar && barWidth != null ? (
          <div className="mt-4 flex items-center gap-3">
            <div
              className={cn(
                "h-0.5 flex-1 overflow-hidden rounded-full bg-muted dark:bg-white/[0.06]",
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
          </div>
        ) : null}

        {progressCaption ? (
          <p className="mt-1.5 text-[11px] text-muted-foreground">
            {progressCaption}
          </p>
        ) : null}

        {(comparison || badge) && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {comparison ? (
              <span className="text-xs text-muted-foreground">{comparison}</span>
            ) : null}
            {badge ? (
              <span className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-[3px] text-[11px] font-medium text-primary dark:text-primary-light">
                {badge}
              </span>
            ) : null}
          </div>
        )}

        {children}
      </CardContent>

      {chartData && chartData.length >= 2 && (
        <div className="mt-1 h-[72px] w-full">
          <MetricLineChart
            data={chartData}
            previousData={chartPreviousData}
            startLabel={chartStartLabel}
            endLabel={chartEndLabel}
            color={sparklineColor !== "hsl(var(--foreground))" ? sparklineColor : "hsl(var(--primary))"}
            className="h-full px-4 pb-3"
          />
        </div>
      )}
    </Card>
  );
}
