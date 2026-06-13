import {
  isMissingTableError,
} from "@/lib/auth/bootstrap";
import { repairClosingConversationLinks } from "@/lib/conversations/repair-links";
import { attributeBookingToUTM } from "@/lib/utm/attribute-booking";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { CalendlyEventSyncPayload } from "@/types/calendly";

type ExistingClosingCallRow = {
  id: string;
  status: string;
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
 * No sobreescribe deals ya cerrados (status='closed').
 * Sin "use server": importable desde route handlers y cron sin colisión con Server Actions.
 */
export async function syncCalendlyEventsForOrganization(
  supabase: SupabaseClient,
  organizationId: string,
  events: CalendlyEventSyncPayload[]
): Promise<{
  inserted: number;
  updated: number;
  skippedClosed: number;
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
    return { inserted: 0, updated: 0, skippedClosed: 0 };
  }

  const uniqueEventIds = Array.from(new Set(normalized.map((e) => e.eventId)));

  const { data: existing, error: existingError } = await supabase
    .from("closing_calls")
    .select("id, status, calendly_event_id")
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
  const toUpdate = normalized.filter((e) => {
    const row = byEventId.get(e.eventId);
    return row ? row.status !== "closed" : false;
  });
  const skippedClosed = normalized.length - toInsert.length - toUpdate.length;

  const toInsertRows = toInsert.map((e) => ({
    organization_id: organizationId,
    calendly_event_id: e.eventId,
    calendly_url: e.url ?? null,
    lead_name: e.inviteeName,
    scheduled_at: e.startTime,
    status: e.statusHint ?? "scheduled",
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

    const { error: updateError } = await supabase
      .from("closing_calls")
      .update({
        calendly_url: e.url ?? null,
        lead_name: e.inviteeName,
        scheduled_at: e.startTime,
        status: e.statusHint ?? "scheduled",
        form_answers: e.questionsAndAnswers,
        updated_at: new Date().toISOString(),
      })
      .eq("id", row.id);

    if (updateError) {
      throw new Error(mapSyncError(updateError.message));
    }
  }

  await repairClosingConversationLinks(supabase, organizationId);

  return {
    inserted: toInsertRows.length,
    updated: toUpdate.length,
    skippedClosed,
  };
}
