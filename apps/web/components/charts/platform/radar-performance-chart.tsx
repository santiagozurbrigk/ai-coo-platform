"use client";

import { RadarChart } from "@/components/charts/radar-chart";
import { RadarGrid } from "@/components/charts/radar-grid";
import { RadarAxis } from "@/components/charts/radar-axis";
import { RadarLabels } from "@/components/charts/radar-labels";
import { RadarArea } from "@/components/charts/radar-area";
import type { RadarData, RadarMetric } from "@/components/charts/radar-context";
import { cn } from "@/lib/utils";

export function RadarPerformanceChart({
  metrics,
  series,
  className,
}: {
  metrics: RadarMetric[];
  series: RadarData[];
  className?: string;
}) {
  if (metrics.length < 3) {
    return (
      <p className={cn("py-8 text-center text-sm text-muted-foreground", className)}>
        Sin datos suficientes para el radar.
      </p>
    );
  }

  return (
    <RadarChart
      data={series}
      metrics={metrics}
      className={cn("mx-auto aspect-square min-h-[300px] w-full max-w-[320px]", className)}
      levels={4}
      margin={48}
    >
      <RadarGrid />
      <RadarAxis />
      <RadarLabels />
      {series.map((_, i) => (
        <RadarArea key={series[i].label} index={i} showPoints showGlow />
      ))}
    </RadarChart>
  );
}
