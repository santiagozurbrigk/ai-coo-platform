"use client";

import { Gauge } from "@/components/charts/gauge";
import { useTheme } from "@/providers/theme-provider";
import { cn } from "@/lib/utils";
import { accentGaugeGradients } from "./gauge-gradients";

export function GaugeMetricChart({
  value,
  max = 100,
  label = "Progreso",
  suffix = "%",
  className,
  valueClassName,
  labelClassName,
  centerYFactor,
}: {
  value: number;
  max?: number;
  label?: string;
  suffix?: string;
  className?: string;
  valueClassName?: string;
  labelClassName?: string;
  centerYFactor?: number;
}) {
  const { theme } = useTheme();
  const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
  const { active, inactive } = accentGaugeGradients(theme === "dark");

  return (
    <Gauge
      value={pct}
      centerValue={value}
      defaultLabel={label}
      suffix={suffix}
      useGradient
      activeGradient={active}
      inactiveGradient={inactive}
      minWidth={0}
      className={cn("mx-auto w-full max-w-[240px]", className)}
      valueClassName={valueClassName}
      labelClassName={labelClassName}
      centerYFactor={centerYFactor}
    />
  );
}
