"use client";

import Link from "next/link";
import {
  AiCard,
  Badge,
  Button,
  GlassPanel,
} from "@ai-coo/ui";
import { ExternalLink, Star, Upload } from "lucide-react";
import { usePlatformData } from "@/providers";
import { useToast } from "@/providers/toast-provider";
import { ClientTimeline } from "@/components/clients/client-timeline";
import type { Client, ClientStatus } from "@/types/clients";

const STATUS_FLOW: ClientStatus[] = [
  "pending_onboarding",
  "onboarding_done",
  "active",
  "success_case",
];

const STATUS_LABEL: Record<ClientStatus, string> = {
  pending_onboarding: "Realizar onboarding",
  onboarding_done: "Onboarding realizado",
  active: "Activo",
  success_case: "Caso de éxito",
};

export function ClientDetail({ client: initial }: { client: Client }) {
  const { clients, updateClient } = usePlatformData();
  const { push } = useToast();
  const client = clients.find((c) => c.id === initial.id) ?? initial;

  const advanceStatus = async (status: ClientStatus) => {
    try {
      await updateClient(client.id, {
        status,
        isSuccessCase: status === "success_case",
      });
      push({ title: "Estado actualizado", variant: "success" });
    } catch (e) {
      push({
        title: "No se pudo actualizar",
        description: e instanceof Error ? e.message : undefined,
        variant: "default",
      });
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <header className="space-y-2">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold">{client.name}</h1>
          {client.isSuccessCase && (
            <Badge className="gap-1">
              <Star className="h-3 w-3 fill-current" />
              Caso de éxito
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground">Alta: {client.joinDate}</p>
        <Badge variant="secondary">{STATUS_LABEL[client.status]}</Badge>
      </header>

      <GlassPanel className="p-5 space-y-3">
        <label className="text-xs font-medium text-muted-foreground">
          Apodo / identificador interno (opcional)
        </label>
        <input
          className="h-9 w-full max-w-md rounded-lg border border-border/60 bg-muted/20 px-3 text-sm"
          placeholder='Ej. "Mati Argentina", "Pedro coaching"'
          defaultValue={client.nickname ?? ""}
          onBlur={async (e) => {
            const nickname = e.target.value.trim();
            try {
              await updateClient(client.id, {
                nickname: nickname || undefined,
              });
            } catch (err) {
              push({
                title: "No se pudo guardar el apodo",
                description: err instanceof Error ? err.message : undefined,
              });
            }
          }}
        />
        <p className="text-2xs text-muted-foreground">
          Usado para distinguir clientes con el mismo nombre en asociaciones Fathom.
        </p>
      </GlassPanel>

      <GlassPanel className="p-5">
        <p className="text-xs font-medium text-muted-foreground mb-4">
          Flujo de estado
        </p>
        <div className="flex flex-wrap gap-2">
          {STATUS_FLOW.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => advanceStatus(s)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium border transition-colors ${
                  client.status === s
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {STATUS_LABEL[s]}
              </button>
              {i < STATUS_FLOW.length - 1 && (
                <span className="text-muted-foreground">→</span>
              )}
            </div>
          ))}
        </div>
      </GlassPanel>

      <section className="space-y-3">
        <h2 className="text-sm font-medium">Información de pago</h2>
        <GlassPanel className="p-5 text-sm space-y-2">
          <p>
            <span className="text-muted-foreground">Tipo:</span>{" "}
            {client.paymentType}
          </p>
          <p>
            <span className="text-muted-foreground">Plataforma:</span>{" "}
            {client.platform}
          </p>
          <p>
            <span className="text-muted-foreground">Total:</span> $
            {client.totalAmount.toLocaleString()}
          </p>
          {client.installments && (
            <ul className="mt-4 space-y-2 border-t border-border pt-4">
              {client.installments.map((inst) => (
                <li
                  key={inst.id}
                  className="flex flex-wrap items-center justify-between gap-2"
                >
                  <span>
                    {inst.label} — ${inst.amount.toLocaleString()} —{" "}
                    {inst.status === "paid" ? "Pagada ✓" : "Pendiente"}
                    {inst.status === "paid" && inst.paidAt && ` — Cobrada: ${inst.paidAt}`}
                    {inst.status === "pending" && inst.dueDate && ` — Vence: ${inst.dueDate}`}
                  </span>
                  {inst.proofLabel && (
                    <Button size="sm" variant="ghost">
                      Ver comprobante
                    </Button>
                  )}
                  {inst.status === "pending" && (
                    <Button size="sm" variant="outline" className="gap-1">
                      <Upload className="h-3 w-3" />
                      Subir
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </GlassPanel>
      </section>

      {client.salesFathomUrl && (
        <section className="space-y-3">
          <h2 className="text-sm font-medium">Llamada de ventas</h2>
          <GlassPanel className="p-5 space-y-3">
            <div className="aspect-video rounded-lg bg-muted/40 flex items-center justify-center text-xs text-muted-foreground">
              Vista previa Fathom
            </div>
            <Button variant="outline" className="gap-2" asChild>
              <a href={client.salesFathomUrl} target="_blank" rel="noopener noreferrer">
                Abrir llamada de ventas
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </Button>
          </GlassPanel>
        </section>
      )}

      {client.linkedCalls.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-medium">Llamadas del cliente</h2>
          <ul className="space-y-2">
            {client.linkedCalls.map((call) => (
              <li
                key={call.id}
                className="flex items-center justify-between rounded-lg border border-border px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium">{call.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {call.date} · {call.duration}
                  </p>
                </div>
                <Button size="sm" variant="ghost" asChild>
                  <a href={call.url} target="_blank" rel="noopener noreferrer">
                    Abrir en Fathom
                  </a>
                </Button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="space-y-3">
        <h2 className="text-sm font-medium">Timeline</h2>
        <ClientTimeline clientId={client.id} />
      </section>

      <Button
        variant="outline"
        className="gap-2"
        onClick={() => advanceStatus("success_case")}
      >
        <Star className="h-4 w-4" />
        Marcar como caso de éxito
      </Button>

      <div className="space-y-2">
        <h2 className="text-sm font-medium">Insights de IA (mock)</h2>
        {client.aiInsights.map((line, i) => (
          <AiCard key={i} title="" variant="insight">
            {line}
          </AiCard>
        ))}
      </div>
    </div>
  );
}
