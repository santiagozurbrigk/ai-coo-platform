import Link from "next/link";
import { Badge, Button, GlassPanel } from "@ai-coo/ui";
import { Check, X } from "lucide-react";
import { loadOrgHealthScores } from "@/lib/super-admin/org-health";
import { paths } from "@/routes";
import type { OrgHealthStatus } from "@/types/super-admin";

const STATUS_META: Record<
  OrgHealthStatus,
  { label: string; emoji: string; variant: "success" | "warning" | "destructive" }
> = {
  healthy: { label: "Healthy", emoji: "🟢", variant: "success" },
  warning: { label: "Warning", emoji: "🟡", variant: "warning" },
  critical: { label: "Critical", emoji: "🔴", variant: "destructive" },
};

function Indicator({
  ok,
  label,
}: {
  ok: boolean;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2 text-sm">
      {ok ? (
        <Check className="h-4 w-4 text-emerald-500" />
      ) : (
        <X className="h-4 w-4 text-muted-foreground" />
      )}
      <span className={ok ? "text-foreground" : "text-muted-foreground"}>
        {label}
      </span>
    </div>
  );
}

export default async function SuperAdminClientHealthPage() {
  const orgs = await loadOrgHealthScores();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Salud de organizaciones</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Score 0–100 según actividad real en conversaciones, Fathom, SOPs e
          inputs semanales (últimos 30 días).
        </p>
      </div>

      {orgs.length === 0 ? (
        <GlassPanel className="p-8 text-center text-sm text-muted-foreground">
          No hay organizaciones registradas.
        </GlassPanel>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {orgs.map((org) => {
            const meta = STATUS_META[org.status];
            return (
              <GlassPanel key={org.orgId} className="space-y-4 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{org.orgName}</p>
                    <p className="text-xs text-muted-foreground">
                      Score {org.healthScore}/100
                    </p>
                  </div>
                  <Badge variant={meta.variant}>
                    {meta.emoji} {meta.label}
                  </Badge>
                </div>

                <div className="grid gap-2 sm:grid-cols-2">
                  <Indicator
                    ok={org.conversations > 0}
                    label={`Conversaciones (${org.conversations})`}
                  />
                  <Indicator
                    ok={org.fathomCalls > 0}
                    label={`Calls Fathom (${org.fathomCalls})`}
                  />
                  <Indicator
                    ok={org.sops > 0}
                    label={`SOPs activos (${org.sops})`}
                  />
                  <Indicator
                    ok={org.weeklyInputs > 0}
                    label={`Weekly inputs (${org.weeklyInputs})`}
                  />
                </div>

                <Button asChild size="sm" variant="outline">
                  <Link href={paths.superAdmin.organizationDetail(org.orgId)}>
                    Ver organización
                  </Link>
                </Button>
              </GlassPanel>
            );
          })}
        </div>
      )}
    </div>
  );
}
