import { MetricBand, MetricStat } from "@ai-coo/ui";
import { Panel } from "@/components/shared/panel";
import type { DashboardMetric } from "@/types/dashboard";

export function RevenueMetricsSection({
  metrics,
}: {
  metrics: DashboardMetric[];
}) {
  return (
    <Panel title="Métricas de ingresos" subtitle="MRR, nuevos clientes y churn del mes">
      <MetricBand>
        {metrics.map((metric) => (
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
