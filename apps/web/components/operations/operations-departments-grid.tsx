import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import { cn } from "@ai-coo/ui";
import { Panel } from "@/components/shared/panel";
import type {
  OperationsArea,
  OperationsDepartment,
  OperationsDepartmentStatus,
} from "@/types/operations-overview";

const AREA_LABELS: Record<OperationsArea, string> = {
  sales: "Ventas",
  delivery: "Delivery",
  operations: "Operaciones",
  marketing: "Marketing",
};

const STATUS_CONFIG: Record<
  OperationsDepartmentStatus,
  { dot: string; badge: string }
> = {
  healthy: {
    dot: "bg-emerald-400",
    badge: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  },
  warning: {
    dot: "bg-amber-400",
    badge: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  },
  critical: {
    dot: "bg-red-400",
    badge: "bg-red-500/15 text-red-400 border-red-500/30",
  },
};

const TREND_ICON = {
  up: ArrowUp,
  down: ArrowDown,
  neutral: Minus,
} as const;

export function OperationsDepartmentsGrid({
  departments,
}: {
  departments: OperationsDepartment[];
}) {
  return (
    <Panel title="Overview por departamento" subtitle="Estado y métricas clave">
      <div className="grid gap-4 sm:grid-cols-2">
        {departments.map((dept) => {
          const status = STATUS_CONFIG[dept.status];
          return (
            <div
              key={dept.id}
              className="rounded-xl border border-border/60 bg-muted/20 p-4 dark:border-white/[0.08] dark:bg-[#1A1A1A]"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-medium">{dept.name}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {AREA_LABELS[dept.area]}
                  </p>
                </div>
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-medium",
                    status.badge
                  )}
                >
                  <span className={cn("h-1.5 w-1.5 rounded-full", status.dot)} />
                  {dept.statusLabel}
                </span>
              </div>
              <ul className="mt-4 space-y-2">
                {dept.metrics.map((metric) => {
                  const TrendIcon = metric.trend
                    ? TREND_ICON[metric.trend]
                    : null;
                  return (
                    <li
                      key={metric.label}
                      className="flex items-center justify-between gap-2 text-xs"
                    >
                      <span className="text-muted-foreground">{metric.label}</span>
                      <span className="flex items-center gap-1 font-medium tabular-nums">
                        {metric.value}
                        {TrendIcon ? (
                          <TrendIcon
                            className={cn(
                              "h-3 w-3",
                              metric.trend === "up" && "text-emerald-400",
                              metric.trend === "down" && "text-emerald-400",
                              metric.trend === "neutral" && "text-muted-foreground"
                            )}
                          />
                        ) : null}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}
