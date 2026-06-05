"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export const CHART_MIN_HEIGHT = {
  lg: "min-h-[280px]",
  md: "min-h-[240px]",
  sm: "min-h-[160px]",
  gauge: "min-h-[200px]",
} as const;

export type ChartWrapperAlign = "stretch" | "center";

export function ChartWrapper({
  data,
  minPoints = 2,
  children,
  emptyMessage = "Sin suficientes datos aún",
  className,
  minHeight = CHART_MIN_HEIGHT.md,
  align = "stretch",
}: {
  data: unknown[] | undefined | null;
  minPoints?: number;
  children: ReactNode;
  emptyMessage?: string;
  className?: string;
  minHeight?: string;
  /** `stretch` = gráficos de área/línea/barras a ancho completo; `center` = gauges */
  align?: ChartWrapperAlign;
}) {
  const count = data?.length ?? 0;

  const layoutClass =
    align === "center"
      ? "flex items-center justify-center"
      : "block";

  if (!data || count < minPoints) {
    return (
      <div
        className={cn(
          "flex h-full w-full items-center justify-center text-sm text-muted-foreground",
          minHeight,
          className
        )}
      >
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={cn("h-full w-full", layoutClass, minHeight, className)}>
      {children}
    </div>
  );
}
