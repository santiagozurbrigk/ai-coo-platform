"use client";

import { PieChart } from "@/components/charts/pie-chart";
import { PieSlice } from "@/components/charts/pie-slice";
import { PieCenter } from "@/components/charts/pie-center";
import type { PieData } from "@/components/charts/pie-context";
import { categoricalColor, CHART_MAX_SERIES } from "@/lib/chart/colors";
import { cn } from "@/lib/utils";
import { ChartLegend } from "./chart-legend";
import { ChartWrapper, CHART_MIN_HEIGHT } from "./chart-wrapper";

/** Agrupa la cola en "Otros" en vez de generar un color nuevo por categoría. */
function foldTail(slices: PieData[]): PieData[] {
  const sorted = [...slices].sort((a, b) => b.value - a.value);
  if (sorted.length <= CHART_MAX_SERIES) return sorted;

  const head = sorted.slice(0, CHART_MAX_SERIES - 1);
  const tail = sorted.slice(CHART_MAX_SERIES - 1);
  return [
    ...head,
    { label: "Otros", value: tail.reduce((sum, s) => sum + s.value, 0) },
  ];
}

export function PieDistributionChart({
  slices,
  className,
  innerRadius = 52,
  /** Oculta la leyenda cuando el contenedor ya lista las categorías. */
  showLegend = true,
  formatValue,
}: {
  slices: PieData[];
  className?: string;
  innerRadius?: number;
  showLegend?: boolean;
  formatValue?: (value: number, share: number) => string;
}) {
  const visible = foldTail(slices.filter((s) => s.value > 0));
  const total = visible.reduce((sum, s) => sum + s.value, 0);

  const legendItems = visible.map((slice, i) => ({
    label: slice.label,
    color: slice.color ?? categoricalColor(i),
    value: formatValue
      ? formatValue(slice.value, total > 0 ? slice.value / total : 0)
      : `${Math.round(total > 0 ? (slice.value / total) * 100 : 0)}%`,
  }));

  return (
    <div className={cn("flex w-full flex-col items-center gap-3", className)}>
      <ChartWrapper
        data={visible}
        minPoints={1}
        emptyMessage="Sin datos para el gráfico"
        className={cn("mx-auto w-full max-w-[240px]", CHART_MIN_HEIGHT.md)}
        minHeight={CHART_MIN_HEIGHT.md}
      >
        <PieChart
          data={visible}
          innerRadius={innerRadius}
          padAngle={0.02}
          cornerRadius={4}
          className="h-full w-full"
        >
          {visible.map((slice, i) => (
            <PieSlice key={`${slice.label}-${i}`} index={i} />
          ))}
          <PieCenter defaultLabel="Total" />
        </PieChart>
      </ChartWrapper>
      {showLegend && visible.length > 0 ? (
        <ChartLegend items={legendItems} />
      ) : null}
    </div>
  );
}
