"use client";

import { GlassPanel, cn } from "@ai-coo/ui";
import type { ReactNode } from "react";

/**
 * Métrica compacta con sparkline al pie. Igual que `MetricChartPanel`, el
 * encabezado va en el flujo: flotándolo el sparkline quedaba recortado contra
 * el borde inferior de la card.
 */
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
      className={cn("flex flex-col gap-3 overflow-hidden p-4", className)}
    >
      <div>
        <p className="text-micro font-medium uppercase tracking-wide text-muted-foreground">
          {title}
        </p>
        <p className="mt-0.5 text-xl font-semibold">{value}</p>
      </div>
      <div className="flex min-h-[56px] w-full flex-1 items-end">{children}</div>
    </GlassPanel>
  );
}
