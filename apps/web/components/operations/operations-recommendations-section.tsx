import Link from "next/link";
import { Lightbulb } from "lucide-react";
import { cn } from "@ai-coo/ui";
import { Panel } from "@/components/shared/panel";
import { flowLinks } from "@/lib/navigation/flow-links";
import type {
  OperationsRecommendation,
  OperationsRiskLevel,
} from "@/types/operations-overview";

const PRIORITY_CONFIG: Record<
  OperationsRiskLevel,
  { label: string; className: string }
> = {
  high: {
    label: "Alta prioridad",
    className: "bg-red-500/15 text-red-400 border-red-500/30",
  },
  medium: {
    label: "Media prioridad",
    className: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  },
  low: {
    label: "Baja prioridad",
    className: "bg-muted text-muted-foreground border-border/40",
  },
};

export function OperationsRecommendationsSection({
  recommendations,
}: {
  recommendations: OperationsRecommendation[];
}) {
  return (
    <Panel
      title="Recomendaciones"
      subtitle="Acciones sugeridas para la próxima semana"
    >
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {recommendations.map((rec) => {
          const config = PRIORITY_CONFIG[rec.priority];
          return (
            <li key={rec.id}>
              <Link
                href={flowLinks.recommendation(rec.id)}
                className="flex h-full flex-col gap-2 rounded-xl border border-border/60 bg-muted/20 p-4 transition-colors hover:border-violet-500/25 hover:bg-muted/35 dark:border-white/[0.08] dark:bg-[#1A1A1A]"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-violet-500/25 bg-violet-500/10">
                    <Lightbulb className="h-3.5 w-3.5 text-violet-400" />
                  </div>
                  <span
                    className={cn(
                      "rounded-full border px-2 py-0.5 text-[10px] font-medium",
                      config.className
                    )}
                  >
                    {config.label}
                  </span>
                </div>
                <p className="text-sm font-medium leading-snug">{rec.title}</p>
                <p className="flex-1 text-xs leading-relaxed text-muted-foreground">
                  {rec.description}
                </p>
                <p className="text-[11px] text-muted-foreground">{rec.department}</p>
              </Link>
            </li>
          );
        })}
      </ul>
    </Panel>
  );
}
