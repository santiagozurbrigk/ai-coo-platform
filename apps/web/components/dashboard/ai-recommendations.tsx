import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Badge } from "@ai-coo/ui";
import { Panel } from "@/components/shared/panel";
import { flowLinks } from "@/lib/navigation/flow-links";
import type { DashboardAiRecommendation } from "@/types/dashboard";

export function AiRecommendations({
  recommendations,
}: {
  recommendations: DashboardAiRecommendation[];
}) {
  return (
    <Panel
      title="Recomendaciones de IA"
      subtitle="Acciones sugeridas según actividad de la semana"
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {recommendations.map((rec) => (
          <Link
            key={rec.id}
            href={flowLinks.recommendation(rec.id)}
            className="group flex flex-col gap-3 rounded-xl border border-border/60 bg-muted/20 p-4 transition-colors hover:border-violet-500/30 hover:bg-muted/35 dark:border-glass dark:bg-glass dark:backdrop-blur-md hover:dark:border-glass-strong hover:dark:bg-glass-hover"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-violet-500/25 bg-violet-500/10 text-violet-400">
                <Sparkles className="h-4 w-4" />
              </div>
              <Badge variant="outline" className="text-[10px]">
                {rec.category}
              </Badge>
            </div>
            <p className="text-sm leading-relaxed text-foreground group-hover:text-foreground">
              {rec.text}
            </p>
          </Link>
        ))}
      </div>
    </Panel>
  );
}
