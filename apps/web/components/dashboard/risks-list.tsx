import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Panel } from "@/components/shared/panel";
import { SeverityBadge } from "@/components/shared/severity-badge";
import { flowLinks } from "@/lib/navigation/flow-links";
import type { DashboardRisk } from "@/types/dashboard";

export function RisksList({ risks }: { risks: DashboardRisk[] }) {
  return (
    <Panel title="Riesgos clave">
      <ul className="space-y-3">
        {risks.map((risk) => (
          <li key={risk.id}>
            <Link
              href={flowLinks.risk(risk.id)}
              className="flex gap-3 rounded-xl border border-border/60 bg-muted/20 px-3 py-3 transition-colors hover:border-red-500/25 hover:bg-muted/35 dark:border-glass dark:bg-glass dark:backdrop-blur-md hover:dark:border-glass-strong hover:dark:bg-glass-hover"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-red-500/25 bg-red-500/10 text-red-400">
                <AlertTriangle className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium leading-snug">{risk.title}</p>
                  <SeverityBadge severity={risk.severity} />
                </div>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {risk.description}
                </p>
                <p className="text-xs font-medium text-violet-400">
                  → {risk.suggestedAction}
                </p>
                <p className="text-2xs text-muted-foreground">{risk.department}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </Panel>
  );
}
