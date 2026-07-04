import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { cn } from "@ai-coo/ui";
import { Panel } from "@/components/shared/panel";
import { resolveRiskLink } from "@/lib/navigation/resolve-flow-link";
import type { OperationsRisk, OperationsRiskLevel } from "@/types/operations-overview";

const LEVEL_CONFIG: Record<
  OperationsRiskLevel,
  { label: string; className: string; border: string }
> = {
  high: {
    label: "Alto",
    className: "bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/30",
    border: "hover:border-red-500/30",
  },
  medium: {
    label: "Medio",
    className: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30",
    border: "hover:border-amber-500/30",
  },
  low: {
    label: "Bajo",
    className: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
    border: "hover:border-emerald-500/30",
  },
};

export function OperationsRisksSection({
  risks,
}: {
  risks: OperationsRisk[];
}) {
  return (
    <Panel title="Riesgos" subtitle="Señales detectadas esta semana">
      <ul className="space-y-3">
        {risks.map((risk) => {
          const config = LEVEL_CONFIG[risk.level];
          return (
            <li key={risk.id}>
              <Link
                href={resolveRiskLink(`${risk.title} ${risk.description}`)}
                className={cn(
                  "flex gap-3 rounded-xl border border-border/60 bg-muted/20 px-4 py-3 transition-colors dark:border-glass dark:bg-glass dark:backdrop-blur-md",
                  config.border
                )}
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-red-500/25 bg-red-500/10 text-red-400">
                  <AlertTriangle className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <p className="text-sm font-medium leading-snug">{risk.title}</p>
                    <span
                      className={cn(
                        "shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium",
                        config.className
                      )}
                    >
                      {config.label}
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    {risk.description}
                  </p>
                  <p className="text-xs font-medium text-violet-600 dark:text-violet-400">
                    → {risk.suggestedAction}
                  </p>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </Panel>
  );
}
