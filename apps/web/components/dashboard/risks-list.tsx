import Link from "next/link";
import { Panel, SeverityBadge } from "@/components/shared";
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
              className="flex items-start justify-between gap-3 rounded-md border border-border/60 bg-muted/20 px-3 py-2.5 transition-colors hover:border-primary/25 hover:bg-muted/35"
            >
            <div className="min-w-0">
              <p className="text-sm font-medium">{risk.title}</p>
              <p className="text-2xs text-muted-foreground mt-0.5">
                {risk.department}
              </p>
            </div>
            <SeverityBadge severity={risk.severity} />
            </Link>
          </li>
        ))}
      </ul>
    </Panel>
  );
}
