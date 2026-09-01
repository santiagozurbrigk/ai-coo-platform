import { isInternalOnly, type FathomInvitee } from "@/lib/fathom/invitees";
import { parseCallTitle, type CallPurpose } from "@/lib/fathom/parse-title";
import type { AppointmentMatch } from "@/lib/fathom/match-appointment";

/**
 * El clasificador de llamadas. **Uno solo.**
 *
 * ⭐ **Reemplaza a cuatro mecanismos que competían** y ninguno mandaba: un regex
 * de equipo en `associate.ts`, 60 keywords en `classify-call-type.ts`, la IA
 * sobre el transcript sin definiciones de ningún tipo, y un fuzzy match del
 * título contra nombres de clientes. Se pisaban entre sí —el sync por miembro
 * clasificaba por keywords y el cron lo sobrescribía con el resultado de la IA,
 * o con `null` si fallaba— y ninguno era auditable.
 *
 * ⭐ **Dos ejes, no uno.** El sistema anterior mezclaba dos preguntas
 * independientes y el fracaso de la primera decidía la segunda en silencio:
 *
 * - **¿Con quién es?** lead · cliente · interna
 * - **¿Para qué es?** venta · entrega · equipo
 *
 * Una llamada de venta es con un **lead**, que por definición todavía no es
 * cliente — por eso el sistema viejo, que buscaba clientes, las mandaba todas a
 * `unmatched` y las analizaba como "Equipo interno".
 *
 * ⭐ **Nunca inventa.** Cuando ninguna señal alcanza, el resultado es `unknown`
 * con el motivo, y la llamada va a una cola visible. No hay valor por defecto.
 */

export type CallCounterparty = "lead" | "client" | "internal";

/** De dónde salió la clasificación. Se guarda para poder auditarla y explicarla. */
export type ClassificationSignal =
  /** Cruce con un turno agendado: identidad y propósito de una sola vez. */
  | "appointment"
  /** Un invitado externo coincide con un cliente activo. */
  | "client_email"
  /** El tipo de reunión de Fathom, mapeado por la organización. */
  | "meeting_type"
  /** Todos los invitados son internos. */
  | "internal_invitees"
  /** La convención de nombres en el título. */
  | "title"
  /** Lo resolvió una persona desde la cola de revisión. */
  | "manual";

export type UnclassifiedReason =
  /** Ni invitados, ni tipo, ni convención en el título. */
  | "no_signal"
  /** Hay invitados externos pero no se pudo determinar el propósito. */
  | "external_unknown_purpose";

export type CallClassification = {
  counterparty: CallCounterparty | null;
  purpose: CallPurpose | null;
  /** Señales que aportaron, en orden de aplicación. */
  signals: ClassificationSignal[];
  /** Turno vinculado, cuando el cruce con la agenda resolvió. */
  appointmentId: string | null;
  /** Cliente vinculado, cuando un invitado externo es un cliente. */
  clientId: string | null;
  /** Nombre declarado en el título, si lo hubo. Sirve para revisar a mano. */
  declaredName: string | null;
  /** Presente sólo cuando queda algo sin resolver. */
  reason: UnclassifiedReason | null;
};

export type ClassifyInput = {
  title: string | null | undefined;
  invitees: FathomInvitee[];
  /** Tipo de reunión que devolvió Fathom, si la org los usa. */
  meetingType: string | null | undefined;
  /** Mapa configurado por la organización: nombre del tipo → propósito. */
  meetingTypeMap: Record<string, CallPurpose>;
  /** Resultado del cruce con la agenda, ya resuelto. */
  appointmentMatch: AppointmentMatch | null;
  /** Cliente resuelto por mail de un invitado externo, ya consultado. */
  clientIdByEmail: string | null;
};

/**
 * Clasifica una llamada combinando las señales disponibles, de la más confiable
 * a la más frágil.
 *
 * El orden importa y es deliberado: el cruce con la agenda es un hecho
 * verificable, el título es lo que alguien tipeó.
 */
export function classifyCall(input: ClassifyInput): CallClassification {
  const signals: ClassificationSignal[] = [];
  const parsedTitle = parseCallTitle(input.title);
  const declaredName = parsedTitle?.counterpartyName ?? null;

  // ── 1. Turno agendado ─────────────────────────────────────────────────────
  // Resuelve identidad y propósito juntos: si hay un turno de cierre, es una
  // llamada de venta con ese lead. No hace falta nada más.
  if (input.appointmentMatch) {
    return {
      counterparty: "lead",
      purpose: "sales",
      signals: ["appointment"],
      appointmentId: input.appointmentMatch.appointmentId,
      clientId: null,
      declaredName,
      reason: null,
    };
  }

  // ── 2. Cliente conocido ───────────────────────────────────────────────────
  // Un invitado externo que ya es cliente: la llamada es con él. El propósito
  // por defecto es entrega, salvo que el tipo o el título digan otra cosa.
  let counterparty: CallCounterparty | null = null;
  let clientId: string | null = null;

  if (input.clientIdByEmail) {
    counterparty = "client";
    clientId = input.clientIdByEmail;
    signals.push("client_email");
  }

  // ── 3. Reunión interna ────────────────────────────────────────────────────
  // `isInternalOnly` devuelve null cuando no hay invitados cargados: sin lista
  // no se puede afirmar que no había externos.
  const internalOnly = isInternalOnly(input.invitees);
  if (counterparty === null && internalOnly === true) {
    counterparty = "internal";
    signals.push("internal_invitees");
  }

  // ── 4. Propósito ──────────────────────────────────────────────────────────
  let purpose: CallPurpose | null = null;

  const mappedType = input.meetingType
    ? input.meetingTypeMap[input.meetingType]
    : undefined;
  if (mappedType) {
    purpose = mappedType;
    signals.push("meeting_type");
  } else if (parsedTitle) {
    purpose = parsedTitle.purpose;
    signals.push("title");
  } else if (counterparty === "internal") {
    // Una reunión donde sólo hay gente del equipo es, por definición, del equipo.
    purpose = "team";
  } else if (counterparty === "client") {
    // Con un cliente y sin otra señal, entrega es lo que la llamada es en la
    // enorme mayoría de los casos. Queda registrado que salió del mail del
    // cliente, no de una afirmación del usuario.
    purpose = "delivery";
  }

  // El título puede identificar a la contraparte cuando los invitados no
  // alcanzaron: una venta declarada implica un lead.
  if (counterparty === null && purpose === "sales") {
    counterparty = "lead";
  }
  if (counterparty === null && purpose === "team") {
    counterparty = "internal";
  }

  // ── 5. Lo que no se pudo resolver ─────────────────────────────────────────
  //
  // Los dos motivos describen situaciones distintas y la cola de revisión las
  // trata distinto: en una no hay nada de dónde agarrarse; en la otra sabemos
  // que la llamada fue con alguien de afuera y sólo falta para qué.
  const hasExternalInvitees = input.invitees.some((i) => i.isExternal);

  let reason: UnclassifiedReason | null = null;
  if (purpose === null) {
    reason =
      hasExternalInvitees || counterparty !== null
        ? "external_unknown_purpose"
        : "no_signal";
  }

  return {
    counterparty,
    purpose,
    signals,
    appointmentId: null,
    clientId,
    declaredName,
    reason,
  };
}
