import { MetricCard, type MetricTrend } from "@ai-coo/ui";
import type { DashboardMetric } from "@/types/dashboard";

export function MetricGrid({
  metrics,
  columns = 4,
}: {
  metrics: DashboardMetric[];
  columns?: 2 | 3 | 4;
}) {
  const colClass =
    columns === 2
      ? "sm:grid-cols-2"
      : columns === 3
        ? "sm:grid-cols-2 lg:grid-cols-3"
        : "sm:grid-cols-2 lg:grid-cols-4";

  return (
    <div className={`grid gap-4 ${colClass}`}>
      {metrics.map((m) => (
        <MetricCard
          key={m.id}
          title={m.label}
          value={m.value}
          trend={m.trend as MetricTrend | undefined}
          trendValue={m.trendValue}
        />
      ))}
    </div>
  );
}
