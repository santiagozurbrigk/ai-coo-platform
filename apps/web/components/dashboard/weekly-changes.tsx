import { ArrowDown, ArrowRight, ArrowUp } from "lucide-react";
import { cn } from "@ai-coo/ui";
import { Panel } from "@/components/shared/panel";
import type { DashboardWeeklyChange } from "@/types/dashboard";

const DIRECTION_CONFIG = {
  up: {
    icon: ArrowUp,
    className: "text-emerald-400",
    prefix: "↑",
  },
  down: {
    icon: ArrowDown,
    className: "text-emerald-400",
    prefix: "↓",
  },
  neutral: {
    icon: ArrowRight,
    className: "text-muted-foreground",
    prefix: "",
  },
} as const;

export function WeeklyChanges({
  changes,
}: {
  changes: DashboardWeeklyChange[];
}) {
  return (
    <Panel title="Cambios de la semana" subtitle="Variaciones vs semana anterior">
      <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {changes.map((change) => {
          const config = DIRECTION_CONFIG[change.direction];
          const Icon = config.icon;

          return (
            <li
              key={change.id}
              className="flex items-center gap-2.5 rounded-lg border border-border/60 bg-muted/20 px-3 py-2.5 dark:border-glass dark:bg-glass dark:backdrop-blur-md"
            >
              <Icon className={cn("h-4 w-4 shrink-0", config.className)} />
              <span className="text-sm text-foreground">{change.label}</span>
            </li>
          );
        })}
      </ul>
    </Panel>
  );
}
