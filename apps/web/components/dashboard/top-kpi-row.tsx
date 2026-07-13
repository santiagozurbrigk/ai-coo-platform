import { ArrowDown, ArrowRight, ArrowUp } from "lucide-react";
import { cn } from "@ai-coo/ui";
import type { DashboardMetric } from "@/types/dashboard";

function KpiCard({ metric }: { metric: DashboardMetric }) {
  const trend = metric.trend ?? "neutral";
  const isUp = trend === "up";
  const isDown = trend === "down";

  return (
    <div className="flex flex-col gap-1 rounded-xl border border-border/50 bg-card px-4 py-3">
      <span className="text-xs text-muted-foreground">{metric.label}</span>
      <span className="text-2xl font-semibold tabular-nums tracking-tight">
        {metric.value}
      </span>
      {metric.trendValue ? (
        <span
          className={cn(
            "inline-flex items-center gap-1 text-xs font-medium",
            isUp && "text-emerald-600 dark:text-emerald-400",
            isDown && "text-red-500 dark:text-red-400",
            !isUp && !isDown && "text-muted-foreground"
          )}
        >
          {isUp ? (
            <ArrowUp className="h-3 w-3" />
          ) : isDown ? (
            <ArrowDown className="h-3 w-3" />
          ) : (
            <ArrowRight className="h-3 w-3" />
          )}
          {metric.trendValue} vs semana anterior
        </span>
      ) : (
        <span className="text-xs text-muted-foreground">sin datos previos</span>
      )}
    </div>
  );
}

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
      {kpis.map((metric) => (
        <KpiCard key={metric.id} metric={metric} />
      ))}
    </div>
  );
}
