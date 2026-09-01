"use client";

import { PieChart } from "@/components/charts/pie-chart";
import { PieSlice } from "@/components/charts/pie-slice";
import { PieCenter } from "@/components/charts/pie-center";
import type { PieData } from "@/components/charts/pie-context";
import { categoricalColor } from "@/lib/chart/colors";
import { cn } from "@/lib/utils";
import { ChartLegend } from "./chart-legend";
import { ChartWrapper, CHART_MIN_HEIGHT } from "./chart-wrapper";

export function RingDistributionChart({
  slices,
  centerLabel,
  centerValue,
  className,
  emptyMessage = "Sin datos de distribución",
  showLegend = true,
}: {
  slices: PieData[];
  centerLabel?: string;
  centerValue: string;
  className?: string;
  emptyMessage?: string;
  showLegend?: boolean;
}) {
  const filtered = slices.filter((s) => s.value > 0);
  const total = filtered.reduce((sum, s) => sum + s.value, 0);

  return (
    <div className={cn("flex w-full flex-col items-center gap-3", className)}>
      <ChartWrapper
        data={filtered}
        minPoints={1}
        emptyMessage={emptyMessage}
        className={cn("mx-auto aspect-square w-full max-w-[200px]", CHART_MIN_HEIGHT.gauge)}
        minHeight={CHART_MIN_HEIGHT.gauge}
      >
        <PieChart data={filtered} innerRadius={56} padAngle={0.03} className="h-full w-full">
          {filtered.map((slice, i) => (
            <PieSlice key={slice.label ?? i} index={i} />
          ))}
          <PieCenter defaultLabel={centerLabel ?? "Total"}>
            {() => (
              <div className="flex flex-col items-center justify-center text-center">
                <span className="text-lg font-semibold">{centerValue}</span>
                <span className="text-micro text-muted-foreground">
                  {centerLabel ?? "Total"}
                </span>
              </div>
            )}
          </PieCenter>
        </PieChart>
      </ChartWrapper>
      {showLegend && filtered.length > 0 ? (
        <ChartLegend
          items={filtered.map((slice, i) => ({
            label: slice.label,
            color: slice.color ?? categoricalColor(i),
            value: `${Math.round(total > 0 ? (slice.value / total) * 100 : 0)}%`,
          }))}
        />
      ) : null}
    </div>
  );
}
