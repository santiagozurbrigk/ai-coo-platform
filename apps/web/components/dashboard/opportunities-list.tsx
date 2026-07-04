import Link from "next/link";
import { TrendingUp } from "lucide-react";
import { Badge } from "@ai-coo/ui";
import { Panel } from "@/components/shared/panel";
import { resolveOpportunityLink } from "@/lib/navigation/resolve-flow-link";
import type { DashboardOpportunity } from "@/types/dashboard";

export function OpportunitiesList({
  opportunities,
}: {
  opportunities: DashboardOpportunity[];
}) {
  return (
    <Panel title="Oportunidades">
      <ul className="space-y-3">
        {opportunities.map((opp) => (
          <li key={opp.id}>
            <Link
              href={resolveOpportunityLink({
                id: opp.id,
                title: opp.title,
                potential: `${opp.description} ${opp.impact}`,
              })}
              className="flex gap-3 rounded-xl border border-border/60 bg-muted/20 px-3 py-3 transition-colors hover:border-emerald-500/25 hover:bg-muted/35 dark:border-glass dark:bg-glass dark:backdrop-blur-md hover:dark:border-glass-strong hover:dark:bg-glass-hover"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-emerald-500/25 bg-emerald-500/10 text-emerald-400">
                <TrendingUp className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-medium leading-snug">{opp.title}</p>
                  <Badge variant="success" className="text-[10px]">
                    Oportunidad
                  </Badge>
                </div>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {opp.description}
                </p>
                <p className="text-xs text-muted-foreground">{opp.impact}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </Panel>
  );
}
