"use client";

import { Gauge } from "@/components/charts/gauge";
import { cn } from "@/lib/utils";
import { brandColors } from "@/lib/brand";

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
  const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;

  return (
    <Gauge
      value={pct}
      centerValue={value}
      defaultLabel={label}
      suffix={suffix}
      useGradient
      activeGradient={[brandColors.primary, brandColors.primaryLight]}
      inactiveGradient={["#2a2119", "#1a1613"]}
      minWidth={0}
      className={cn("mx-auto w-full max-w-[240px]", className)}
      valueClassName={valueClassName}
      labelClassName={labelClassName}
      centerYFactor={centerYFactor}
    />
  );
}
