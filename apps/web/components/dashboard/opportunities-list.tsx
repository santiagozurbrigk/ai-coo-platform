import Link from "next/link";
import { Badge } from "@ai-coo/ui";
import { Panel } from "@/components/shared";
import { flowLinks } from "@/lib/navigation/flow-links";
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
              href={flowLinks.opportunity(opp.id)}
              className="block space-y-1 rounded-md border border-border/60 px-3 py-2.5 transition-colors hover:border-primary/25 hover:bg-muted/35"
            >
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium">{opp.title}</p>
              <Badge variant="success">Oportunidad</Badge>
            </div>
            <p className="text-xs text-muted-foreground">{opp.impact}</p>
            </Link>
          </li>
        ))}
      </ul>
    </Panel>
  );
}
