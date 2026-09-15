"use client";

import { cn } from "@ai-coo/ui";
import { usePlatformData } from "@/providers/platform-data-provider";
import { FunnelChartPanel } from "@/components/charts/platform/funnel-chart-panel";
import { buildSalesFunnel } from "@/lib/metrics/build-sales-funnel-stages";

export function SalesFunnelStrip() {
  const { conversations, closingCalls } = usePlatformData();
  const { stages, subtitle, conversion } = buildSalesFunnel(
    conversations,
    closingCalls
  );

  // Con una sola etapa no hay embudo que mostrar: sería una barra sola con un
  // 100% que no compara contra nada.
  if (stages.length < 2) return null;

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-border bg-card px-5 pb-5 pt-4",
        "dark:border-glass dark:bg-glass dark:backdrop-blur-md"
      )}
    >
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">Embudo de conversión</p>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
        {conversion && (
          <span className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
            {conversion} total
          </span>
        )}
      </div>

      <FunnelChartPanel
        stages={stages}
        orientation="horizontal"
        color="hsl(var(--primary))"
        style={{ minHeight: 180, aspectRatio: "3.2 / 1" }}
        className="min-h-[180px]"
      />
    </div>
  );
}
