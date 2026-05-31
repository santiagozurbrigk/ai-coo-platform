"use client";

import { BarChart, Bar } from "@/components/charts/bar-chart";
import { Grid } from "@/components/charts/grid";
import { XAxis } from "@/components/charts/x-axis";
import { ChartTooltip } from "@/components/charts/tooltip";
import { toCategoryRows } from "@/lib/chart/bklit-data";
import { cn } from "@/lib/utils";

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

  return (
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
      <XAxis tickMode="data" />
      <ChartTooltip />
    </BarChart>
  );
}
