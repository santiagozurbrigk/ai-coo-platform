"use client";

import { PieChart } from "@/components/charts/pie-chart";
import { PieSlice } from "@/components/charts/pie-slice";
import { PieCenter } from "@/components/charts/pie-center";
import type { PieData } from "@/components/charts/pie-context";
import { cn } from "@/lib/utils";

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
  const chartData =
    visible.length > 0 ? visible : [{ label: "—", value: 1, color: "var(--chart-3)" }];

  return (
    <PieChart
      data={chartData}
      innerRadius={innerRadius}
      padAngle={0.02}
      cornerRadius={4}
      className={cn("mx-auto max-w-[280px]", className)}
    >
      {chartData.map((slice, i) => (
        <PieSlice key={`${slice.label}-${i}`} index={i} />
      ))}
      <PieCenter defaultLabel="Total" />
    </PieChart>
  );
}
