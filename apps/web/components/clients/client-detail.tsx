"use client";

/**
 * La ficha del cliente.
 *
 * ⭐ Está armada en tres capas y dos columnas, y el orden no es estético: es el
 * orden de las preguntas que trae quien la abre.
 *
 * 1. **El encabezado** contesta "¿quién es y en qué estado está?": nombre, alta,
 *    producto, apodo y el recorrido de estados. Absorbió tres bloques que antes
 *    eran paneles sueltos (el apodo, el flujo de estado y el botón de caso de
 *    éxito, que era el último paso de ese mismo flujo y existía dos veces).
 * 2. **La franja** contesta "¿cómo viene?" sin scrollear: sesiones, pendientes,
 *    recorrido y satisfacción.
 * 3. **Las dos columnas** separan el trabajo del contexto. A la izquierda lo que
 *    se hace con el cliente —recorrido, sesiones, tareas, historial—; a la
 *    derecha lo que se sabe de él —datos, satisfacción, notas, wins, Discord—.
 *    Antes eran catorce bloques en una sola columna de ancho fijo, con seis
 *    estilos de encabezado distintos, que se leían como una pila y no como una
 *    pantalla.
 *
 * En pantallas angostas las columnas se apilan, trabajo primero.
 */

import { Button } from "@ai-coo/ui";
import { ExternalLink, History, PhoneCall, Sparkles } from "lucide-react";
import { usePlatformData } from "@/providers";
import { useModuleAccess } from "@/providers/permissions-provider";
import { useToast } from "@/providers/toast-provider";
import { ClientHeader } from "@/components/clients/client-header";
import { ClientOverviewStrip } from "@/components/clients/client-overview-strip";
import { FichaCard, FichaSection } from "@/components/clients/ficha-section";
import { ClientLinkedCallsSection } from "@/components/clients/client-linked-calls";
import { ClientOneOnOnesSection } from "@/components/clients/client-one-on-ones";
import { ClientTasksSection } from "@/components/clients/client-tasks-section";
import { ClientCustomFieldsSection } from "@/components/clients/client-custom-fields-section";
import { ClientNotesSection } from "@/components/clients/client-notes-section";
import { ClientSatisfactionSection } from "@/components/clients/client-satisfaction-section";
import { ClientDiscordActivity } from "@/components/clients/client-discord-activity";
import { ClientTimeline } from "@/components/clients/client-timeline";
import { ClientJourneySection } from "@/components/clients/checkpoints";
import { ClientWinsSection } from "@/components/clients/wins";
import type { Client, ClientStatus } from "@/types/clients";

export function ClientDetail({ client: initial }: { client: Client }) {
  const { clients, updateClient } = usePlatformData();
  const { push } = useToast();
  const client = clients.find((c) => c.id === initial.id) ?? initial;
  /** El atajo a Cobros no se ofrece a quien no puede entrar a Ventas. */
  const puedeVerCobros = useModuleAccess("sales") !== "none";

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

  const saveNickname = async (nickname: string) => {
    try {
      await updateClient(client.id, { nickname: nickname || undefined });
    } catch (err) {
      push({
        title: "No se pudo guardar el apodo",
        description: err instanceof Error ? err.message : undefined,
      });
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <ClientHeader
        client={client}
        puedeVerCobros={puedeVerCobros}
        onStatusChange={advanceStatus}
        onNicknameSave={saveNickname}
      />

      <ClientOverviewStrip clientId={client.id} satisfaction={client.satisfaction} />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(280px,340px)] lg:items-start">
        {/* ── El trabajo ─────────────────────────────────────────────── */}
        <div className="min-w-0 space-y-8">
          <ClientJourneySection clientId={client.id} />

          <ClientOneOnOnesSection clientId={client.id} />

          <ClientTasksSection clientId={client.id} />

          <ClientLinkedCallsSection calls={client.linkedCalls} />

          <FichaSection icon={History} title="Historial">
            <ClientTimeline clientId={client.id} />
          </FichaSection>
        </div>

        {/* ── El contexto ────────────────────────────────────────────── */}
        <aside className="min-w-0 space-y-4">
          {/* Primero lo estructurado, después lo que no entra en ningún campo. */}
          <ClientCustomFieldsSection client={client} />

          <ClientSatisfactionSection
            clientId={client.id}
            initialLevel={client.satisfaction ?? null}
            initialUpdatedAt={client.satisfactionUpdatedAt ?? null}
            updatedByName={client.satisfactionUpdatedByName ?? null}
          />

          <ClientNotesSection
            clientId={client.id}
            initialNotes={client.notes ?? null}
            initialUpdatedAt={client.notesUpdatedAt ?? null}
          />

          <ClientWinsSection clientId={client.id} />

          <ClientDiscordActivity clientId={client.id} />

          {/*
            La grabación de la venta es un link, no una "vista previa": el
            recuadro gris que decía «Vista previa Fathom» no previsualizaba nada
            y ocupaba el alto de un video.
          */}
          {client.salesFathomUrl ? (
            <FichaCard icon={PhoneCall} title="Llamada de venta">
              <Button variant="outline" size="sm" className="w-full gap-2" asChild>
                <a href={client.salesFathomUrl} target="_blank" rel="noopener noreferrer">
                  Abrir la grabación en Fathom
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </Button>
            </FichaCard>
          ) : null}

          {client.aiInsights.length > 0 ? (
            <FichaCard icon={Sparkles} title="Contexto del cierre">
              <ul className="space-y-2.5">
                {client.aiInsights.map((line, i) => (
                  <li key={i} className="flex gap-2.5 text-sm leading-relaxed">
                    <Sparkles
                      className="mt-1 h-3.5 w-3.5 shrink-0 text-primary/70"
                      aria-hidden
                    />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </FichaCard>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
