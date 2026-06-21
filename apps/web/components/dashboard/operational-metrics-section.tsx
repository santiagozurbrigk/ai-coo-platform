import { MetricCard } from "@ai-coo/ui";
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
      <div className="grid gap-4 sm:grid-cols-2">
        {metrics.map((metric) => (
          <MetricCard
            key={metric.id}
            title={metric.label}
            value={metric.value}
            trend={metric.trend}
            trendValue={metric.trendValue}
            glass
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
      </div>
    </Panel>
  );
}
