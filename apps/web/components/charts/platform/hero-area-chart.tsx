"use client";

import { AreaChart, Area } from "@/components/charts/area-chart";
import { Grid } from "@/components/charts/grid";
import { XAxis } from "@/components/charts/x-axis";
import { ChartTooltip } from "@/components/charts/tooltip";
import { toTimeSeriesRows } from "@/lib/chart/bklit-data";
import { cn } from "@/lib/utils";
import { ChartWrapper } from "./chart-wrapper";

export function HeroAreaChart({
  data,
  color = "var(--chart-1)",
  className,
  emptyMessage,
}: {
  data: { label: string; value: number }[];
  color?: string;
  className?: string;
  emptyMessage?: string;
}) {
  return (
    <ChartWrapper
      data={data}
      minPoints={2}
      emptyMessage={emptyMessage}
      className={cn("min-h-[200px] w-full", className)}
      minHeight="min-h-[200px]"
    >
      <AreaChart
        data={toTimeSeriesRows(data)}
        xDataKey="date"
        aspectRatio="2.2 / 1"
        className="w-full"
        animationDuration={900}
        // top 56 reservaba lugar para un encabezado flotante que ya no existe:
        // aplastaba el área contra el piso del gráfico.
        margin={{ top: 16, right: 8, bottom: 28, left: 4 }}
      >
        <Grid horizontal vertical={false} numTicksRows={3} />
        <Area
          dataKey="value"
          fill={color}
          stroke={color}
          fillOpacity={0.18}
          gradientToOpacity={0}
          showHighlight
        />
        <XAxis numTicks={Math.min(data.length, 7)} />
        <ChartTooltip />
      </AreaChart>
    </ChartWrapper>
  );
}
