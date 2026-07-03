import { MetricBand, MetricStat } from "@ai-coo/ui";
import { Panel } from "@/components/shared/panel";
import { metricSparklineProps } from "@/lib/metrics/sparkline-series";
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
        {displayMetrics.map((metric, index) => {
          const sparkline = metricSparklineProps(metric, index * 100);

          return (
            <MetricStat
              key={metric.id}
              title={metric.label}
              value={metric.value}
              trend={metric.trend}
              trendValue={metric.trendValue}
              {...sparkline}
            />
          );
        })}
      </MetricBand>
    </Panel>
  );
}
