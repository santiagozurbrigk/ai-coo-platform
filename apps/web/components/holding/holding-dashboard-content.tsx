"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button, MetricCard } from "@ai-coo/ui";
import { Panel } from "@/components/shared/panel";
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
  const [pending, startTransition] = useTransition();
  const { businesses, kpis } = data;

  function enterBusiness(businessOrgId: string) {
    setPendingId(businessOrgId);
    startTransition(() => {
      void enterBusinessAction(businessOrgId);
    });
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-end">
        <Button onClick={() => setModalOpen(true)}>Agregar negocio</Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Negocios activos"
          value={String(kpis.totalBusinesses)}
        />
        <MetricCard title="MRR total portfolio" value={formatUsd(kpis.totalMRR)} />
        <MetricCard
          title="Mi revenue total"
          value={formatUsd(kpis.totalHoldingRevenue)}
        />
        <MetricCard
          title="Conversaciones activas"
          value={String(kpis.totalConversations)}
        />
      </div>

      {businesses.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border/60 p-10 text-center space-y-4">
          <p className="text-sm font-medium">
            Todavía no tenés negocios en tu holding
          </p>
          <p className="text-sm text-muted-foreground">
            Agregá tu primer negocio para empezar a gestionarlo desde acá
          </p>
          <Button onClick={() => setModalOpen(true)}>
            Agregar primer negocio
          </Button>
        </div>
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
                  disabled={!orgId || pending}
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
