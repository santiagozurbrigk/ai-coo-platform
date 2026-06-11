import { MetricCard } from "@ai-coo/ui";
import { Panel } from "@/components/shared/panel";
import {
  DASHBOARD_SPARKLINE_BY_ID,
  sparklineProps,
} from "@/lib/metrics/sparkline-series";
import type { DashboardMetric } from "@/types/dashboard";

export function RevenueMetricsSection({
  metrics,
}: {
  metrics: DashboardMetric[];
}) {
  return (
    <Panel title="Métricas de ingresos" subtitle="MRR, nuevos clientes y churn del mes">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {metrics.map((metric, index) => {
          const preset = DASHBOARD_SPARKLINE_BY_ID[metric.id];
          const sparkline = preset ? sparklineProps(preset, index * 80) : {};

          return (
            <MetricCard
              key={metric.id}
              title={metric.label}
              value={metric.value}
              trend={metric.trend}
              trendValue={metric.trendValue}
              {...sparkline}
            />
          );
        })}
      </div>
    </Panel>
  );
}
