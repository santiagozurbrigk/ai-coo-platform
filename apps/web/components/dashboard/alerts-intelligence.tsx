import Link from "next/link";
import { AlertTriangle, TrendingUp } from "lucide-react";
import { Badge } from "@ai-coo/ui";
import { Panel } from "@/components/shared/panel";
import { SeverityBadge } from "@/components/shared/severity-badge";
import { resolveRiskLink, resolveOpportunityLink } from "@/lib/navigation/resolve-flow-link";
import type { DashboardRisk, DashboardOpportunity } from "@/types/dashboard";

function RiskItem({ risk }: { risk: DashboardRisk }) {
  return (
    <Link
      href={resolveRiskLink(`${risk.title} ${risk.description} ${risk.suggestedAction}`)}
      className="flex gap-3 rounded-xl border-l-4 border-l-red-500/60 border-t border-r border-b border-border/40 bg-muted/20 px-3 py-3 transition-colors hover:bg-muted/35 dark:border-t-glass dark:border-r-glass dark:border-b-glass dark:bg-glass dark:backdrop-blur-md hover:dark:bg-glass-hover"
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-red-500/25 bg-red-500/10 text-red-400">
        <AlertTriangle className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium leading-snug">{risk.title}</p>
          <SeverityBadge severity={risk.severity} />
        </div>
        <p className="text-xs leading-relaxed text-muted-foreground">{risk.description}</p>
        <p className="text-xs font-medium text-violet-600 dark:text-violet-400">
          → {risk.suggestedAction}
        </p>
      </div>
    </Link>
  );
}

function OpportunityItem({ opp }: { opp: DashboardOpportunity }) {
  return (
    <Link
      href={resolveOpportunityLink({ id: opp.id, title: opp.title, potential: `${opp.description} ${opp.impact}` })}
      className="flex gap-3 rounded-xl border-l-4 border-l-emerald-500/60 border-t border-r border-b border-border/40 bg-muted/20 px-3 py-3 transition-colors hover:bg-muted/35 dark:border-t-glass dark:border-r-glass dark:border-b-glass dark:bg-glass dark:backdrop-blur-md hover:dark:bg-glass-hover"
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
        <p className="text-xs leading-relaxed text-muted-foreground">{opp.description}</p>
        <p className="text-xs text-muted-foreground">{opp.impact}</p>
      </div>
    </Link>
  );
}

export function AlertsIntelligence({
  risks,
  opportunities,
}: {
  risks: DashboardRisk[];
  opportunities: DashboardOpportunity[];
}) {
  if (risks.length === 0 && opportunities.length === 0) return null;

  return (
    <Panel title="Alertas e inteligencia" subtitle="Riesgos activos y oportunidades detectadas">
      <div className="grid gap-3 lg:grid-cols-2">
        {risks.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wide text-red-500/80">
              Riesgos ({risks.length})
            </p>
            <ul className="space-y-2">
              {risks.map((risk) => (
                <li key={risk.id}>
                  <RiskItem risk={risk} />
                </li>
              ))}
            </ul>
          </div>
        )}
        {opportunities.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wide text-emerald-500/80">
              Oportunidades ({opportunities.length})
            </p>
            <ul className="space-y-2">
              {opportunities.map((opp) => (
                <li key={opp.id}>
                  <OpportunityItem opp={opp} />
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Panel>
  );
}
