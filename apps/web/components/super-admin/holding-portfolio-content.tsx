import Link from "next/link";
import { Badge, Button, MetricCard } from "@ai-coo/ui";
import { Panel } from "@/components/shared/panel";
import { formatUsd } from "@/lib/super-admin/org-metrics";
import { mockHoldingPortfolio } from "@/mocks/super-admin-holding";
import { paths } from "@/routes";

const HEALTH_VARIANT = {
  excellent: "success",
  good: "secondary",
  at_risk: "warning",
} as const;

const HEALTH_LABEL = {
  excellent: "Excelente",
  good: "Bueno",
  at_risk: "En riesgo",
} as const;

export function HoldingPortfolioContent() {
  const { holdingName, organizations } = mockHoldingPortfolio;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold">{holdingName}</h2>
        <p className="text-sm text-muted-foreground">
          Vista portfolio — {organizations.length} sub-organizaciones
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard
          title="Revenue combinado"
          value={formatUsd(mockHoldingPortfolio.combinedRevenue)}
        />
        <MetricCard
          title="Usuarios activos"
          value={String(mockHoldingPortfolio.totalActiveUsers)}
        />
        <MetricCard
          title="Integraciones activas"
          value={String(mockHoldingPortfolio.totalIntegrations)}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {organizations.map((org) => (
          <Panel
            key={org.id}
            title={org.name}
            subtitle={`Plan ${org.plan}`}
            contentClassName="space-y-4"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-2xl font-semibold tabular-nums">
                {formatUsd(org.mrrUsd)}
              </span>
              <Badge variant={HEALTH_VARIANT[org.healthLabel]}>
                {HEALTH_LABEL[org.healthLabel]} · {org.healthScore}
              </Badge>
            </div>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-xs text-muted-foreground">Usuarios</dt>
                <dd className="font-medium tabular-nums">{org.activeUsers}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Integraciones</dt>
                <dd className="font-medium tabular-nums">
                  {org.activeIntegrations}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Health score</dt>
                <dd className="font-medium tabular-nums">{org.healthScore}/100</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">MRR</dt>
                <dd className="font-medium">{formatUsd(org.mrrUsd)}/mes</dd>
              </div>
            </dl>
            <Button asChild size="sm" variant="outline" className="w-full">
              <Link href={paths.superAdmin.organizationDetail(org.id)}>
                Ver organización
              </Link>
            </Button>
          </Panel>
        ))}
      </div>

      <p className="text-xs text-muted-foreground">
        {/* TODO: Phase 2 — tabla holding_organizations + rol holding_admin */}
        Mock de arquitectura multi-tenant holding. Métricas agregadas en Phase 2.
      </p>
    </div>
  );
}
