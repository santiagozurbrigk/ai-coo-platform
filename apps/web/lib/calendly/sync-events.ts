import {
  isMissingTableError,
} from "@/lib/auth/bootstrap";
import { repairClosingConversationLinks } from "@/lib/conversations/repair-links";
import { attributeBookingToUTM } from "@/lib/utm/attribute-booking";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { CalendlyEventSyncPayload } from "@/types/calendly";
import type { ClosingCallStatus } from "@/types/closing";
import { syncMayOverwriteStatus } from "@/lib/closing/call-status";
import { resolveLeadId } from "@/lib/sales/resolve-lead";

type ExistingClosingCallRow = {
  id: string;
  status: ClosingCallStatus;
  status_source: string | null;
  calendly_event_id: string | null;
};

function mapSyncError(msg: string): string {
  if (isMissingTableError(msg)) {
    return "Faltan tablas/migraciones necesarias para Calendly (incluye supabase/migrations/20260521600000_calendly_sync_closing_calls.sql).";
  }
  return msg;
}

/**
 * Sync idempotente (incremental) de eventos de Calendly → `closing_calls`.
 *
 * ⭐ No pisa el estado que cargó una persona. Antes sólo respetaba `closed`, así
 * que un `not_closed` o un `no_show` marcado por un closer volvía a `scheduled`
 * en la siguiente corrida del cron — cada hora.
 * Sin "use server": importable desde route handlers y cron sin colisión con Server Actions.
 */
export async function syncCalendlyEventsForOrganization(
  supabase: SupabaseClient,
  organizationId: string,
  events: CalendlyEventSyncPayload[]
): Promise<{
  inserted: number;
  updated: number;
  /** Turnos cuyo estado no se tocó porque lo había cargado una persona. */
  skippedManualStatus: number;
}> {
  const normalized = events
    .map((e) => ({
      eventId: e.eventId?.trim(),
      startTime: e.startTime,
      inviteeName: e.inviteeName?.trim(),
      inviteeEmail: e.inviteeEmail,
      url: e.url,
      questionsAndAnswers: e.questionsAndAnswers ?? [],
      statusHint: e.statusHint,
    }))
    .filter((e) => e.eventId && e.inviteeName && e.startTime);

  if (!normalized.length) {
    return { inserted: 0, updated: 0, skippedManualStatus: 0 };
  }

  const uniqueEventIds = Array.from(new Set(normalized.map((e) => e.eventId)));

  const { data: existing, error: existingError } = await supabase
    .from("closing_calls")
    .select("id, status, status_source, calendly_event_id")
    .eq("organization_id", organizationId)
    .in("calendly_event_id", uniqueEventIds);

  if (existingError) {
    throw new Error(mapSyncError(existingError.message));
  }

  const existingRows = (existing ?? []) as ExistingClosingCallRow[];
  const byEventId = new Map<string, ExistingClosingCallRow>();
  for (const row of existingRows) {
    if (row.calendly_event_id) byEventId.set(row.calendly_event_id, row);
  }

  const toInsert = normalized.filter((e) => !byEventId.has(e.eventId));
  const toUpdate = normalized.filter((e) => byEventId.has(e.eventId));
  let skippedManualStatus = 0;

  // Identidad del lead, resuelta antes de escribir para que el turno nazca ya
  // enganchado a su hilo. En Calendly la única identidad estable es el mail:
  // los turnos sin mail quedan sueltos hasta que un sync se los complete.
  const leadIds = new Map<string, string | null>();
  for (const e of [...toInsert, ...toUpdate]) {
    if (leadIds.has(e.eventId)) continue;
    leadIds.set(
      e.eventId,
      await resolveLeadId(supabase, organizationId, {
        name: e.inviteeName!,
        email: e.inviteeEmail ?? null,
      })
    );
  }

  const toInsertRows = toInsert.map((e) => ({
    organization_id: organizationId,
    calendly_event_id: e.eventId,
    calendly_url: e.url ?? null,
    lead_name: e.inviteeName,
    lead_email: e.inviteeEmail?.trim() || null,
    lead_id: leadIds.get(e.eventId) ?? null,
    scheduled_at: e.startTime,
    status: e.statusHint ?? "scheduled",
    // Calendly informa la cancelación en el propio evento pero no siempre su
    // autor. `unknown` es el valor honesto hasta que se lea `canceled_by`.
    cancelled_by: e.statusHint === "cancelled" ? "unknown" : null,
    form_answers: e.questionsAndAnswers,
    conversation_id: null,
  }));

  if (toInsertRows.length) {
    const { data: insertedRows, error: insertError } = await supabase
      .from("closing_calls")
      .insert(toInsertRows)
      .select("id, calendly_event_id, lead_name");
    if (insertError) {
      throw new Error(mapSyncError(insertError.message));
    }

    for (const row of insertedRows ?? []) {
      const event = toInsert.find((e) => e.eventId === row.calendly_event_id);
      await attributeBookingToUTM({
        organizationId,
        closingCallId: row.id,
        leadName: row.lead_name ?? event?.inviteeName,
        leadEmail: event?.inviteeEmail,
      }).catch((err) => {
        console.error("[Calendly] Error en atribución UTM:", err);
      });
    }
  }

  for (const e of toUpdate) {
    const row = byEventId.get(e.eventId);
    if (!row) continue;

    // Los datos del turno se refrescan siempre —ahí Calendly manda—. Lo único
    // que se protege es el estado, porque es lo que carga una persona.
    const patch: Record<string, unknown> = {
      calendly_url: e.url ?? null,
      lead_name: e.inviteeName,
      lead_email: e.inviteeEmail?.trim() || null,
      lead_id: leadIds.get(e.eventId) ?? null,
      scheduled_at: e.startTime,
      form_answers: e.questionsAndAnswers,
      updated_at: new Date().toISOString(),
    };

    if (syncMayOverwriteStatus({ status: row.status, statusSource: row.status_source })) {
      const next = e.statusHint ?? "scheduled";
      patch.status = next;
      patch.cancelled_by = next === "cancelled" ? "unknown" : null;
    } else {
      skippedManualStatus++;
    }

    const { error: updateError } = await supabase
      .from("closing_calls")
      .update(patch)
      .eq("id", row.id);

    if (updateError) {
      throw new Error(mapSyncError(updateError.message));
    }
  }

  await repairClosingConversationLinks(supabase, organizationId);

  return {
    inserted: toInsertRows.length,
    updated: toUpdate.length,
    skippedManualStatus,
  };
}
