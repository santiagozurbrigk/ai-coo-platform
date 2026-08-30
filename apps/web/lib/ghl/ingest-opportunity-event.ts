/**
 * lib/ghl/ingest-opportunity-event.ts
 *
 * Recibe un webhook de oportunidad ya verificado, lo persiste crudo y recién
 * después lo interpreta.
 *
 * El orden es el mismo que en `lib/payments/ingest.ts` y por la misma razón: la
 * documentación de GHL no expande el objeto `opportunity`, así que el payload
 * real es lo único que permite corregir el mapeo. Si el mapeo falla hoy, el
 * evento queda como `unmapped` y se puede reprocesar mañana.
 *
 * Sólo servidor: usa el service role.
 */

import { createAdminClient } from "@/lib/supabase/admin";
import {
  extractGHLEventId,
  extractGHLEventType,
  normalizeOpportunityEvent,
} from "./opportunity-event";
import { deriveTransition, type KnownOpportunityState } from "./stage-transition";
import type { GHLAuthPath } from "./verify-webhook";

export type GHLIngestResult = {
  stored: boolean;
  status: "processed" | "unmapped" | "duplicate" | "error";
  /** `true` si el evento generó una fila en `ghl_stage_transitions`. */
  transitionRecorded?: boolean;
  detail?: string;
};

export async function ingestGHLOpportunityEvent(
  organizationId: string,
  body: Record<string, unknown>,
  authPath: GHLAuthPath,
  receivedAt: string = new Date().toISOString()
): Promise<GHLIngestResult> {
  const admin = createAdminClient();

  // 1) Guardar crudo. El índice único sobre external_event_id descarta
  //    reentregas: GHL reintenta y el orden no está garantizado.
  const { data: stored, error: storeError } = await admin
    .from("ghl_webhook_events")
    .insert({
      organization_id: organizationId,
      event_type: extractGHLEventType(body),
      external_event_id: extractGHLEventId(body),
      auth_path: authPath,
      payload: body,
    })
    .select("id")
    .maybeSingle();

  if (storeError) {
    if (storeError.code === "23505") return { stored: false, status: "duplicate" };
    console.error("[ghl] no se pudo guardar el evento", storeError.message);
    return { stored: false, status: "error", detail: storeError.message };
  }

  const eventRowId = stored?.id as string | undefined;

  const finish = async (status: string, errorMessage?: string) => {
    if (!eventRowId) return;
    await admin
      .from("ghl_webhook_events")
      .update({
        status,
        error_message: errorMessage ?? null,
        processed_at: new Date().toISOString(),
      })
      .eq("id", eventRowId);
  };

  // 2) Recién ahora, interpretar.
  const normalized = normalizeOpportunityEvent(body);
  if (normalized.kind === "unmapped") {
    await finish("unmapped", normalized.reason);
    return { stored: true, status: "unmapped", detail: normalized.reason };
  }

  const event = normalized.event;

  try {
    // 3) Última etapa conocida — es contra esto que se deriva la transición,
    //    porque el webhook no trae la etapa anterior.
    const { data: existing } = await admin
      .from("ghl_opportunities")
      .select("stage_external_id, status")
      .eq("organization_id", organizationId)
      .eq("external_id", event.opportunityId)
      .maybeSingle();

    const previous: KnownOpportunityState | null = existing
      ? {
          stageId: (existing.stage_external_id as string | null) ?? null,
          status: (existing.status as string | null) ?? null,
        }
      : null;

    const transition = deriveTransition(previous, event, receivedAt);

    if (transition) {
      const { error: transitionError } = await admin.from("ghl_stage_transitions").insert({
        organization_id: organizationId,
        opportunity_external_id: transition.opportunityId,
        pipeline_external_id: transition.pipelineId,
        from_stage_external_id: transition.fromStageId,
        to_stage_external_id: transition.toStageId,
        kind: transition.kind,
        status: transition.status,
        occurred_at: transition.occurredAt,
        external_event_id: transition.eventId,
      });

      // 23505: el mismo evento ya había dejado su transición. No es un error.
      if (transitionError && transitionError.code !== "23505") {
        throw new Error(transitionError.message);
      }
    }

    // 4) Estado actual. Una baja se marca, no se borra: las transiciones que ya
    //    ocurrieron siguen siendo ciertas y siguen contando en su período.
    const { error: upsertError } = await admin.from("ghl_opportunities").upsert(
      {
        organization_id: organizationId,
        external_id: event.opportunityId,
        location_id: event.locationId,
        contact_id: event.contactId,
        pipeline_external_id: event.pipelineId,
        stage_external_id: event.stageId,
        status: event.isDelete ? "deleted" : event.status,
        name: event.name,
        source: event.source,
        monetary_value: event.monetaryValue,
        date_added: event.dateAdded,
        last_stage_change_at: transition ? transition.occurredAt : undefined,
        raw: body,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "organization_id,external_id" }
    );
    if (upsertError) throw new Error(upsertError.message);

    // 5) Marcar el borde del período ciego la primera vez.
    //
    //    A partir de acá los conteos por etapa son válidos; antes, no. Se
    //    escribe una sola vez y nunca se mueve hacia adelante: correrlo
    //    invalidaría historial ya observado.
    await admin
      .from("ghl_integrations")
      .update({ stage_history_since: receivedAt })
      .eq("organization_id", organizationId)
      .is("stage_history_since", null);

    await finish("processed");
    return { stored: true, status: "processed", transitionRecorded: transition !== null };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error desconocido";
    await finish("error", message);
    return { stored: true, status: "error", detail: message };
  }
}

/**
 * Resuelve la organización dueña de un evento a partir del `locationId` del
 * payload.
 *
 * Hace falta para la vía de app del Marketplace, donde el evento no puede traer
 * el `organizationId` en la URL: la URL la configura OTC una sola vez para todas
 * las sub-cuentas instaladas.
 */
export async function resolveOrganizationByLocation(
  locationId: string
): Promise<string | null> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("ghl_integrations")
    .select("organization_id")
    .eq("location_id", locationId)
    .maybeSingle();

  if (error || !data) return null;
  return data.organization_id as string;
}
