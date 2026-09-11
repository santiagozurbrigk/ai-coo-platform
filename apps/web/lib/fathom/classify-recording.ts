/**
 * B · L2 — Clasificar una grabación: quién estaba del otro lado y qué era.
 *
 * ⭐ Es la capa de IO que faltaba. `resolveCounterparty` estaba construido y
 * testeado desde el 2026-09-03 y **nunca se había enchufado**: el pipeline sólo
 * preguntaba "¿es una llamada de venta?" y todo lo demás quedaba sin clasificar.
 * Por eso no había forma de saber cuándo fue la última sesión 1-1 con un
 * cliente.
 *
 * Junta las tres piezas que el resolvedor puro necesita y no puede buscar solo:
 * los participantes, el equipo de casa y las identidades conocidas.
 */
import { createAdminClient } from "@/lib/supabase/admin";
import { parseFathomInvitees } from "@/lib/fathom/invitees";
import { loadOrganizationIdentities } from "@/lib/fathom/identities";
import {
  resolveCounterparty,
  type RecordingParticipant,
  type ResolvedCounterparty,
} from "@/lib/fathom/resolve-counterparty";

/**
 * El equipo de casa: mails y nombres de los perfiles de la organización.
 *
 * ⭐ Es lo que permite quedarse con el participante externo sin preguntarle nada
 * a nadie. Se usa el perfil y no el dominio del mail: un closer con Gmail
 * personal quedaría del lado equivocado si se mirara el dominio, que es
 * exactamente el error que `resolve-sales-call.ts` documenta.
 */
async function loadTeam(
  organizationId: string
): Promise<{ names: string[]; emails: string[] }> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("profiles")
    .select("email, full_name")
    .eq("organization_id", organizationId);

  if (error) {
    console.error("[fathom:classify] team", error.message);
    return { names: [], emails: [] };
  }

  const rows = (data ?? []) as { email: string | null; full_name: string | null }[];
  return {
    names: rows.map((row) => row.full_name).filter((v): v is string => Boolean(v?.trim())),
    emails: rows.map((row) => row.email).filter((v): v is string => Boolean(v?.trim())),
  };
}

/**
 * Los participantes de una grabación.
 *
 * Hoy la única fuente es `calendar_invitees`. Una grabación **sin evento de
 * calendario llega con la lista vacía**, y el resolvedor trata ese caso como "no
 * se sabe" —no como "reunión de equipo"—, así que devolver el array vacío tal
 * cual es lo correcto: no hay nada que completar.
 */
export function participantsFromInvitees(rawInvitees: unknown): RecordingParticipant[] {
  return parseFathomInvitees(rawInvitees).map((invitee) => ({
    name: invitee.name,
    email: invitee.email,
    // `is_external` de Fathom se calcula contra el dominio de la cuenta, así que
    // no se usa para decidir: sólo se pasa cuando dice explícitamente que es de
    // casa, y el descarte real lo hace la lista del equipo.
    isInternal: invitee.isExternal === false,
  }));
}

export type RecordingClassification = ResolvedCounterparty;

/**
 * Clasifica una grabación ya guardada.
 *
 * El cruce con la agenda entra como una señal más —el peldaño 4— y no decide
 * solo: un cliente reconocido por mail que además tiene turno agendado es un
 * upsell, y eso lo resuelve el resolvedor puro.
 */
export async function classifyRecording(params: {
  organizationId: string;
  calendarInvitees: unknown;
  hasCalendarCrossing: boolean;
  calendarClientId?: string | null;
  calendarLeadId?: string | null;
}): Promise<RecordingClassification> {
  const [team, identities] = await Promise.all([
    loadTeam(params.organizationId),
    loadOrganizationIdentities(params.organizationId),
  ]);

  return resolveCounterparty({
    participants: participantsFromInvitees(params.calendarInvitees),
    teamNames: team.names,
    teamEmails: team.emails,
    identities,
    hasCalendarCrossing: params.hasCalendarCrossing,
    calendarClientId: params.calendarClientId ?? null,
    calendarLeadId: params.calendarLeadId ?? null,
  });
}
