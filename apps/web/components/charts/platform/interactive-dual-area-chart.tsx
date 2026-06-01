"use client";

import { AreaChart, Area } from "@/components/charts/area-chart";
import { Grid } from "@/components/charts/grid";
import { XAxis } from "@/components/charts/x-axis";
import { ChartTooltip } from "@/components/charts/tooltip";
import { cn } from "@/lib/utils";
import { ChartWrapper, CHART_MIN_HEIGHT } from "./chart-wrapper";

export function InteractiveDualAreaChart({
  data,
  primaryKey,
  secondaryKey,
  primaryLabel,
  secondaryLabel,
  primaryColor = "var(--chart-2)",
  secondaryColor = "var(--chart-1)",
  className,
  emptyMessage,
}: {
  data: { label: string; primary: number; secondary: number }[];
  primaryKey: string;
  secondaryKey: string;
  primaryLabel: string;
  secondaryLabel: string;
  primaryColor?: string;
  secondaryColor?: string;
  className?: string;
  emptyMessage?: string;
}) {
  const rows = data.map((d, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (data.length - 1 - i));
    return {
      date,
      name: d.label,
      [primaryKey]: d.primary,
      [secondaryKey]: d.secondary,
    };
  });

  return (
    <ChartWrapper
      data={data}
      minPoints={2}
      emptyMessage={emptyMessage}
      className={cn(CHART_MIN_HEIGHT.lg, className)}
      minHeight={CHART_MIN_HEIGHT.lg}
    >
      <div className="space-y-2">
        <AreaChart
          data={rows}
          xDataKey="date"
          aspectRatio="2.4 / 1"
          className="w-full"
          animationDuration={1000}
          margin={{ top: 20, right: 12, bottom: 32, left: 8 }}
        >
          <Grid horizontal vertical={false} numTicksRows={4} />
          <Area
            dataKey={primaryKey}
            fill={primaryColor}
            stroke={primaryColor}
            fillOpacity={0.08}
            strokeWidth={1.5}
            showHighlight
          />
          <Area
            dataKey={secondaryKey}
            fill={secondaryColor}
            stroke={secondaryColor}
            fillOpacity={0.05}
            strokeWidth={1.5}
            showHighlight
          />
          <XAxis numTicks={Math.min(data.length, 8)} />
          <ChartTooltip />
        </AreaChart>
        <div className="flex justify-center gap-4 text-xs">
          <span className="flex items-center gap-1.5">
            <span
              className="h-2 w-3 rounded-sm"
              style={{ background: primaryColor }}
            />
            {primaryLabel}
          </span>
          <span className="flex items-center gap-1.5">
            <span
              className="h-2 w-3 rounded-sm"
              style={{ background: secondaryColor }}
            />
            {secondaryLabel}
          </span>
        </div>
      </div>
    </ChartWrapper>
  );
}
