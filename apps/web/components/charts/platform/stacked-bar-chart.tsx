"use client";

import { BarChart, Bar } from "@/components/charts/bar-chart";
import { Grid } from "@/components/charts/grid";
import { BarXAxis } from "@/components/charts/bar-x-axis";
import { ChartTooltip } from "@/components/charts/tooltip";
import { cn } from "@/lib/utils";
import { ChartWrapper, CHART_MIN_HEIGHT } from "./chart-wrapper";

const PALETTE = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

export function StackedBarChart({
  data,
  keys,
  labels,
  className,
}: {
  data: { month: string; [key: string]: string | number }[];
  keys: string[];
  labels: string[];
  className?: string;
}) {
  const rows = data.map((d) => ({ name: d.month, ...d }));

  return (
    <div className={cn("space-y-2", className)}>
      <ChartWrapper
        data={rows}
        minPoints={1}
        emptyMessage="Sin datos de facturación por mes"
        minHeight={CHART_MIN_HEIGHT.md}
      >
      <BarChart
        data={rows}
        xDataKey="name"
        stacked
        aspectRatio="2.2 / 1"
        className="w-full"
        animationDuration={1000}
        margin={{ top: 20, right: 12, bottom: 36, left: 8 }}
      >
        <Grid horizontal vertical={false} numTicksRows={4} />
        {keys.map((key, i) => (
          <Bar
            key={key}
            dataKey={key}
            fill={PALETTE[i % PALETTE.length]}
            stroke={PALETTE[i % PALETTE.length]}
          />
        ))}
        <BarXAxis showAllLabels />
        <ChartTooltip />
      </BarChart>
      </ChartWrapper>
      <div className="flex flex-wrap justify-center gap-3 text-xs">
        {labels.map((label, i) => (
          <span key={label} className="flex items-center gap-1.5">
            <span
              className="h-2 w-3 rounded-sm"
              style={{ background: PALETTE[i % PALETTE.length] }}
            />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
