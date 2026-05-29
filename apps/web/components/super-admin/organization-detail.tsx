"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Badge, Button, Input, Sparkline, Textarea } from "@ai-coo/ui";
import { paths } from "@/routes";
import {
  addOrganizationNoteAction,
  setOrganizationStatusAction,
  updateOrganizationMrrAction,
} from "@/app/super-admin/actions";
import { formatUsd, formatUsdPrecise } from "@/lib/super-admin/org-metrics";
import type { ClientHealthTimelineItem } from "@/lib/super-admin/client-health";
import type { AdminOrganizationDetail } from "@/types/super-admin";
import { OrgClientHealthSection } from "@/components/super-admin/org-client-health-section";

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("es", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function onboardingField(data: Record<string, unknown> | null, key: string): string {
  if (!data) return "—";
  const v = data[key];
  if (v == null) return "—";
  if (Array.isArray(v)) return v.join(", ");
  return String(v);
}

export function OrganizationDetailView({
  detail,
  clientHealth = [],
}: {
  detail: AdminOrganizationDetail;
  clientHealth?: ClientHealthTimelineItem[];
}) {
  const [note, setNote] = useState("");
  const [mrrInput, setMrrInput] = useState(String(detail.mrrUsd));
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  const tokenSpark = detail.tokenUsage.daily.map((d) => d.costUsd);

  function runAction(fn: () => Promise<{ success: boolean; error?: string }>) {
    startTransition(async () => {
      const res = await fn();
      setMessage(res.success ? null : res.error ?? "Error");
    });
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">{detail.name}</h2>
          <p className="text-sm text-muted-foreground">{detail.founder.email}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Badge variant={detail.status === "active" ? "success" : "secondary"}>
              {detail.status === "active" ? "Activa" : "Inactiva"}
            </Badge>
            <span className="text-xs text-muted-foreground">
              Inicio: {formatDate(detail.createdAt)}
            </span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            disabled={pending}
            onClick={() =>
              runAction(() =>
                setOrganizationStatusAction(
                  detail.id,
                  detail.status !== "active"
                )
              )
            }
          >
            {detail.status === "active"
              ? "Desactivar organización"
              : "Activar organización"}
          </Button>
        </div>
      </div>

      {message && (
        <p className="text-sm text-destructive" role="alert">
          {message}
        </p>
      )}

      <section className="rounded-xl border border-border/60 p-6">
        <h3 className="text-sm font-semibold">Resumen del negocio</h3>
        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <dt className="text-xs text-muted-foreground">Tipo de negocio</dt>
            <dd className="text-sm">
              {onboardingField(detail.onboarding, "businessType")}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Rango de revenue</dt>
            <dd className="text-sm">
              {onboardingField(detail.onboarding, "revenueRange")}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Tamaño del equipo</dt>
            <dd className="text-sm">
              {onboardingField(detail.onboarding, "teamSize")}
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-xs text-muted-foreground">Desafíos</dt>
            <dd className="text-sm">
              {onboardingField(detail.onboarding, "challenges")}
            </dd>
          </div>
        </dl>
      </section>

      <section className="rounded-xl border border-border/60 p-6">
        <h3 className="text-sm font-semibold">Métricas del mes</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Metric label="Conversaciones" value={String(detail.metrics.conversationsThisMonth)} />
          <Metric label="Deals cerrados" value={String(detail.metrics.dealsClosedThisMonth)} />
          <Metric
            label="Facturación"
            value={formatUsd(detail.metrics.billingThisMonth)}
          />
          <Metric
            label="Cash collected"
            value={formatUsd(detail.metrics.cashCollectedThisMonth)}
          />
        </div>
      </section>

      <section className="rounded-xl border border-border/60 p-6">
        <h3 className="text-sm font-semibold">MRR (USD)</h3>
        <div className="mt-3 flex max-w-xs flex-wrap gap-2">
          <Input
            type="number"
            min={0}
            step={0.01}
            value={mrrInput}
            onChange={(e) => setMrrInput(e.target.value)}
          />
          <Button
            size="sm"
            disabled={pending}
            onClick={() =>
              runAction(() =>
                updateOrganizationMrrAction(
                  detail.id,
                  Number.parseFloat(mrrInput) || 0
                )
              )
            }
          >
            Guardar MRR
          </Button>
        </div>
      </section>

      <section className="rounded-xl border border-border/60 p-6">
        <h3 className="text-sm font-semibold">Integraciones activas</h3>
        <ul className="mt-4 space-y-2">
          {detail.integrations.map((i) => (
            <li
              key={i.id}
              className="flex items-center justify-between rounded-lg bg-muted/30 px-3 py-2 text-sm"
            >
              <span>{i.name}</span>
              <Badge variant={i.connected ? "success" : "secondary"}>
                {i.connected ? "Conectado" : i.detail ?? "No conectado"}
              </Badge>
            </li>
          ))}
        </ul>
      </section>

      <OrgClientHealthSection orgName={detail.name} clients={clientHealth} />

      <section className="rounded-xl border border-border/60 p-6">
        <h3 className="text-sm font-semibold">Notas internas</h3>
        <div className="mt-4 space-y-3">
          {detail.notes.length === 0 && (
            <p className="text-sm text-muted-foreground">Sin notas aún.</p>
          )}
          {detail.notes.map((n) => (
            <div
              key={n.id}
              className="rounded-lg border border-border/40 bg-muted/20 p-3 text-sm"
            >
              <p>{n.note}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                {n.created_by ?? "—"} · {formatDate(n.created_at)}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-4 space-y-2">
          <Textarea
            placeholder="Nueva nota…"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
          />
          <Button
            size="sm"
            disabled={pending || !note.trim()}
            onClick={() => {
              runAction(async () => {
                const res = await addOrganizationNoteAction(detail.id, note);
                if (res.success) setNote("");
                return res;
              });
            }}
          >
            Agregar nota
          </Button>
        </div>
      </section>

      <section className="rounded-xl border border-border/60 p-6">
        <h3 className="text-sm font-semibold">Token usage (30 días)</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Costo del mes: {formatUsdPrecise(detail.tokenUsage.costMonthUsd)}
        </p>
        {tokenSpark.length > 0 && (
          <div className="mt-4 h-16 w-full max-w-md">
            <Sparkline data={tokenSpark} color="hsl(var(--primary))" />
          </div>
        )}
      </section>

      <Button asChild variant="outline" size="sm">
        <Link href={paths.superAdmin.organizations}>← Volver al listado</Link>
      </Button>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-muted/20 px-3 py-2">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-lg font-semibold tabular-nums">{value}</p>
    </div>
  );
}
