"use client";

import { AreaChart, Area } from "@/components/charts/area-chart";
import { toTimeSeriesRows } from "@/lib/chart/bklit-data";
import { cn } from "@/lib/utils";

export function SparklineChart({
  data,
  color = "var(--chart-1)",
  className,
}: {
  data: number[];
  color?: string;
  className?: string;
}) {
  if (data.length < 2) return null;

  const points = data.map((value, i) => ({
    label: String(i),
    value,
  }));
  const rows = toTimeSeriesRows(points);

  return (
    <AreaChart
      data={rows}
      xDataKey="date"
      aspectRatio="3 / 1"
      className={cn("h-full w-full min-h-[32px]", className)}
      animationDuration={700}
      margin={{ top: 4, right: 4, bottom: 4, left: 4 }}
    >
      <Area
        dataKey="value"
        fill={color}
        stroke={color}
        fillOpacity={0.25}
        showLine
        showHighlight={false}
        showMarkers
        markers={{ radius: 3 }}
      />
    </AreaChart>
  );
}
