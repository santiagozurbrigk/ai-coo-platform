"use client";

import { Gauge } from "@/components/charts/gauge";
import { useTheme } from "@/providers/theme-provider";
import { cn } from "@/lib/utils";
import { ChartWrapper, CHART_MIN_HEIGHT } from "./chart-wrapper";
import { type GaugeVariant, resolveGaugeGradients } from "./gauge-gradients";

export type { GaugeVariant } from "./gauge-gradients";

export function GaugeTargetChart({
  value,
  max = 100,
  target,
  label,
  suffix = "%",
  displayValue,
  variant = "default",
  className,
  subtitle,
}: {
  value: number;
  max?: number;
  target?: number;
  label: string;
  suffix?: string;
  displayValue?: number;
  variant?: GaugeVariant;
  className?: string;
  subtitle?: string;
}) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
  const { active, inactive } = resolveGaugeGradients(variant, isDark);

  return (
    <div
      className={cn(
        "flex h-full w-full flex-col items-center justify-between",
        className
      )}
    >
      <ChartWrapper
        data={[value]}
        minPoints={1}
        align="center"
        className={cn("w-full flex-1 py-2", CHART_MIN_HEIGHT.gauge)}
        minHeight={CHART_MIN_HEIGHT.gauge}
      >
        <Gauge
          value={pct}
          centerValue={displayValue ?? value}
          defaultLabel={label}
          suffix={suffix}
          useGradient
          activeGradient={active}
          inactiveGradient={inactive}
          minWidth={0}
          className="mx-auto h-full w-full max-w-[240px]"
        />
      </ChartWrapper>
      {target != null ? (
        <p className="w-full shrink-0 pb-1 text-center text-xs text-muted-foreground">
          {subtitle ?? `Objetivo: ${target}${suffix}`}
        </p>
      ) : null}
    </div>
  );
}
