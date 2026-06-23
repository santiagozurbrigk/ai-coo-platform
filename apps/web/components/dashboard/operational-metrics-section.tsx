import { MetricBand, MetricStat } from "@ai-coo/ui";
import { Panel } from "@/components/shared/panel";
import type { DashboardMetric } from "@/types/dashboard";

export function OperationalMetricsSection({
  metrics,
}: {
  metrics: DashboardMetric[];
}) {
  return (
    <Panel
      title="Métricas operacionales"
      subtitle="Tasks completadas e inputs semanales del equipo"
    >
      <MetricBand>
        {metrics.map((metric) => (
          <MetricStat
            key={metric.id}
            title={metric.label}
            value={metric.value}
            trend={metric.trend}
            trendValue={metric.trendValue}
            showProgressBar={metric.progress != null}
            progress={metric.progress}
            progressCaption={
              metric.progress != null
                ? `${metric.progress}% del objetivo semanal`
                : undefined
            }
            progressVariant="violet"
          />
        ))}
      </MetricBand>
    </Panel>
  );
}
