import { MetricBand, MetricStat } from "@ai-coo/ui";
import { Panel } from "@/components/shared/panel";
import { sparklineProps } from "@/lib/metrics/sparkline-series";
import type { DashboardMetric } from "@/types/dashboard";

const SALES_SPARKLINE: Record<string, "bookingRate" | "conversations" | "ghostingRate"> = {
  "s-booking": "bookingRate",
  "s-active": "conversations",
  "s-ghost": "ghostingRate",
  s2: "bookingRate",
  s5: "conversations",
  s4: "ghostingRate",
};

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
          const preset = SALES_SPARKLINE[metric.id];
          const sparkline = preset ? sparklineProps(preset, index * 100) : {};

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
