import { MetricCard, type MetricTrend } from "@ai-coo/ui";
import type { DashboardMetric } from "@/types/dashboard";
import {
  DASHBOARD_SPARKLINE_BY_ID,
  sparklineProps,
} from "@/lib/metrics/sparkline-series";

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
      {metrics.map((m, index) => {
        const preset = DASHBOARD_SPARKLINE_BY_ID[m.id];
        const sparkline = preset ? sparklineProps(preset, index * 100) : {};

        return (
          <MetricCard
            key={m.id}
            title={m.label}
            value={m.value}
            trend={m.trend as MetricTrend | undefined}
            trendValue={m.trendValue}
            {...sparkline}
          />
        );
      })}
    </div>
  );
}
