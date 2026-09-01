"use client";

import { BarChart, Bar } from "@/components/charts/bar-chart";
import { Grid } from "@/components/charts/grid";
import { BarXAxis } from "@/components/charts/bar-x-axis";
import { ChartTooltip } from "@/components/charts/tooltip";
import { toCategoryRows } from "@/lib/chart/bklit-data";
import { categoricalColor } from "@/lib/chart/colors";
import { cn } from "@/lib/utils";
import { ChartWrapper, CHART_MIN_HEIGHT } from "./chart-wrapper";

export function CategoryBarChart({
  items,
  horizontal = false,
  className,
  /**
   * Fill de barras. Por defecto el color de serie 1: son categorías nominales
   * (canales, productos), así que todas comparten color — pintarlas más oscuro
   * donde son más grandes re-codificaría en el color lo que el largo ya dice.
   */
  barFill = categoricalColor(0),
  emptyMessage = "Sin datos para el gráfico",
}: {
  items: { label: string; value: number; color?: string }[];
  horizontal?: boolean;
  className?: string;
  barFill?: string;
  emptyMessage?: string;
}) {
  const rows = toCategoryRows(items);
  const filtered = items.filter((i) => i.value > 0);

  // El label más largo define cuánta canaleta reservar a la izquierda para que
  // no quede recortado.
  const labelGutter = horizontal
    ? Math.min(140, Math.max(72, ...items.map((i) => i.label.length * 7 + 16)))
    : 8;

  return (
    <ChartWrapper
      data={filtered.length > 0 ? filtered : items}
      minPoints={1}
      emptyMessage={emptyMessage}
      minHeight={horizontal ? CHART_MIN_HEIGHT.md : CHART_MIN_HEIGHT.sm}
      className={cn("w-full", className)}
    >
    <BarChart
      data={rows}
      xDataKey="name"
      orientation={horizontal ? "horizontal" : "vertical"}
      aspectRatio={horizontal ? "1.6 / 1" : "2 / 1"}
      className="w-full"
      animationDuration={900}
      // Barras finas: los bloques anchos y saturados se leen ruidosos.
      barGap={horizontal ? 0.5 : 0.55}
      margin={{
        top: 16,
        right: 16,
        bottom: horizontal ? 16 : 36,
        left: labelGutter,
      }}
    >
      <Grid horizontal={!horizontal} vertical={horizontal} numTicksRows={4} />
      <Bar dataKey="value" fill={barFill} stroke={barFill} />
      <BarXAxis showAllLabels />
      <ChartTooltip />
    </BarChart>
    </ChartWrapper>
  );
}
