"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Building2, Settings } from "lucide-react";
import {
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  MetricBand,
  MetricStat,
  cn,
} from "@ai-coo/ui";
import { Panel } from "@/components/shared/panel";
import { EmptyState } from "@/components/shared/empty-state";
import { formatUsd } from "@/lib/super-admin/org-metrics";
import { formatFixedFee, type HoldingBillingModel } from "@/lib/holding/billing";
import {
  enterBusinessAction,
  regenerateBusinessFounderTempPasswordAction,
  updateHoldingBillingModelAction,
} from "@/app/(platform)/holding/actions";
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

function billingModelLabel(model: HoldingBillingModel | null): string {
  if (model === "fixed_fee") return "Tarifa fija";
  if (model === "revenue_share") return "Porcentaje del revenue";
  return "Sin configurar";
}

function BillingOptionCard({
  title,
  description,
  selected,
  onClick,
}: {
  title: string;
  description: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full rounded-xl border p-4 text-left transition-all",
        selected
          ? "border-primary bg-primary/10"
          : "border-border/60 bg-muted/10 hover:border-primary/40"
      )}
    >
      <p className="font-medium text-sm">{title}</p>
      <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
    </button>
  );
}

function BillingModelDialog({
  open,
  current,
  onOpenChange,
  onSaved,
}: {
  open: boolean;
  current: HoldingBillingModel | null;
  onOpenChange: (v: boolean) => void;
  onSaved: (model: HoldingBillingModel) => void;
}) {
  const [selected, setSelected] = useState<HoldingBillingModel | null>(current);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSave() {
    if (!selected) {
      setError("Seleccioná un modelo");
      return;
    }
    if (selected === current) {
      onOpenChange(false);
      return;
    }
    setError(null);
    startTransition(async () => {
      const res = await updateHoldingBillingModelAction(selected);
      if (!res.success) {
        setError(res.error);
        return;
      }
      onSaved(res.data.billingModel);
      onOpenChange(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Modelo de cobro del holding</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 pt-1">
          <BillingOptionCard
            title="Porcentaje del revenue"
            description="Cobro un % de lo que factura cada negocio"
            selected={selected === "revenue_share"}
            onClick={() => setSelected("revenue_share")}
          />
          <BillingOptionCard
            title="Tarifa fija"
            description="Cobro un monto fijo mensual por negocio"
            selected={selected === "fixed_fee"}
            onClick={() => setSelected("fixed_fee")}
          />
          <p className="text-xs text-muted-foreground">
            Cambiar el modelo actualiza cómo se calcula tu revenue. Los % y
            montos configurados en cada negocio no se borran.
          </p>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button
            className="w-full"
            disabled={pending || !selected}
            onClick={handleSave}
          >
            {pending ? "Guardando…" : "Guardar"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function HoldingDashboardContent({ data }: { data: HoldingDashboardData }) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [billingDialogOpen, setBillingDialogOpen] = useState(false);
  const [billingModel, setBillingModel] = useState(data.billingModel);
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
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Modelo de cobro:</span>
          <Badge variant="secondary">{billingModelLabel(billingModel)}</Badge>
          <button
            type="button"
            onClick={() => setBillingDialogOpen(true)}
            className="ml-1 rounded p-0.5 text-muted-foreground hover:text-foreground transition-colors"
            title="Cambiar modelo de cobro"
          >
            <Settings className="h-3.5 w-3.5" />
          </button>
        </div>
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
                subtitle={businessSubtitle({ ...data, billingModel } as HoldingDashboardData, b)}
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
                      {holdingRevenueLabel({ ...data, billingModel } as HoldingDashboardData, b)}
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
                {orgId && b.hasFounder ? (
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

      <BillingModelDialog
        open={billingDialogOpen}
        current={billingModel}
        onOpenChange={setBillingDialogOpen}
        onSaved={(model) => {
          setBillingModel(model);
          router.refresh();
        }}
      />

      <AddBusinessModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        billingModel={billingModel}
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
