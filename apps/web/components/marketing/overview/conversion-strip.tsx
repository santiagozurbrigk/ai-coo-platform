"use client";

import { ArrowRight } from "lucide-react";
import { GlassPanel } from "@ai-coo/ui";
import type { MarketingOverviewMetrics } from "@/types/marketing-insights";

interface ConversionStripProps {
  metrics: MarketingOverviewMetrics;
}

/**
 * Franja horizontal de 3 métricas de conversión contenido → ventas.
 * Separa las etapas con flechas → para comunicar el flujo.
 */
export function ConversionStrip({ metrics }: ConversionStripProps) {
  const bookingToSalePct =
    metrics.bookingsInfluenced > 0
      ? Math.round((metrics.salesInfluenced / metrics.bookingsInfluenced) * 100)
      : 0;

  const steps = [
    {
      label: "Conversaciones",
      value: String(metrics.conversationsGenerated),
      sub: "Vinculadas a bandeja",
      pct: null,
    },
    {
      label: "Bookings influenciados",
      value: String(metrics.bookingsInfluenced),
      sub: `${metrics.bookingsInfluencedPct}% del total`,
      pct: metrics.bookingsInfluencedPct,
    },
    {
      label: "Ventas influenciadas",
      value: String(metrics.salesInfluenced),
      sub: `$${metrics.revenueInfluenced.toLocaleString("es-AR")} atribuidos`,
      pct: bookingToSalePct,
    },
  ];

  return (
    <GlassPanel className="p-0 overflow-hidden">
      <div className="flex items-stretch divide-x divide-border">
        {steps.map((step, i) => (
          <div key={step.label} className="relative flex-1 min-w-0 p-4 space-y-1">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground truncate">
              {step.label}
            </p>
            <p className="text-2xl font-bold tabular-nums">{step.value}</p>
            <p className="text-[11px] text-muted-foreground">{step.sub}</p>
            {step.pct !== null && (
              <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-brand-500"
                  style={{ width: `${step.pct}%` }}
                />
              </div>
            )}
            {i < steps.length - 1 && (
              <div className="absolute -right-3 top-1/2 z-10 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-background">
                <ArrowRight size={10} className="text-muted-foreground" />
              </div>
            )}
          </div>
        ))}
      </div>
    </GlassPanel>
  );
}
