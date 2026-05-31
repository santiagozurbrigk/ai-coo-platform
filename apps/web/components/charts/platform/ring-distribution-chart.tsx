"use client";

import { PieChart } from "@/components/charts/pie-chart";
import { PieSlice } from "@/components/charts/pie-slice";
import { PieCenter } from "@/components/charts/pie-center";
import type { PieData } from "@/components/charts/pie-context";
import { cn } from "@/lib/utils";
import { ChartWrapper, CHART_MIN_HEIGHT } from "./chart-wrapper";

export function RingDistributionChart({
  slices,
  centerLabel,
  centerValue,
  className,
  emptyMessage = "Sin datos de distribución",
}: {
  slices: PieData[];
  centerLabel?: string;
  centerValue: string;
  className?: string;
  emptyMessage?: string;
}) {
  const filtered = slices.filter((s) => s.value > 0);

  return (
    <ChartWrapper
      data={filtered}
      minPoints={1}
      emptyMessage={emptyMessage}
      className={cn(
        "mx-auto aspect-square max-w-[220px]",
        CHART_MIN_HEIGHT.gauge,
        className
      )}
      minHeight={CHART_MIN_HEIGHT.gauge}
    >
      <PieChart data={filtered} innerRadius={56} padAngle={0.03} className="h-full w-full">
        {filtered.map((_, i) => (
          <PieSlice key={filtered[i]?.label ?? i} index={i} />
        ))}
        <PieCenter defaultLabel={centerLabel ?? "Total"}>
          {() => (
            <div className="flex flex-col items-center justify-center text-center">
              <span className="text-lg font-semibold tabular-nums">{centerValue}</span>
            </div>
          )}
        </PieCenter>
      </PieChart>
    </ChartWrapper>
  );
}
