"use client";

import type { CSSProperties } from "react";
import {
  FunnelChart,
  type FunnelStage,
} from "@/components/charts/funnel-chart";
import { cn } from "@/lib/utils";

export function FunnelChartPanel({
  stages,
  className,
  color = "var(--chart-1)",
  style,
}: {
  stages: FunnelStage[];
  className?: string;
  color?: string;
  style?: CSSProperties;
}) {
  return (
    <FunnelChart
      data={stages}
      orientation="vertical"
      color={color}
      showLabels
      showValues
      showPercentage
      edges="curved"
      layers={3}
      gap={6}
      className={cn("w-full min-h-[400px]", className)}
      style={{
        minHeight: 400,
        height: 400,
        aspectRatio: "auto",
        ...style,
      }}
      formatValue={(v) => v.toLocaleString("es-ES")}
      formatPercentage={(p) => `${Math.round(p)}%`}
    />
  );
}
