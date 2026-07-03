import { MetricCard, type MetricTrend } from "@ai-coo/ui";
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
