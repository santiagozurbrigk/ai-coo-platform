"use client";

import { LineChart, Line } from "@/components/charts/line-chart";
import { Grid } from "@/components/charts/grid";
import { XAxis } from "@/components/charts/x-axis";
import { ChartTooltip } from "@/components/charts/tooltip";
import { toTimeSeriesRows } from "@/lib/chart/bklit-data";
import { cn } from "@/lib/utils";
import { ChartWrapper, CHART_MIN_HEIGHT } from "./chart-wrapper";

export function TrendLineChart({
  data,
  dataKey = "value",
  className,
  aspectRatio = "2.4 / 1",
  animationDuration = 900,
  emptyMessage,
}: {
  data: { label: string; value: number }[];
  dataKey?: string;
  className?: string;
  aspectRatio?: string;
  animationDuration?: number;
  emptyMessage?: string;
}) {
  const rows = toTimeSeriesRows(data);

  return (
    <ChartWrapper
      data={data}
      minPoints={2}
      emptyMessage={emptyMessage}
      className={cn("w-full", CHART_MIN_HEIGHT.md, className)}
      minHeight={CHART_MIN_HEIGHT.md}
    >
    <LineChart
      data={rows}
      xDataKey="date"
      aspectRatio={aspectRatio}
      className="w-full"
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
    </ChartWrapper>
  );
}
