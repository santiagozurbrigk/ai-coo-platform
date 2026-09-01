"use client";

import { AreaChart, Area } from "@/components/charts/area-chart";
import { Grid } from "@/components/charts/grid";
import { XAxis } from "@/components/charts/x-axis";
import { ChartTooltip } from "@/components/charts/tooltip";
import { categoricalColor } from "@/lib/chart/colors";
import { cn } from "@/lib/utils";
import { ChartLegend } from "./chart-legend";
import { ChartWrapper, CHART_MIN_HEIGHT } from "./chart-wrapper";

export function InteractiveDualAreaChart({
  data,
  primaryKey,
  secondaryKey,
  primaryLabel,
  secondaryLabel,
  // Dos series = dos identidades. Dos pasos de la rampa monocroma se leían
  // como una sola serie duplicada.
  primaryColor = categoricalColor(0),
  secondaryColor = categoricalColor(1),
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
      className={cn("w-full", CHART_MIN_HEIGHT.lg, className)}
      minHeight={CHART_MIN_HEIGHT.lg}
    >
      <div className="w-full space-y-3">
        <AreaChart
          data={rows}
          xDataKey="date"
          aspectRatio="2.4 / 1"
          className="w-full"
          animationDuration={1000}
          margin={{ top: 20, right: 20, bottom: 32, left: 20 }}
        >
          <Grid horizontal vertical={false} numTicksRows={4} />
          <Area
            dataKey={primaryKey}
            fill={primaryColor}
            stroke={primaryColor}
            fillOpacity={0.16}
            strokeWidth={2}
            showHighlight
          />
          <Area
            dataKey={secondaryKey}
            fill={secondaryColor}
            stroke={secondaryColor}
            fillOpacity={0.16}
            strokeWidth={2}
            showHighlight
          />
          <XAxis numTicks={Math.min(data.length, 8)} />
          <ChartTooltip />
        </AreaChart>
        <ChartLegend
          items={[
            { label: primaryLabel, color: primaryColor },
            { label: secondaryLabel, color: secondaryColor },
          ]}
        />
      </div>
    </ChartWrapper>
  );
}
