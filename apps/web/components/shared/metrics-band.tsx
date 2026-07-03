import { MetricBand, MetricCard, MetricStat, type MetricTrend } from "@ai-coo/ui";
import type { DashboardMetric } from "@/types/dashboard";
import { metricSparklineProps } from "@/lib/metrics/sparkline-series";
import { BentoCell, BentoGrid, type BentoSize } from "./bento-grid";

const METRIC_BENTO_PATTERN: BentoSize[] = [
  "wide",
  "unit",
  "unit",
  "wide",
  "unit",
  "wide",
  "unit",
  "unit",
];

/** @deprecated Use MetricBand + MetricStat for row layouts. */
export function MetricGrid({
  metrics,
}: {
  metrics: DashboardMetric[];
  /** @deprecated El layout bento define el tamaño por posición. */
  columns?: 2 | 3 | 4;
}) {
  return (
    <BentoGrid>
      {metrics.map((m, index) => {
        const sparkline = metricSparklineProps(m, index * 100);
        const size = METRIC_BENTO_PATTERN[index % METRIC_BENTO_PATTERN.length];

        return (
          <BentoCell key={m.id} size={size}>
            <MetricCard
              className="h-full"
              title={m.label}
              value={m.value}
              trend={m.trend as MetricTrend | undefined}
              trendValue={m.trendValue}
              {...sparkline}
            />
          </BentoCell>
        );
      })}
    </BentoGrid>
  );
}

export function DashboardMetricsBand({
  metrics,
}: {
  metrics: DashboardMetric[];
}) {
  return (
    <MetricBand>
      {metrics.map((metric, index) => {
        const sparkline = metricSparklineProps(metric, index * 80);

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
  );
}
