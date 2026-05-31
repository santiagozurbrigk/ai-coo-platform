"use client";

import { PieChart } from "@/components/charts/pie-chart";
import { PieSlice } from "@/components/charts/pie-slice";
import { PieCenter } from "@/components/charts/pie-center";
import type { PieData } from "@/components/charts/pie-context";
import { cn } from "@/lib/utils";
import { ChartWrapper, CHART_MIN_HEIGHT } from "./chart-wrapper";

export function PieDistributionChart({
  slices,
  className,
  innerRadius = 52,
}: {
  slices: PieData[];
  className?: string;
  innerRadius?: number;
}) {
  const visible = slices.filter((s) => s.value > 0);

  return (
    <ChartWrapper
      data={visible}
      minPoints={1}
      emptyMessage="Sin datos para el gráfico"
      className={cn("mx-auto max-w-[280px]", CHART_MIN_HEIGHT.md, className)}
      minHeight={CHART_MIN_HEIGHT.md}
    >
      <PieChart
        data={visible}
        innerRadius={innerRadius}
        padAngle={0.02}
        cornerRadius={4}
        className="h-full w-full"
      >
        {visible.map((slice, i) => (
          <PieSlice key={`${slice.label}-${i}`} index={i} />
        ))}
        <PieCenter defaultLabel="Total" />
      </PieChart>
    </ChartWrapper>
  );
}
