"use client";

import { GlassPanel, cn } from "@ai-coo/ui";
import type { ReactNode } from "react";
import { CHART_MIN_HEIGHT } from "./chart-wrapper";

export function MiniMetricChart({
  title,
  value,
  children,
  className,
}: {
  title: string;
  value: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <GlassPanel
      className={cn(
        "relative flex flex-col overflow-hidden p-0",
        CHART_MIN_HEIGHT.sm,
        className
      )}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 px-3 pt-3">
        <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
          {title}
        </p>
        <p className="text-xl font-semibold tabular-nums">{value}</p>
      </div>
      <div className="mt-auto flex-1 min-h-[120px] w-full pt-10">{children}</div>
    </GlassPanel>
  );
}
