"use client";

import Link from "next/link";
import { TrendingUp } from "lucide-react";
import { cn } from "@ai-coo/ui";
import { Panel } from "@/components/shared/panel";
import { paths } from "@/routes";
import type { ZernioAnalyticsSummary } from "@/app/integrations/zernio/actions";
import { RingDistributionChart } from "@/components/charts/platform/ring-distribution-chart";

export function ZernioAnalyticsSection({
  analytics,
}: {
  analytics: ZernioAnalyticsSummary;
}) {
  if (!analytics.hasData) {
    return (
      <Panel
        title="Rendimiento en Redes"
        subtitle="Métricas agregadas de tus publicaciones vía Zernio"
      >
        <div className="rounded-xl border border-dashed border-border/70 bg-muted/20 px-4 py-8 text-center">
          <p className="text-sm font-medium text-foreground">
            Conectá tus redes para ver analytics
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Vinculá cuentas en Zernio para ver impresiones, likes y comentarios
            de los últimos 30 días.
          </p>
          <Link
            href={paths.platform.integrations}
            className="mt-4 inline-block text-sm font-medium text-primary hover:underline"
          >
            Ir a Integraciones
          </Link>
        </div>
      </Panel>
    );
  }

  const { totalImpressions, totalLikes, totalComments } = analytics;
  const engagements = totalLikes + totalComments;
  const engagementRate =
    totalImpressions > 0
      ? ((engagements / totalImpressions) * 100).toFixed(1)
      : "0.0";

  const slices = [
    { label: "Impresiones", value: totalImpressions, color: "#7C3AED" },
    { label: "Likes", value: totalLikes, color: "#E11D48" },
    { label: "Comentarios", value: totalComments, color: "#0F6E56" },
  ].filter((s) => s.value > 0);

  const totalEngagement = totalImpressions + totalLikes + totalComments;

  return (
    <Panel
      title="Rendimiento en Redes"
      subtitle="Últimos 30 días vía Zernio"
    >
      <div className="grid gap-6 sm:grid-cols-[auto_1fr] items-center">
        {/* Ring chart distribución */}
        <RingDistributionChart
          slices={slices}
          centerValue={`${engagementRate}%`}
          centerLabel="engagement"
          className="max-w-[180px]"
          emptyMessage="Sin datos de engagement"
        />

        {/* Detalle por métrica */}
        <div className="space-y-3">
          {[
            { label: "Impresiones", value: totalImpressions, color: "#7C3AED" },
            { label: "Likes", value: totalLikes, color: "#E11D48" },
            { label: "Comentarios", value: totalComments, color: "#0F6E56" },
          ].map(({ label, value, color }) => {
            const pct = totalEngagement > 0 ? Math.round((value / totalEngagement) * 100) : 0;
            return (
              <div key={label} className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full shrink-0" style={{ background: color }} />
                <span className="flex-1 text-xs text-muted-foreground">{label}</span>
                <span className="text-xs text-muted-foreground/60 tabular-nums">{pct}%</span>
                <span className="text-xs font-semibold tabular-nums w-20 text-right">
                  {value.toLocaleString("es")}
                </span>
              </div>
            );
          })}
          <div className={cn(
            "mt-2 flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2"
          )}>
            <TrendingUp className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs text-muted-foreground">Engagement rate</span>
            <span className="ml-auto text-sm font-semibold text-primary tabular-nums">{engagementRate}%</span>
          </div>
        </div>
      </div>
    </Panel>
  );
}
