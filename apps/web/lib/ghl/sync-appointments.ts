/**
 * Sync idempotente GHL appointments → closing_calls.
 * Patrón análogo a lib/calendly/sync-events.ts.
 *
 * - No sobreescribe deals ya cerrados (status='closed').
 * - Cancellations e 'invalid' de GHL → skip (no se importan).
 * - Idempotencia via ghl_appointment_id (unique index por org).
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { GHLAppointment, GHLAppointmentStatus, GHLContactAttributionSource } from "./client";
import { getGHLContact } from "./client";

// ─── Mapeo de status GHL → closing_calls ─────────────────────────────────────

const STATUS_MAP: Partial<Record<GHLAppointmentStatus, string>> = {
  showed:    "closed",
  noshow:    "no_show",
  booked:    "scheduled",
  confirmed: "scheduled",
  // cancelled / invalid → undefined → se omiten
};

function mapGHLStatus(
  ghlStatus: GHLAppointmentStatus
): "closed" | "no_show" | "scheduled" | null {
  return (STATUS_MAP[ghlStatus] as "closed" | "no_show" | "scheduled") ?? null;
}

// ─── Tipos internos ───────────────────────────────────────────────────────────

type ExistingRow = {
  id: string;
  status: string;
  ghl_appointment_id: string | null;
};

function resolveLeadName(appointment: GHLAppointment): string {
  return (
    appointment.contact?.name?.trim() ||
    appointment.title?.trim() ||
    "Sin nombre"
  );
}

function buildFormAnswers(appointment: GHLAppointment) {
  const answers: Array<{ question: string; answer: string }> = [];

  if (appointment.contact?.email) {
    answers.push({ question: "Email", answer: appointment.contact.email });
  }
  if (appointment.contact?.phone) {
    answers.push({ question: "Teléfono", answer: appointment.contact.phone });
  }
  if (appointment.notes) {
    answers.push({ question: "Notas", answer: appointment.notes });
  }
  if (appointment.address) {
    answers.push({ question: "Dirección / Modalidad", answer: appointment.address });
  }

  return answers;
}

// ─── Función principal ────────────────────────────────────────────────────────

export type GHLSyncResult = {
  inserted: number;
  updated: number;
  skippedClosed: number;
  skippedCancelled: number;
  fetched: number;
};

// ─── Helpers UTM ─────────────────────────────────────────────────────────────

/**
 * Obtiene la atribución UTM de un conjunto de contactIds en paralelo (con límite de concurrencia).
 * Devuelve un mapa contactId → attributionSource.
 */
async function fetchContactAttributions(
  apiKey: string,
  contactIds: string[]
): Promise<Map<string, GHLContactAttributionSource | null>> {
  const result = new Map<string, GHLContactAttributionSource | null>();
  if (!contactIds.length) return result;

  // Máximo 5 requests en paralelo para no saturar la API de GHL
  const CONCURRENCY = 5;
  for (let i = 0; i < contactIds.length; i += CONCURRENCY) {
    const batch = contactIds.slice(i, i + CONCURRENCY);
    const contacts = await Promise.all(
      batch.map((id) => getGHLContact(apiKey, id))
    );
    for (let j = 0; j < batch.length; j++) {
      result.set(batch[j]!, contacts[j]?.attributionSource ?? null);
    }
  }

  return result;
}

function buildUtmFields(attribution: GHLContactAttributionSource | null | undefined) {
  if (!attribution) return {};
  return {
    utm_source:   attribution.utmSource   ?? attribution.medium   ?? null,
    utm_medium:   attribution.utmMedium   ?? null,
    utm_campaign: attribution.campaign    ?? null,
    utm_content:  attribution.utmContent  ?? null,
    utm_term:     attribution.utmTerm     ?? null,
    attribution_source: attribution,
  };
}

// ─── Función principal ────────────────────────────────────────────────────────

export async function syncGHLAppointmentsForOrganization(
  supabase: SupabaseClient,
  organizationId: string,
  appointments: GHLAppointment[],
  apiKey?: string
): Promise<GHLSyncResult> {
  const result: GHLSyncResult = {
    inserted: 0,
    updated: 0,
    skippedClosed: 0,
    skippedCancelled: 0,
    fetched: appointments.length,
  };

  // Filtrar cancelled e invalid (no se importan)
  const importable = appointments.filter((a) => {
    const mapped = mapGHLStatus(a.appointmentStatus);
    if (mapped === null) {
      result.skippedCancelled++;
      return false;
    }
    return true;
  });

  if (!importable.length) return result;

  const appointmentIds = importable.map((a) => a.id);

  // Buscar cuáles ya existen
  const { data: existing, error: existingError } = await supabase
    .from("closing_calls")
    .select("id, status, ghl_appointment_id")
    .eq("organization_id", organizationId)
    .in("ghl_appointment_id", appointmentIds);

  if (existingError) throw new Error(existingError.message);

  const existingRows = (existing ?? []) as ExistingRow[];
  const byAppointmentId = new Map<string, ExistingRow>();
  for (const row of existingRows) {
    if (row.ghl_appointment_id) byAppointmentId.set(row.ghl_appointment_id, row);
  }

  const toInsert = importable.filter((a) => !byAppointmentId.has(a.id));
  const toUpdate = importable.filter((a) => {
    const row = byAppointmentId.get(a.id);
    return row ? row.status !== "closed" : false;
  });
  result.skippedClosed += importable.length - toInsert.length - toUpdate.length;

  // ── Enriquecer con UTMs del contacto (solo para rows que cambian) ──────────
  // Fetch paralelo (concurrencia 5) para no saturar la API de GHL
  let attributionMap = new Map<string, GHLContactAttributionSource | null>();
  if (apiKey) {
    const contactIdsForAttribution = [
      ...toInsert.map((a) => a.contactId),
      ...toUpdate.map((a) => a.contactId),
    ].filter(Boolean) as string[];

    const uniqueContactIds = [...new Set(contactIdsForAttribution)];
    attributionMap = await fetchContactAttributions(apiKey, uniqueContactIds);
  }

  // ── INSERT ─────────────────────────────────────────────────────────────────
  if (toInsert.length > 0) {
    const rows = toInsert.map((a) => ({
      organization_id:    organizationId,
      ghl_appointment_id: a.id,
      ghl_calendar_id:    a.calendarId,
      ghl_contact_id:     a.contactId ?? null,
      lead_name:          resolveLeadName(a),
      scheduled_at:       a.startTime,
      status:             mapGHLStatus(a.appointmentStatus)!,
      form_answers:       buildFormAnswers(a),
      ...buildUtmFields(attributionMap.get(a.contactId)),
    }));

    const { error } = await supabase.from("closing_calls").insert(rows);
    if (error) throw new Error(error.message);
    result.inserted += toInsert.length;
  }

  // ── UPDATE ─────────────────────────────────────────────────────────────────
  for (const a of toUpdate) {
    const row = byAppointmentId.get(a.id)!;
    const { error } = await supabase
      .from("closing_calls")
      .update({
        lead_name:      resolveLeadName(a),
        scheduled_at:   a.startTime,
        status:         mapGHLStatus(a.appointmentStatus)!,
        form_answers:   buildFormAnswers(a),
        ghl_contact_id: a.contactId ?? null,
        updated_at:     new Date().toISOString(),
        ...buildUtmFields(attributionMap.get(a.contactId)),
      })
      .eq("id", row.id)
      .eq("organization_id", organizationId);

    if (error) throw new Error(error.message);
    result.updated++;
  }

  return result;
}
