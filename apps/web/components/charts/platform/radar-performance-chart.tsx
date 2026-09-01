"use client";

import { RadarChart } from "@/components/charts/radar-chart";
import { RadarGrid } from "@/components/charts/radar-grid";
import { RadarAxis } from "@/components/charts/radar-axis";
import { RadarLabels } from "@/components/charts/radar-labels";
import { RadarArea } from "@/components/charts/radar-area";
import type { RadarData, RadarMetric } from "@/components/charts/radar-context";
import { categoricalColor } from "@/lib/chart/colors";
import { cn } from "@/lib/utils";
import { ChartLegend } from "./chart-legend";

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
    <div className={cn("flex w-full flex-col items-center gap-3", className)}>
      <RadarChart
        data={series}
        metrics={metrics}
        className="mx-auto aspect-square min-h-[300px] w-full max-w-[320px]"
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
      {/* Con dos o más áreas superpuestas la leyenda es la única forma de saber
          cuál es cuál sin pasar el mouse. */}
      {series.length > 1 ? (
        <ChartLegend
          items={series.map((s, i) => ({
            label: s.label,
            color: s.color ?? categoricalColor(i),
          }))}
        />
      ) : null}
    </div>
  );
}
