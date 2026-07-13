import { MetricBand, MetricStat } from "@ai-coo/ui";
import { Panel } from "@/components/shared/panel";
import type { DashboardMetric } from "@/types/dashboard";

export function SalesMetricsSection({
  metrics,
}: {
  metrics: DashboardMetric[];
}) {
  const displayMetrics = metrics.slice(0, 3);

  return (
    <Panel
      title="Métricas de ventas"
      subtitle="Booking rate, conversaciones activas y ghosting rate"
    >
      <MetricBand>
        {displayMetrics.map((metric) => (
          <MetricStat
            key={metric.id}
            title={metric.label}
            value={metric.value}
            trend={metric.trend}
            trendValue={metric.trendValue}
          />
        ))}
      </MetricBand>
    </Panel>
  );
}
