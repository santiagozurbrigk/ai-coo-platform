/**
 * B · L2 — Quién está del otro lado de una grabación, y qué era esa llamada.
 *
 * ⭐ La idea central del módulo, después de tres rediseños: **el propósito de una
 * llamada lo define la contraparte**, no quién grabó ni de qué calendario salió.
 * Cliente → entrega. Lead → venta.
 *
 * ⭐ Y la asimetría que lo hace tratable: las ventas **casi siempre se agendan**
 * (así que traen mail), y las entregas muchas veces no, pero son con **poca gente
 * que se repite** (así que el alias aprendido las cubre). Las dos mitades duras
 * del problema no coinciden nunca.
 *
 * Lógica pura: no toca base ni red.
 */
import type { ClientIdentity, IdentityType } from "@/types/fathom-identities";

export const RESOLUTION_METHODS = [
  "invitee_email",
  "speaker_alias",
  "name_match",
  "calendar_crossing",
  "ai_proposal",
  "manual",
] as const;
export type ResolutionMethod = (typeof RESOLUTION_METHODS)[number];

/** Qué tan confiable es cada peldaño. Determinista se aplica solo; candidato se confirma. */
export const RESOLUTION_CONFIDENCE: Record<ResolutionMethod, "deterministic" | "candidate"> = {
  invitee_email: "deterministic",
  speaker_alias: "deterministic",
  name_match: "candidate",
  calendar_crossing: "candidate",
  ai_proposal: "candidate",
  manual: "deterministic",
};

export type Counterparty = "lead" | "client" | "internal";
export type CallPurpose = "sales" | "delivery" | "team";

export type RecordingParticipant = {
  /** Nombre de pantalla, como aparece en Zoom/Meet. */
  name: string | null;
  email: string | null;
  /** `true` cuando Fathom lo marcó como del equipo o coincide con el que grabó. */
  isInternal?: boolean;
};

export type ResolveInput = {
  participants: RecordingParticipant[];
  /** Nombres de pantalla y mails conocidos del equipo. Se descartan primero. */
  teamNames: readonly string[];
  teamEmails: readonly string[];
  identities: readonly ClientIdentity[];
  /** `true` si la grabación cruza un turno agendado. */
  hasCalendarCrossing?: boolean;
  /** El cliente del turno cruzado, si lo hubiera. */
  calendarClientId?: string | null;
  calendarLeadId?: string | null;
};

export type ResolvedCounterparty = {
  counterparty: Counterparty;
  purpose: CallPurpose;
  clientId: string | null;
  leadId: string | null;
  /** ⭐ Por qué peldaño se resolvió. Sin esto nadie sabe si el módulo funciona. */
  resolutionMethod: ResolutionMethod | null;
  /** El nombre de pantalla de la contraparte: es lo que se aprende al confirmar. */
  speakerName: string | null;
  /** `true` cuando hay que confirmarlo a mano antes de darlo por bueno. */
  needsConfirmation: boolean;
};

/** Normaliza para comparar: sin acentos, sin puntuación, sin mayúsculas. */
export function normalizeIdentity(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9@.\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * ⭐ Paso 0 · Sacar a los de casa.
 *
 * La contraparte es el participante que **no** es del equipo. `recorded_by` viene
 * en todas las grabaciones y siempre es alguien de casa, así que después de unas
 * pocas llamadas OTC conoce al equipo sin preguntarle nada a nadie.
 */
export function externalParticipants(
  participants: readonly RecordingParticipant[],
  teamNames: readonly string[],
  teamEmails: readonly string[]
): RecordingParticipant[] {
  const names = new Set(teamNames.map(normalizeIdentity));
  const emails = new Set(teamEmails.map((email) => normalizeIdentity(email)));

  return participants.filter((participant) => {
    if (participant.isInternal) return false;
    if (participant.email && emails.has(normalizeIdentity(participant.email))) return false;
    if (participant.name && names.has(normalizeIdentity(participant.name))) return false;
    return true;
  });
}

/** Busca un valor en las identidades sembradas y aprendidas. */
function findIdentity(
  identities: readonly ClientIdentity[],
  type: IdentityType,
  value: string
): ClientIdentity | null {
  const normalized = normalizeIdentity(value);
  if (!normalized) return null;
  return (
    identities.find(
      (identity) =>
        identity.identityType === type && identity.normalizedValue === normalized
    ) ?? null
  );
}

/**
 * Resuelve quién es la contraparte y qué era la llamada.
 *
 * Va del peldaño más fuerte al más débil y **se detiene en el primero que
 * resuelve**: una señal determinista nunca se pisa con una más débil.
 */
export function resolveCounterparty(input: ResolveInput): ResolvedCounterparty {
  const externals = externalParticipants(
    input.participants,
    input.teamNames,
    input.teamEmails
  );

  // Nadie externo: es una reunión de equipo. No hay nada que adivinar.
  if (externals.length === 0) {
    return {
      counterparty: "internal",
      purpose: "team",
      clientId: null,
      leadId: null,
      resolutionMethod: null,
      speakerName: null,
      needsConfirmation: false,
    };
  }

  // Peldaño 1 · Mail de invitado externo. Determinista.
  for (const participant of externals) {
    if (!participant.email) continue;
    const identity = findIdentity(input.identities, "email", participant.email);
    if (identity) {
      return decide(identity, "invitee_email", participant.name, input);
    }
  }

  // Peldaño 2 · ⭐ Alias aprendido. Determinista, y es lo que resuelve las
  // entregas: se aprendió de la llamada de venta, que sí estuvo agendada.
  for (const participant of externals) {
    if (!participant.name) continue;
    const identity = findIdentity(input.identities, "speaker_alias", participant.name);
    if (identity) {
      return decide(identity, "speaker_alias", participant.name, input);
    }
  }

  // Peldaño 3 · Nombre normalizado. Alta, pero **candidato**: dos personas
  // pueden llamarse igual, y equivocarse acá mete una llamada en la ficha de
  // otro cliente.
  for (const participant of externals) {
    if (!participant.name) continue;
    const identity = findIdentity(input.identities, "name", participant.name);
    if (identity) {
      return decide(identity, "name_match", participant.name, input);
    }
  }

  // Peldaño 4 · Cruce con un turno agendado. Resuelve el multicalendario.
  if (input.hasCalendarCrossing && (input.calendarClientId || input.calendarLeadId)) {
    const isClient = Boolean(input.calendarClientId);
    return {
      counterparty: isClient ? "client" : "lead",
      // Un turno agendado con un cliente es un upsell: venta, no entrega.
      purpose: "sales",
      clientId: input.calendarClientId ?? null,
      leadId: input.calendarLeadId ?? null,
      resolutionMethod: "calendar_crossing",
      speakerName: externals[0]?.name ?? null,
      needsConfirmation: true,
    };
  }

  // Peldaño 5 · Nada. Cola de revisión — no se inventa una contraparte.
  return {
    counterparty: "lead",
    purpose: "sales",
    clientId: null,
    leadId: null,
    resolutionMethod: null,
    speakerName: externals[0]?.name ?? null,
    needsConfirmation: true,
  };
}

/**
 * ⭐ Paso 2 · El propósito sale de la contraparte, sin más preguntas.
 *
 * La excepción prevista: un cliente **con un turno agendado que cruza** es un
 * upsell —venta con un cliente—, y el modelo puede decir las dos cosas a la vez
 * porque `counterparty` y `purpose` son columnas separadas.
 */
function decide(
  identity: ClientIdentity,
  method: ResolutionMethod,
  speakerName: string | null,
  input: ResolveInput
): ResolvedCounterparty {
  const isClient = identity.clientId !== null;
  const isUpsell = isClient && input.hasCalendarCrossing === true;

  return {
    counterparty: isClient ? "client" : "lead",
    purpose: isClient && !isUpsell ? "delivery" : "sales",
    clientId: identity.clientId,
    leadId: identity.leadId,
    resolutionMethod: method,
    speakerName,
    needsConfirmation: RESOLUTION_CONFIDENCE[method] === "candidate",
  };
}

/**
 * ⭐ Paso 4 · La confirmación enseña.
 *
 * Cada vez que alguien resuelve una llamada a mano se guarda el alias de esa
 * persona, y no se la vuelve a preguntar nunca. El trabajo manual arranca alto y
 * **tiende a cero**.
 *
 * Devuelve la identidad que habría que guardar, o `null` si no hay nada nuevo que
 * aprender — guardar un alias que ya existe no aporta y ensucia la tabla.
 */
export function identityToLearn(
  speakerName: string | null,
  owner: { clientId: string | null; leadId: string | null },
  existing: readonly ClientIdentity[]
): { identityType: IdentityType; value: string; normalizedValue: string } | null {
  const name = speakerName?.trim();
  if (!name) return null;
  if (!owner.clientId && !owner.leadId) return null;

  const normalized = normalizeIdentity(name);
  if (!normalized) return null;

  const alreadyKnown = existing.some(
    (identity) =>
      identity.identityType === "speaker_alias" && identity.normalizedValue === normalized
  );
  if (alreadyKnown) return null;

  return { identityType: "speaker_alias", value: name, normalizedValue: normalized };
}
