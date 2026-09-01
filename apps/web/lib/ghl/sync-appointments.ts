/**
 * Sync idempotente GHL appointments → closing_calls.
 * Patrón análogo a lib/calendly/sync-events.ts.
 *
 * - No sobreescribe un estado que cargó una persona (status_source='manual').
 * - Las canceladas SÍ se importan: una llamada que no ocurrió es información.
 * - Idempotencia via ghl_appointment_id (unique index por org).
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { GHLAppointment, GHLAppointmentStatus, GHLContactAttributionSource } from "./client";
import { getGHLContact } from "./client";
import type { ClosingCallStatus } from "@/types/closing";
import { syncMayOverwriteStatus } from "@/lib/closing/call-status";
import { resolveLeadId } from "@/lib/sales/resolve-lead";

// ─── Mapeo de status GHL → closing_calls ─────────────────────────────────────

/**
 * ⭐ `showed` significa **que el lead asistió**, no que compró.
 *
 * Estaba mapeado a `closed`, que en OTC es una venta cerrada y alimenta la
 * etapa Cash del embudo y la facturación. O sea: cada lead que se presentaba a
 * una llamada se contaba como una venta. Ahora cae en `attended`, que es
 * exactamente lo que GHL está diciendo, y el resultado lo carga una persona.
 *
 * ⭐ `cancelled` **se importa**. Antes se descartaba en el filtro, así que una
 * llamada cancelada no existía para OTC. No es un `no_show`: en un no-show el
 * lead faltó a una llamada que ocurrió; acá la llamada nunca ocurrió.
 *
 * `invalid` se sigue omitiendo: GHL lo usa para turnos que no representan una
 * cita real, así que no hay nada que registrar.
 */
const STATUS_MAP: Partial<Record<GHLAppointmentStatus, ClosingCallStatus>> = {
  showed:    "attended",
  noshow:    "no_show",
  booked:    "scheduled",
  confirmed: "scheduled",
  cancelled: "cancelled",
  // invalid → undefined → se omite: no es una cita real
};

export function mapGHLStatus(ghlStatus: GHLAppointmentStatus): ClosingCallStatus | null {
  return STATUS_MAP[ghlStatus] ?? null;
}

// ─── Tipos internos ───────────────────────────────────────────────────────────

type ExistingRow = {
  id: string;
  status: ClosingCallStatus;
  status_source: string | null;
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
  /** Llamadas cuyo estado no se tocó porque lo cargó una persona. */
  skippedManualStatus: number;
  /** Turnos que GHL marcó `invalid`: no representan una cita real. */
  skippedInvalid: number;
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
    skippedManualStatus: 0,
    skippedInvalid: 0,
    fetched: appointments.length,
  };

  // Sólo se descarta lo que GHL marca `invalid`. Las canceladas se importan.
  const importable = appointments.filter((a) => {
    if (mapGHLStatus(a.appointmentStatus) === null) {
      result.skippedInvalid++;
      return false;
    }
    return true;
  });

  if (!importable.length) return result;

  const appointmentIds = importable.map((a) => a.id);

  // Buscar cuáles ya existen
  const { data: existing, error: existingError } = await supabase
    .from("closing_calls")
    .select("id, status, status_source, ghl_appointment_id")
    .eq("organization_id", organizationId)
    .in("ghl_appointment_id", appointmentIds);

  if (existingError) throw new Error(existingError.message);

  const existingRows = (existing ?? []) as ExistingRow[];
  const byAppointmentId = new Map<string, ExistingRow>();
  for (const row of existingRows) {
    if (row.ghl_appointment_id) byAppointmentId.set(row.ghl_appointment_id, row);
  }

  const toInsert = importable.filter((a) => !byAppointmentId.has(a.id));
  const toUpdate = importable.filter((a) => byAppointmentId.has(a.id));

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

  // ── Identidad del lead ─────────────────────────────────────────────────────
  // Se resuelve antes de escribir para que el turno nazca ya enganchado a su
  // hilo: es lo que permite ver los reagendamientos como intentos de la misma
  // persona en vez de filas sueltas.
  const leadIds = new Map<string, string | null>();
  for (const a of [...toInsert, ...toUpdate]) {
    if (leadIds.has(a.id)) continue;
    leadIds.set(
      a.id,
      await resolveLeadId(supabase, organizationId, {
        name: resolveLeadName(a),
        email: a.contact?.email ?? null,
        phone: a.contact?.phone ?? null,
        ghlContactId: a.contactId ?? null,
      })
    );
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
      // GHL informa la cancelación pero no quién la pidió. `unknown` es el
      // valor honesto: la alternativa sería atribuírsela al lead sin saberlo.
      cancelled_by:       mapGHLStatus(a.appointmentStatus) === "cancelled" ? "unknown" : null,
      lead_email:         a.contact?.email?.trim() || null,
      lead_phone:         a.contact?.phone?.trim() || null,
      lead_id:            leadIds.get(a.id) ?? null,
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

    // Los datos del turno (horario, nombre, contacto) siempre se refrescan:
    // ahí GHL es la fuente de verdad. El estado es lo único que se protege,
    // porque es lo que carga una persona.
    const patch: Record<string, unknown> = {
      lead_name:      resolveLeadName(a),
      scheduled_at:   a.startTime,
      form_answers:   buildFormAnswers(a),
      ghl_contact_id: a.contactId ?? null,
      lead_email:     a.contact?.email?.trim() || null,
      lead_phone:     a.contact?.phone?.trim() || null,
      lead_id:        leadIds.get(a.id) ?? null,
      updated_at:     new Date().toISOString(),
      ...buildUtmFields(attributionMap.get(a.contactId)),
    };

    const mapped = mapGHLStatus(a.appointmentStatus)!;
    if (syncMayOverwriteStatus({ status: row.status, statusSource: row.status_source })) {
      patch.status = mapped;
      patch.cancelled_by = mapped === "cancelled" ? "unknown" : null;
    } else {
      result.skippedManualStatus++;
    }

    const { error } = await supabase
      .from("closing_calls")
      .update(patch)
      .eq("id", row.id)
      .eq("organization_id", organizationId);

    if (error) throw new Error(error.message);
    result.updated++;
  }

  return result;
}
