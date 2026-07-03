"use client";

import Link from "next/link";
import {
  Badge,
  Button,
  GlassPanel,
} from "@ai-coo/ui";
import { ArrowLeft, ExternalLink, Sparkles, Star } from "lucide-react";
import { usePlatformData } from "@/providers";
import { useToast } from "@/providers/toast-provider";
import { ClientLinkedCallsSection } from "@/components/clients/client-linked-calls";
import { ClientPaymentsSection } from "@/components/clients/client-payments-section";
import { ClientDiscordActivity } from "@/components/clients/client-discord-activity";
import { ClientTimeline } from "@/components/clients/client-timeline";
import { paths } from "@/routes";
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
        <Button variant="ghost" size="sm" className="gap-2" asChild>
          <Link href={paths.platform.clients.root}>
            <ArrowLeft className="h-4 w-4" />
            Volver a clientes
          </Link>
        </Button>
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
        </GlassPanel>
      </section>

      <ClientPaymentsSection client={client} />

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

      <ClientLinkedCallsSection calls={client.linkedCalls} />

      <ClientDiscordActivity clientId={client.id} />

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

      {client.aiInsights.length > 0 ? (
        <section className="space-y-3">
          <h2 className="text-sm font-medium">Contexto del cierre</h2>
          <GlassPanel className="p-5">
            <ul className="space-y-3">
              {client.aiInsights.map((line, i) => (
                <li key={i} className="flex gap-3 text-sm leading-relaxed">
                  <Sparkles
                    className="mt-0.5 h-4 w-4 shrink-0 text-primary/70"
                    aria-hidden
                  />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </GlassPanel>
        </section>
      ) : null}
    </div>
  );
}
