"use client";

import { GlassPanel, cn } from "@ai-coo/ui";
import type { ReactNode } from "react";

export function MetricChartPanel({
  title,
  value,
  subtitle,
  children,
  className,
  valueClassName,
}: {
  title: string;
  value: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  valueClassName?: string;
}) {
  return (
    <GlassPanel
      className={cn(
        "relative flex min-h-[280px] flex-col overflow-hidden p-0",
        className
      )}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 bg-gradient-to-b from-background/90 via-background/50 to-transparent px-4 pb-6 pt-4">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {title}
        </p>
        <p
          className={cn(
            "mt-1 text-2xl font-semibold tabular-nums tracking-tight text-foreground sm:text-3xl dark:text-white",
            valueClassName
          )}
        >
          {value}
        </p>
        {subtitle ? (
          <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
        ) : null}
      </div>
      <div className="relative mt-auto min-h-[200px] w-full flex-1">
        {children}
      </div>
    </GlassPanel>
  );
}
