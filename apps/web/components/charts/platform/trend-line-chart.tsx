"use client";

import { LineChart, Line } from "@/components/charts/line-chart";
import { Grid } from "@/components/charts/grid";
import { XAxis } from "@/components/charts/x-axis";
import { ChartTooltip } from "@/components/charts/tooltip";
import { toTimeSeriesRows } from "@/lib/chart/bklit-data";
import { cn } from "@/lib/utils";

export function TrendLineChart({
  data,
  dataKey = "value",
  className,
  aspectRatio = "2.4 / 1",
  animationDuration = 900,
}: {
  data: { label: string; value: number }[];
  dataKey?: string;
  className?: string;
  aspectRatio?: string;
  animationDuration?: number;
}) {
  const rows = toTimeSeriesRows(data);

  return (
    <LineChart
      data={rows}
      xDataKey="date"
      aspectRatio={aspectRatio}
      className={cn("w-full", className)}
      animationDuration={animationDuration}
      margin={{ top: 24, right: 16, bottom: 36, left: 8 }}
    >
      <Grid horizontal vertical={false} numTicksRows={4} />
      <Line
        dataKey={dataKey}
        stroke="var(--chart-1)"
        strokeWidth={2.5}
        showMarkers
        showHighlight
      />
      <XAxis numTicks={Math.min(data.length, 6)} />
      <ChartTooltip />
    </LineChart>
  );
}
