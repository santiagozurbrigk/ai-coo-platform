/**
 * Sync idempotente GHL appointments → closing_calls.
 * Patrón análogo a lib/calendly/sync-events.ts.
 *
 * - No sobreescribe deals ya cerrados (status='closed').
 * - Cancellations e 'invalid' de GHL → skip (no se importan).
 * - Idempotencia via ghl_appointment_id (unique index por org).
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { GHLAppointment, GHLAppointmentStatus } from "./client";

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

export async function syncGHLAppointmentsForOrganization(
  supabase: SupabaseClient,
  organizationId: string,
  appointments: GHLAppointment[]
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

  // ── INSERT ─────────────────────────────────────────────────────────────────
  if (toInsert.length > 0) {
    const rows = toInsert.map((a) => ({
      organization_id:   organizationId,
      ghl_appointment_id: a.id,
      ghl_calendar_id:   a.calendarId,
      lead_name:         resolveLeadName(a),
      scheduled_at:      a.startTime,
      status:            mapGHLStatus(a.appointmentStatus)!,
      form_answers:      buildFormAnswers(a),
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
        lead_name:    resolveLeadName(a),
        scheduled_at: a.startTime,
        status:       mapGHLStatus(a.appointmentStatus)!,
        form_answers: buildFormAnswers(a),
        updated_at:   new Date().toISOString(),
      })
      .eq("id", row.id)
      .eq("organization_id", organizationId);

    if (error) throw new Error(error.message);
    result.updated++;
  }

  return result;
}
