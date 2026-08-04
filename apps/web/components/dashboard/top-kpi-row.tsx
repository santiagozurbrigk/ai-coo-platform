"use client";

import { MetricCard } from "@ai-coo/ui";
import type { DashboardMetric } from "@/types/dashboard";

const KPI_IDS = ["m1", "m2", "m3", "s-booking", "s-active", "s-ghost"];

export function TopKpiRow({
  revenueMetrics,
  salesMetrics,
}: {
  revenueMetrics: DashboardMetric[];
  salesMetrics: DashboardMetric[];
}) {
  const all = [...revenueMetrics, ...salesMetrics];
  const kpis = KPI_IDS.map((id) => all.find((m) => m.id === id)).filter(
    Boolean
  ) as DashboardMetric[];

  if (kpis.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {kpis.map((metric, i) => (
        <MetricCard
          key={metric.id}
          title={metric.label}
          value={metric.value}
          trend={metric.trend}
          trendValue={metric.trendValue}
          sparklineData={metric.sparklineData}
          sparklineColor={metric.sparklineColor}
          sparklineAnimationDelay={i * 80}
          glass
          showProgressBar={false}
        />
      ))}
    </div>
  );
}
