"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Building2 } from "lucide-react";
import { Button, MetricBand, MetricStat } from "@ai-coo/ui";
import { Panel } from "@/components/shared/panel";
import { EmptyState } from "@/components/shared/empty-state";
import { formatUsd } from "@/lib/super-admin/org-metrics";
import { formatFixedFee } from "@/lib/holding/billing";
import { enterBusinessAction, regenerateBusinessFounderTempPasswordAction } from "@/app/(platform)/holding/actions";
import type { getHoldingDashboardAction } from "@/app/(platform)/holding/actions";
import { AddBusinessModal } from "@/components/holding/add-business-modal";
import { TempCredentialsDialog } from "@/components/shared/temp-credentials-dialog";
import type { TempCredentials } from "@/lib/auth/temp-credentials";

type HoldingDashboardData = Awaited<
  ReturnType<typeof getHoldingDashboardAction>
>;

function businessSubtitle(
  data: HoldingDashboardData,
  business: HoldingDashboardData["businesses"][number]
): string {
  const name = business.business_name ?? business.business_org?.name ?? "Negocio";
  void name;

  if (data.billingModel === "fixed_fee") {
    const fee = formatFixedFee(
      Number(business.fixed_fee_amount ?? 0),
      business.fixed_fee_currency
    );
    return `Tarifa fija: ${fee}`;
  }

  const share = business.revenue_share_pct
    ? `${business.revenue_share_pct}%`
    : "—";
  return business.business_org?.industry
    ? `${business.business_org.industry} · ${share} revenue share`
    : `Revenue share: ${share}`;
}

function holdingRevenueLabel(
  data: HoldingDashboardData,
  business: HoldingDashboardData["businesses"][number]
): string {
  if (data.billingModel === "fixed_fee") {
    return formatFixedFee(
      business.metrics.holdingRevenue,
      business.fixed_fee_currency
    );
  }

  const share = business.revenue_share_pct ?? 0;
  return `${formatUsd(business.metrics.holdingRevenue)} (${share}% de ${formatUsd(business.metrics.mrr)} MRR)`;
}

export function HoldingDashboardContent({ data }: { data: HoldingDashboardData }) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [regeneratingOrgId, setRegeneratingOrgId] = useState<string | null>(null);
  const [tempCredentials, setTempCredentials] = useState<TempCredentials | null>(
    null
  );
  const [enterError, setEnterError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const { businesses, kpis } = data;

  function enterBusiness(businessOrgId: string) {
    setPendingId(businessOrgId);
    setEnterError(null);
    startTransition(async () => {
      try {
        await enterBusinessAction(businessOrgId);
      } catch (e) {
        setEnterError(
          e instanceof Error ? e.message : "No se pudo entrar al negocio"
        );
        setPendingId(null);
      }
    });
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-end">
        <Button onClick={() => setModalOpen(true)}>Agregar negocio</Button>
      </div>

      <MetricBand>
        <MetricStat
          title="Negocios activos"
          value={String(kpis.totalBusinesses)}
        />
        <MetricStat
          title="MRR total portfolio"
          value={formatUsd(kpis.totalMRR)}
        />
        <MetricStat
          title="Mi revenue total"
          value={formatUsd(kpis.totalHoldingRevenue)}
        />
        <MetricStat
          title="Conversaciones activas"
          value={String(kpis.totalConversations)}
        />
      </MetricBand>

      {businesses.length === 0 ? (
        <EmptyState
          variant="inline"
          icon={<Building2 className="h-5 w-5" />}
          title="Todavía no tenés negocios en tu holding"
          description="Agregá tu primer negocio para empezar a gestionarlo desde acá"
          action={
            <Button onClick={() => setModalOpen(true)}>
              Agregar primer negocio
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {businesses.map((b) => {
            const orgId = b.business_org?.id;
            const name = b.business_name ?? b.business_org?.name ?? "Negocio";

            return (
              <Panel
                key={b.id}
                title={name}
                subtitle={businessSubtitle(data, b)}
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
                      Mi revenue
                    </dt>
                    <dd className="font-medium tabular-nums text-xs sm:text-sm">
                      {holdingRevenueLabel(data, b)}
                    </dd>
                  </div>
                  <div className="col-span-2">
                    <dt className="text-xs text-muted-foreground">
                      Conversaciones activas (30d)
                    </dt>
                    <dd className="font-medium tabular-nums">
                      {b.metrics.activeConversations}
                    </dd>
                  </div>
                </dl>
                <Button
                  size="sm"
                  className="w-full"
                  disabled={!orgId || (pending && pendingId === orgId)}
                  onClick={() => orgId && enterBusiness(orgId)}
                >
                  {pending && pendingId === orgId
                    ? "Entrando…"
                    : "Entrar al negocio"}
                </Button>
                {orgId ? (
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full"
                    disabled={regeneratingOrgId === orgId}
                    onClick={async () => {
                      setRegeneratingOrgId(orgId);
                      const res =
                        await regenerateBusinessFounderTempPasswordAction(orgId);
                      setRegeneratingOrgId(null);
                      if (res.success) {
                        setTempCredentials(res.data);
                      }
                    }}
                  >
                    {regeneratingOrgId === orgId
                      ? "Regenerando…"
                      : "Regenerar contraseña del founder"}
                  </Button>
                ) : null}
              </Panel>
            );
          })}
        </div>
      )}

      {enterError && (
        <p className="text-sm text-destructive">{enterError}</p>
      )}

      <AddBusinessModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        billingModel={data.billingModel}
        onSuccess={() => router.refresh()}
      />

      {tempCredentials ? (
        <TempCredentialsDialog
          open
          email={tempCredentials.email}
          tempPassword={tempCredentials.tempPassword}
          onClose={() => setTempCredentials(null)}
        />
      ) : null}
    </div>
  );
}
