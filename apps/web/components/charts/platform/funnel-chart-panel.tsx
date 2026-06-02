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
  orientation = "vertical",
}: {
  stages: FunnelStage[];
  className?: string;
  color?: string;
  style?: CSSProperties;
  orientation?: "horizontal" | "vertical";
}) {
  const horizontal = orientation === "horizontal";

  return (
    <FunnelChart
      data={stages}
      orientation={orientation}
      color={color}
      showLabels
      showValues
      showPercentage
      edges="curved"
      layers={3}
      gap={6}
      className={cn(
        "w-full",
        horizontal ? "min-h-[280px]" : "min-h-[400px]",
        className
      )}
      style={{
        ...(horizontal
          ? { minHeight: 280, aspectRatio: "2.4 / 1", width: "100%" }
          : { minHeight: 400, height: 400, aspectRatio: "auto" }),
        ...style,
      }}
      formatValue={(v) => v.toLocaleString("es-ES")}
      formatPercentage={(p) => `${Math.round(p)}%`}
    />
  );
}
