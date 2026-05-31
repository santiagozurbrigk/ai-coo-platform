"use client";

import { BarChart, Bar } from "@/components/charts/bar-chart";
import { Grid } from "@/components/charts/grid";
import { BarXAxis } from "@/components/charts/bar-x-axis";
import { ChartTooltip } from "@/components/charts/tooltip";
import { toCategoryRows } from "@/lib/chart/bklit-data";
import { cn } from "@/lib/utils";
import { ChartWrapper, CHART_MIN_HEIGHT } from "./chart-wrapper";

export function CategoryBarChart({
  items,
  horizontal = false,
  className,
}: {
  items: { label: string; value: number; color?: string }[];
  horizontal?: boolean;
  className?: string;
}) {
  const rows = toCategoryRows(items);
  const filtered = items.filter((i) => i.value > 0);

  return (
    <ChartWrapper
      data={filtered.length > 0 ? filtered : items}
      minPoints={1}
      emptyMessage="No hay cuotas pendientes"
      minHeight={CHART_MIN_HEIGHT.sm}
    >
    <BarChart
      data={rows}
      xDataKey="name"
      orientation={horizontal ? "horizontal" : "vertical"}
      aspectRatio={horizontal ? "1.6 / 1" : "2 / 1"}
      className={cn("w-full", className)}
      animationDuration={900}
      margin={{ top: 16, right: 12, bottom: horizontal ? 12 : 36, left: horizontal ? 80 : 8 }}
    >
      <Grid horizontal={!horizontal} vertical={horizontal} numTicksRows={4} />
      <Bar dataKey="value" fill="var(--chart-1)" stroke="var(--chart-1)" />
      <BarXAxis showAllLabels />
      <ChartTooltip />
    </BarChart>
    </ChartWrapper>
  );
}
