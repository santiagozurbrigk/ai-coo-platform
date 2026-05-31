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
  return (
    <PieChart
      data={slices}
      innerRadius={innerRadius}
      padAngle={0.02}
      cornerRadius={4}
      className={cn("mx-auto max-w-[280px]", className)}
    >
      {slices.map((_, i) => (
        <PieSlice key={slices[i].label} index={i} />
      ))}
      <PieCenter defaultLabel="Total" />
    </PieChart>
  );
}
