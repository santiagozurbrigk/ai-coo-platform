import { createAdminClient } from "@/lib/supabase/admin";
import { allEmails, type FathomInvitee } from "@/lib/fathom/invitees";
import {
  EMAIL_MATCH_WINDOW_MINUTES,
  matchRecordingToAppointment,
  type AppointmentCandidate,
  type AppointmentMatchResult,
} from "@/lib/fathom/match-appointment";

/**
 * Resuelve si una grabación de Fathom es una llamada de venta.
 *
 * ⭐ **OTC registra únicamente llamadas de venta.** Una grabación lo es cuando
 * el mail de alguno de sus participantes coincide con el del lead de un turno
 * agendado y el horario corresponde. Todo lo demás existe en `fathom_calls` pero
 * no entra al módulo de ventas — no es un error, es otra cosa.
 *
 * Las llamadas de equipo y de entrega de servicio quedan **fuera de alcance por
 * decisión de producto**, para más adelante.
 *
 * Capa de IO: consulta los turnos candidatos y le pasa el resto a
 * `matchRecordingToAppointment`, que es puro y está testeado.
 */

/** Margen de la consulta, más ancho que la ventana de match. */
const CANDIDATE_LOOKUP_MINUTES = EMAIL_MATCH_WINDOW_MINUTES + 60;

async function loadAppointmentCandidates(params: {
  organizationId: string;
  recordingStart: string;
}): Promise<AppointmentCandidate[]> {
  const admin = createAdminClient();
  const center = new Date(params.recordingStart).getTime();
  if (Number.isNaN(center)) return [];

  const from = new Date(center - CANDIDATE_LOOKUP_MINUTES * 60_000).toISOString();
  const to = new Date(center + CANDIDATE_LOOKUP_MINUTES * 60_000).toISOString();

  const { data } = await admin
    .from("closing_calls")
    .select("id, scheduled_at, lead_name, lead_email")
    .eq("organization_id", params.organizationId)
    .gte("scheduled_at", from)
    .lte("scheduled_at", to)
    .limit(50);

  return (data ?? []).map((row) => ({
    id: row.id as string,
    scheduledAt: row.scheduled_at as string,
    leadName: (row.lead_name as string | null) ?? null,
    leadEmail: (row.lead_email as string | null) ?? null,
  }));
}

export type SalesCallResolution = {
  /** `true` cuando la grabación quedó asociada a un turno. */
  isSalesCall: boolean;
  /** Turno asociado, o `null`. */
  appointmentId: string | null;
  /** Detalle del cruce: confianza, distancia en minutos o motivo del no-match. */
  match: AppointmentMatchResult;
};

export async function resolveSalesCall(params: {
  organizationId: string;
  invitees: FathomInvitee[];
  recordingStart: string | null | undefined;
}): Promise<SalesCallResolution> {
  const candidates = params.recordingStart
    ? await loadAppointmentCandidates({
        organizationId: params.organizationId,
        recordingStart: params.recordingStart,
      })
    : [];

  const match = matchRecordingToAppointment({
    recordingStart: params.recordingStart,
    // Se comparan **todos** los participantes, no sólo los que Fathom marca
    // externos: `is_external` se calcula contra el dominio de la cuenta de
    // Fathom, así que un lead con dominio parecido, o un closer con Gmail
    // personal, quedan del lado equivocado. El mail del turno es la referencia.
    participantEmails: allEmails(params.invitees),
    candidates,
  });

  return {
    isSalesCall: match.status === "matched",
    appointmentId: match.status === "matched" ? match.match.appointmentId : null,
    match,
  };
}
