"use client";

import { useState, useTransition } from "react";
import { Button, MetricCard } from "@ai-coo/ui";
import { Panel } from "@/components/shared/panel";
import { formatUsd } from "@/lib/super-admin/org-metrics";
import { switchActiveBusinessAction } from "@/app/(platform)/holding/actions";
import type { getHoldingDashboardAction } from "@/app/(platform)/holding/actions";

type HoldingDashboardData = Awaited<
  ReturnType<typeof getHoldingDashboardAction>
>;

export function HoldingDashboardContent({ data }: { data: HoldingDashboardData }) {
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const { businesses, kpis } = data;

  function manageBusiness(businessOrgId: string) {
    setPendingId(businessOrgId);
    startTransition(() => {
      void switchActiveBusinessAction(businessOrgId);
    });
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Portfolio de negocios
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Vista consolidada de todos tus negocios
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Negocios activos"
          value={String(kpis.totalBusinesses)}
        />
        <MetricCard title="MRR total" value={formatUsd(kpis.totalMRR)} />
        <MetricCard
          title="Tu revenue (% del MRR)"
          value={formatUsd(kpis.totalHoldingRevenue)}
        />
        <MetricCard
          title="Conversaciones activas"
          value={String(kpis.totalConversations)}
        />
      </div>

      {businesses.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Todavía no hay negocios vinculados a este holding. Contactá a OTC
          para agregar organizaciones.
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {businesses.map((b) => {
            const orgId = b.business_org?.id;
            const name = b.business_name ?? b.business_org?.name ?? "Negocio";
            const share = b.revenue_share_pct
              ? `${b.revenue_share_pct}%`
              : "—";

            return (
              <Panel
                key={b.id}
                title={name}
                subtitle={
                  b.business_org?.industry
                    ? `${b.business_org.industry} · ${share} revenue share`
                    : `Revenue share: ${share}`
                }
                contentClassName="space-y-4"
              >
                <dl className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <dt className="text-xs text-muted-foreground">MRR</dt>
                    <dd className="font-medium tabular-nums">
                      {formatUsd(b.metrics.mrr)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">
                      Tu revenue
                    </dt>
                    <dd className="font-medium tabular-nums">
                      {formatUsd(b.metrics.holdingRevenue)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">
                      Conversaciones (30d)
                    </dt>
                    <dd className="font-medium tabular-nums">
                      {b.metrics.activeConversations}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">
                      Llamadas cerradas
                    </dt>
                    <dd className="font-medium tabular-nums">
                      {b.metrics.closedCalls}
                    </dd>
                  </div>
                </dl>
                <Button
                  size="sm"
                  className="w-full"
                  disabled={!orgId || pending}
                  onClick={() => orgId && manageBusiness(orgId)}
                >
                  {pending && pendingId === orgId ? "Abriendo…" : "Gestionar"}
                </Button>
              </Panel>
            );
          })}
        </div>
      )}
    </div>
  );
}
