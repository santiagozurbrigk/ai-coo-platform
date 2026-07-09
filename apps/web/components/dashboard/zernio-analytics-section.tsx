"use client";

import Link from "next/link";
import { MetricBand, MetricStat } from "@ai-coo/ui";
import { Panel } from "@/components/shared/panel";
import { paths } from "@/routes";
import type { ZernioAnalyticsSummary } from "@/app/integrations/zernio/actions";

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
            Vinculá cuentas en Zernio para ver impresiones, likes y comentarios de
            los últimos 30 días.
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

  const metrics = [
    {
      id: "impressions",
      label: "Impresiones",
      value: analytics.totalImpressions.toLocaleString("es"),
    },
    {
      id: "likes",
      label: "Likes",
      value: analytics.totalLikes.toLocaleString("es"),
    },
    {
      id: "comments",
      label: "Comentarios",
      value: analytics.totalComments.toLocaleString("es"),
    },
  ];

  return (
    <Panel
      title="Rendimiento en Redes"
      subtitle="Métricas agregadas de tus publicaciones vía Zernio"
    >
      <MetricBand>
        {metrics.map((metric) => (
          <MetricStat key={metric.id} title={metric.label} value={metric.value} />
        ))}
      </MetricBand>
    </Panel>
  );
}
