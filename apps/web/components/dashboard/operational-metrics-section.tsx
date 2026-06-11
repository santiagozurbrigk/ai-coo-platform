import { cn } from "@ai-coo/ui";
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
          <div
            key={metric.id}
            className="rounded-xl border border-border/60 bg-muted/20 px-4 py-4 dark:border-white/[0.08] dark:bg-[#1A1A1A]"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {metric.label}
                </p>
                <p className="mt-1 text-2xl font-semibold tabular-nums tracking-tight">
                  {metric.value}
                </p>
              </div>
              {metric.trendValue ? (
                <span
                  className={cn(
                    "rounded-full border px-2.5 py-0.5 text-[11px] font-medium",
                    metric.trend === "up" &&
                      "border-emerald-400/25 bg-emerald-500/10 text-emerald-400",
                    metric.trend === "down" &&
                      "border-red-400/25 bg-red-500/10 text-red-400",
                    (!metric.trend || metric.trend === "neutral") &&
                      "border-border bg-muted text-muted-foreground"
                  )}
                >
                  {metric.trendValue}
                </span>
              ) : null}
            </div>
            {metric.progress != null ? (
              <div className="mt-4">
                <div className="h-1.5 overflow-hidden rounded-full bg-muted dark:bg-white/[0.06]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-violet-600 to-violet-400 transition-all duration-700"
                    style={{ width: `${metric.progress}%` }}
                  />
                </div>
                <p className="mt-1.5 text-[11px] text-muted-foreground">
                  {metric.progress}% del objetivo semanal
                </p>
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </Panel>
  );
}
