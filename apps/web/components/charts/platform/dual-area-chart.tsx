"use client";

import { AreaChart, Area } from "@/components/charts/area-chart";
import { Grid } from "@/components/charts/grid";
import { XAxis } from "@/components/charts/x-axis";
import { ChartTooltip } from "@/components/charts/tooltip";
import { cn } from "@/lib/utils";

export function DualAreaChart({
  data,
  primaryKey,
  secondaryKey,
  primaryLabel,
  secondaryLabel,
  className,
}: {
  data: { label: string; primary: number; secondary: number }[];
  primaryKey: string;
  secondaryKey: string;
  primaryLabel: string;
  secondaryLabel: string;
  className?: string;
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
    <div className={cn("w-full space-y-2", className)}>
      <AreaChart
        data={rows}
        xDataKey="date"
        aspectRatio="2.2 / 1"
        className="w-full"
        animationDuration={1000}
        margin={{ top: 20, right: 12, bottom: 32, left: 8 }}
      >
        <Grid horizontal vertical={false} numTicksRows={4} />
        <Area
          dataKey={primaryKey}
          fill="var(--chart-1)"
          stroke="var(--chart-1)"
          fillOpacity={0.35}
        />
        <Area
          dataKey={secondaryKey}
          fill="var(--chart-2)"
          stroke="var(--chart-2)"
          fillOpacity={0.28}
        />
        <XAxis numTicks={Math.min(data.length, 6)} />
        <ChartTooltip />
      </AreaChart>
      <div className="flex justify-center gap-4 text-xs">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-3 rounded-sm bg-[var(--chart-1)]" />
          {primaryLabel}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-3 rounded-sm bg-[var(--chart-2)]" />
          {secondaryLabel}
        </span>
      </div>
    </div>
  );
}
