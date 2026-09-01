import { createAdminClient } from "@/lib/supabase/admin";
import { classifyCall, type CallClassification } from "@/lib/fathom/classify";
import {
  externalEmails,
  normalizeEmail,
  type FathomInvitee,
} from "@/lib/fathom/invitees";
import {
  EMAIL_MATCH_WINDOW_MINUTES,
  matchRecordingToAppointment,
  type AppointmentCandidate,
} from "@/lib/fathom/match-appointment";
import type { CallPurpose } from "@/lib/fathom/parse-title";

/**
 * Capa de IO de la clasificación: consulta lo que hace falta y se lo pasa a las
 * funciones puras.
 *
 * Mismo corte que el resto del repo: la lógica que decide vive en
 * `classify.ts` y `match-appointment.ts`, con tests; acá sólo se resuelven los
 * datos que esa lógica necesita.
 */

/** Margen de la consulta de turnos, más ancho que la ventana de match. */
const CANDIDATE_LOOKUP_MINUTES = EMAIL_MATCH_WINDOW_MINUTES + 60;

async function loadMeetingTypeMap(
  organizationId: string
): Promise<Record<string, CallPurpose>> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("fathom_meeting_type_map")
    .select("meeting_type_name, purpose")
    .eq("organization_id", organizationId);

  const map: Record<string, CallPurpose> = {};
  for (const row of data ?? []) {
    const name = row.meeting_type_name as string | null;
    const purpose = row.purpose as CallPurpose | null;
    if (name && purpose) map[name] = purpose;
  }
  return map;
}

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

/**
 * Busca un cliente por el mail de alguno de los invitados externos.
 *
 * Por mail y no por nombre: los nombres de la base vienen con emojis y espacios
 * dobles, y el fuzzy match sobre títulos es justamente lo que dejó 0 de 248
 * llamadas asociadas.
 */
async function findClientByInviteeEmail(params: {
  organizationId: string;
  emails: string[];
}): Promise<string | null> {
  if (!params.emails.length) return null;

  const admin = createAdminClient();
  const { data } = await admin
    .from("clients")
    .select("id, email")
    .eq("organization_id", params.organizationId)
    .not("email", "is", null);

  if (!data?.length) return null;

  const wanted = new Set(params.emails);
  for (const row of data) {
    const email = normalizeEmail(row.email as string | null);
    if (email && wanted.has(email)) return row.id as string;
  }
  return null;
}

export type ResolvedClassification = CallClassification & {
  /** Detalle del cruce con la agenda, para poder auditar un vínculo dudoso. */
  appointmentMatch: ReturnType<typeof matchRecordingToAppointment> | null;
};

/**
 * Clasifica una llamada de Fathom resolviendo antes todas sus señales.
 */
export async function resolveCallClassification(params: {
  organizationId: string;
  title: string | null | undefined;
  invitees: FathomInvitee[];
  meetingType: string | null | undefined;
  recordingStart: string | null | undefined;
}): Promise<ResolvedClassification> {
  const emails = externalEmails(params.invitees);

  const [meetingTypeMap, candidates, clientIdByEmail] = await Promise.all([
    loadMeetingTypeMap(params.organizationId),
    params.recordingStart
      ? loadAppointmentCandidates({
          organizationId: params.organizationId,
          recordingStart: params.recordingStart,
        })
      : Promise.resolve([] as AppointmentCandidate[]),
    findClientByInviteeEmail({ organizationId: params.organizationId, emails }),
  ]);

  const appointmentResult = matchRecordingToAppointment({
    recordingStart: params.recordingStart,
    inviteeEmails: emails,
    candidates,
  });

  const classification = classifyCall({
    title: params.title,
    invitees: params.invitees,
    meetingType: params.meetingType,
    meetingTypeMap,
    appointmentMatch:
      appointmentResult.status === "matched" ? appointmentResult.match : null,
    clientIdByEmail,
  });

  return { ...classification, appointmentMatch: appointmentResult };
}
