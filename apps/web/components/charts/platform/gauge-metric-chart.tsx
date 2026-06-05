"use client";

import { Gauge } from "@/components/charts/gauge";
import { cn } from "@/lib/utils";

export function GaugeMetricChart({
  value,
  max = 100,
  label = "Progreso",
  suffix = "%",
  className,
}: {
  value: number;
  max?: number;
  label?: string;
  suffix?: string;
  className?: string;
}) {
  const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;

  return (
    <Gauge
      value={pct}
      centerValue={value}
      defaultLabel={label}
      suffix={suffix}
      useGradient
      activeGradient={["#7C3AED", "#A78BFA"]}
      inactiveGradient={["#2a2540", "#1a1828"]}
      minWidth={0}
      className={cn("mx-auto w-full max-w-[240px]", className)}
    />
  );
}
