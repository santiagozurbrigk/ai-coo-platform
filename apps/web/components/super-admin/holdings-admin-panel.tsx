"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
} from "@ai-coo/ui";
import { paths } from "@/routes";
import { formatUsd } from "@/lib/super-admin/org-metrics";
import type {
  AdminHoldingRow,
  AvailableBusinessOrg,
} from "@/lib/super-admin/holdings-admin";
import {
  addBusinessToHoldingAction,
  createHoldingOrgAction,
} from "@/app/super-admin/actions";

function CreateHoldingDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await createHoldingOrgAction({ name, founderEmail: email });
      if (!res.success) {
        setError(res.error);
        return;
      }
      setOpen(false);
      setName("");
      setEmail("");
    });
  }

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        Nuevo holding
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Nuevo holding</DialogTitle>
          </DialogHeader>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="holding-name">Nombre del holding</Label>
              <Input
                id="holding-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="holding-email">Email del dueño</Label>
              <Input
                id="holding-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" disabled={pending} className="w-full">
              {pending ? "Creando…" : "Crear holding"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

function AddBusinessDialog({
  holding,
  availableOrgs,
}: {
  holding: AdminHoldingRow;
  availableOrgs: AvailableBusinessOrg[];
}) {
  const [open, setOpen] = useState(false);
  const [businessOrgId, setBusinessOrgId] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [revenueSharePct, setRevenueSharePct] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await addBusinessToHoldingAction({
        holdingOrgId: holding.id,
        businessOrgId,
        businessName: businessName.trim() || undefined,
        revenueSharePct: revenueSharePct
          ? Number(revenueSharePct)
          : undefined,
      });
      if (!res.success) {
        setError(res.error);
        return;
      }
      setOpen(false);
      setBusinessOrgId("");
      setBusinessName("");
      setRevenueSharePct("");
    });
  }

  return (
    <>
      <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
        Agregar negocio
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Agregar negocio a {holding.name}</DialogTitle>
          </DialogHeader>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="business-org">Organización</Label>
              <select
                id="business-org"
                value={businessOrgId}
                onChange={(e) => setBusinessOrgId(e.target.value)}
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Seleccionar…</option>
                {availableOrgs.map((org) => (
                  <option key={org.id} value={org.id}>
                    {org.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="business-label">Nombre visible (opcional)</Label>
              <Input
                id="business-label"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="revenue-share">% revenue share</Label>
              <Input
                id="revenue-share"
                type="number"
                min={0}
                max={100}
                step={0.01}
                value={revenueSharePct}
                onChange={(e) => setRevenueSharePct(e.target.value)}
                placeholder="ej. 20"
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" disabled={pending} className="w-full">
              {pending ? "Vinculando…" : "Vincular"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function HoldingsAdminPanel({
  holdings,
  availableOrgs,
}: {
  holdings: AdminHoldingRow[];
  availableOrgs: AvailableBusinessOrg[];
}) {
  const [detailId, setDetailId] = useState<string | null>(null);
  const detail = holdings.find((h) => h.id === detailId);

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <CreateHoldingDialog />
      </div>

      {holdings.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No hay holdings creados. Creá uno para vincular múltiples negocios.
        </p>
      ) : (
        <div className="space-y-4">
          {holdings.map((holding) => (
            <div
              key={holding.id}
              className="rounded-xl border border-border/60 p-5 space-y-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold">{holding.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {holding.founderName ?? "—"} · {holding.founderEmail ?? "—"}
                  </p>
                </div>
                <Badge variant="secondary">
                  {holding.businesses.length} negocios
                </Badge>
              </div>

              <p className="text-sm">
                MRR total del portfolio:{" "}
                <span className="font-medium">
                  {formatUsd(holding.portfolioMrr)}
                </span>
              </p>

              {holding.businesses.length > 0 && (
                <ul className="text-sm text-muted-foreground space-y-1">
                  {holding.businesses.map((b) => (
                    <li key={b.id}>
                      · {b.business_name ?? b.business_org?.name ?? "Negocio"}
                      {b.revenue_share_pct != null &&
                        ` (${b.revenue_share_pct}%)`}
                    </li>
                  ))}
                </ul>
              )}

              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setDetailId(holding.id)}
                >
                  Ver portfolio
                </Button>
                <AddBusinessDialog
                  holding={holding}
                  availableOrgs={availableOrgs}
                />
                <Button asChild size="sm" variant="ghost">
                  <Link href={paths.superAdmin.organizationDetail(holding.id)}>
                    Ver detalle
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={Boolean(detail)} onOpenChange={() => setDetailId(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{detail?.name} — Portfolio</DialogTitle>
          </DialogHeader>
          {detail && (
            <div className="space-y-3 text-sm">
              <p>
                MRR combinado:{" "}
                <strong>{formatUsd(detail.portfolioMrr)}</strong>
              </p>
              <ul className="space-y-2">
                {detail.businesses.map((b) => (
                  <li
                    key={b.id}
                    className="rounded-lg border border-border/50 p-3"
                  >
                    <p className="font-medium">
                      {b.business_name ?? b.business_org?.name}
                    </p>
                    <p className="text-muted-foreground">
                      Revenue share: {b.revenue_share_pct ?? 0}%
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
