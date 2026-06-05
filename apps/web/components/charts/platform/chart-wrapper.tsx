"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export const CHART_MIN_HEIGHT = {
  lg: "min-h-[280px]",
  md: "min-h-[240px]",
  sm: "min-h-[160px]",
  gauge: "min-h-[200px]",
} as const;

export function ChartWrapper({
  data,
  minPoints = 2,
  children,
  emptyMessage = "Sin suficientes datos aún",
  className,
  minHeight = CHART_MIN_HEIGHT.md,
}: {
  data: unknown[] | undefined | null;
  minPoints?: number;
  children: ReactNode;
  emptyMessage?: string;
  className?: string;
  minHeight?: string;
}) {
  const count = data?.length ?? 0;

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
    <div
      className={cn(
        "flex h-full w-full items-center justify-center",
        minHeight,
        className
      )}
    >
      {children}
    </div>
  );
}
