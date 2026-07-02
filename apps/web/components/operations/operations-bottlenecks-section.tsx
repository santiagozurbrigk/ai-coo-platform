import Link from "next/link";
import { GitBranch } from "lucide-react";
import { cn } from "@ai-coo/ui";
import { Panel } from "@/components/shared/panel";
import { flowLinks } from "@/lib/navigation/flow-links";
import type {
  OperationsArea,
  OperationsBottleneck,
  OperationsRiskLevel,
} from "@/types/operations-overview";

const AREA_LABELS: Record<OperationsArea, string> = {
  sales: "Ventas",
  delivery: "Delivery",
  operations: "Operaciones",
  marketing: "Marketing",
};

const IMPACT_LABELS: Record<OperationsRiskLevel, string> = {
  high: "Alto impacto",
  medium: "Impacto medio",
  low: "Bajo impacto",
};

const IMPACT_CLASS: Record<OperationsRiskLevel, string> = {
  high: "text-red-600 dark:text-red-400",
  medium: "text-amber-600 dark:text-amber-300",
  low: "text-muted-foreground",
};

export function OperationsBottlenecksSection({
  bottlenecks,
}: {
  bottlenecks: OperationsBottleneck[];
}) {
  return (
    <Panel
      title="Cuellos de botella"
      subtitle="Por departamento — Ventas, Delivery, Operaciones, Marketing"
    >
      <ul className="grid gap-3 sm:grid-cols-2">
        {bottlenecks.map((item) => (
          <li key={item.id}>
            <Link
              href={flowLinks.bottleneck(item.id)}
              className="flex h-full flex-col gap-2 rounded-xl border border-border/60 bg-muted/20 p-4 transition-colors hover:border-violet-500/25 hover:bg-muted/35 dark:border-glass dark:bg-glass dark:backdrop-blur-md hover:dark:border-glass-strong hover:dark:bg-glass-hover"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-border/40 bg-background">
                    <GitBranch className="h-3.5 w-3.5 text-violet-400" />
                  </div>
                  <span className="rounded-full border border-border/40 bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                    {AREA_LABELS[item.department]}
                  </span>
                </div>
                <span
                  className={cn(
                    "text-[10px] font-medium",
                    IMPACT_CLASS[item.impact]
                  )}
                >
                  {IMPACT_LABELS[item.impact]}
                </span>
              </div>
              <p className="text-sm font-medium leading-snug">{item.title}</p>
              <p className="text-xs leading-relaxed text-muted-foreground">
                {item.description}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </Panel>
  );
}
