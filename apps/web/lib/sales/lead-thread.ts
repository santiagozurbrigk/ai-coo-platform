import type { ClosingCallStatus } from "@/types/closing";
import { callIsSale, needsDisposition } from "@/lib/closing/call-status";

/**
 * El hilo de un lead: todos sus intentos, y qué necesita ahora.
 *
 * ⭐ **Por qué existe.** Cada turno era una fila suelta. Un lead con siete turnos
 * en dos días eran siete filas sin relación entre sí, y cuando una llamada no
 * cerraba no había dónde anotar qué seguía — de 1.027 turnos, **cero** tenían
 * resultado cargado. El hilo junta los intentos y deriva, sin inventar nada, en
 * cuál de ellos hay trabajo pendiente.
 *
 * ⭐ **No infiere reagendas.** Sería fácil decir "este turno se canceló y
 * apareció otro después, entonces se reagendó", pero es una afirmación sobre lo
 * que pasó y podrían ser dos intentos independientes. El hilo muestra los
 * intentos en orden —que es un hecho— y la reagenda la declara el closer con el
 * próximo paso. Es la misma regla que sostiene todo el módulo: la ausencia de un
 * dato no se rellena con una suposición.
 */

export type NextAction = "reschedule" | "follow_up" | "waiting_lead" | "lost";

export type LeadQualification = "hot" | "warm" | "cold" | "unqualified";

export type LeadAttempt = {
  id: string;
  scheduledAt: string;
  status: ClosingCallStatus;
  nextAction: NextAction | null;
  nextActionAt: string | null;
  preCallQualification: LeadQualification | null;
  postCallQualification: LeadQualification | null;
};

/**
 * En qué situación está el lead.
 *
 * Los tres primeros son trabajo pendiente; los últimos tres, no.
 */
export type LeadThreadState =
  /** Ya pasó una llamada y nadie cargó qué ocurrió. */
  | "pending_outcome"
  /** Hay un próximo paso cuya fecha ya venció. */
  | "follow_up_due"
  /**
   * La llamada tuvo desenlace, no cerró, y **nadie definió qué sigue**.
   * Es la fuga: el lead quedó sin dueño y sin fecha.
   */
  | "stalled"
  /** Hay un turno futuro. */
  | "scheduled"
  /** Hay un próximo paso con fecha por delante. */
  | "follow_up_planned"
  /** Alguna llamada cerró. */
  | "won"
  /** Se dio por perdido explícitamente. */
  | "lost";

export type LeadThread = {
  /** Intentos del más reciente al más viejo. */
  attempts: LeadAttempt[];
  state: LeadThreadState;
  /** Intento sobre el que hay que actuar, si lo hay. */
  actionableAttemptId: string | null;
  /** Cuántas veces se agendó a este lead. */
  attemptCount: number;
  /** Última calificación conocida, la posterior antes que la previa. */
  latestQualification: LeadQualification | null;
};

/** Los estados que representan trabajo pendiente del closer. */
export const ACTIONABLE_STATES: readonly LeadThreadState[] = [
  "pending_outcome",
  "follow_up_due",
  "stalled",
] as const;

export function isActionable(state: LeadThreadState): boolean {
  return (ACTIONABLE_STATES as readonly string[]).includes(state);
}

export const LEAD_THREAD_STATE_LABEL: Record<LeadThreadState, string> = {
  pending_outcome: "Falta cargar el resultado",
  follow_up_due: "Seguimiento vencido",
  stalled: "Sin próximo paso",
  scheduled: "Turno agendado",
  follow_up_planned: "Seguimiento agendado",
  won: "Cerrado",
  lost: "Perdido",
};

function time(iso: string | null): number {
  if (!iso) return NaN;
  const value = new Date(iso).getTime();
  return Number.isNaN(value) ? NaN : value;
}

/**
 * Arma el hilo y deriva su estado.
 *
 * Puro: recibe los intentos ya consultados.
 */
export function buildLeadThread(
  attempts: LeadAttempt[],
  now: Date = new Date()
): LeadThread {
  // Del más reciente al más viejo. Una fecha inválida va al final en vez de
  // desordenar el resto.
  const sorted = [...attempts].sort((a, b) => {
    const ta = time(a.scheduledAt);
    const tb = time(b.scheduledAt);
    if (Number.isNaN(ta)) return 1;
    if (Number.isNaN(tb)) return -1;
    return tb - ta;
  });

  const latestQualification =
    sorted.find((a) => a.postCallQualification)?.postCallQualification ??
    sorted.find((a) => a.preCallQualification)?.preCallQualification ??
    null;

  const base = {
    attempts: sorted,
    attemptCount: sorted.length,
    latestQualification,
  };

  if (sorted.length === 0) {
    return { ...base, state: "stalled", actionableAttemptId: null };
  }

  // ── Estados terminales ─────────────────────────────────────────────────────
  const won = sorted.find((a) => callIsSale(a.status));
  if (won) return { ...base, state: "won", actionableAttemptId: null };

  // Se da por perdido sólo si el intento **más reciente** lo declara: un "lost"
  // viejo seguido de un turno nuevo significa que el lead volvió.
  if (sorted[0]!.nextAction === "lost") {
    return { ...base, state: "lost", actionableAttemptId: null };
  }

  const nowMs = now.getTime();

  // ── Trabajo pendiente ──────────────────────────────────────────────────────
  //
  // El seguimiento vencido va primero: una fecha que pasó es un compromiso
  // incumplido, y pesa más que un resultado sin cargar.
  const overdue = sorted.find((a) => {
    if (!a.nextAction || a.nextAction === "lost") return false;
    const due = time(a.nextActionAt);
    return !Number.isNaN(due) && due <= nowMs;
  });
  if (overdue) {
    return { ...base, state: "follow_up_due", actionableAttemptId: overdue.id };
  }

  const pending = sorted.find((a) =>
    needsDisposition(a.status, a.scheduledAt, now)
  );
  if (pending) {
    return { ...base, state: "pending_outcome", actionableAttemptId: pending.id };
  }

  // ── Estados en curso ───────────────────────────────────────────────────────
  const upcoming = sorted.find((a) => {
    const at = time(a.scheduledAt);
    return (
      !Number.isNaN(at) &&
      at > nowMs &&
      (a.status === "scheduled" || a.status === "attended")
    );
  });
  if (upcoming) {
    return { ...base, state: "scheduled", actionableAttemptId: null };
  }

  const planned = sorted.find((a) => {
    if (!a.nextAction || a.nextAction === "lost") return false;
    const due = time(a.nextActionAt);
    return !Number.isNaN(due) && due > nowMs;
  });
  if (planned) {
    return { ...base, state: "follow_up_planned", actionableAttemptId: null };
  }

  // ── La fuga ────────────────────────────────────────────────────────────────
  //
  // La llamada tuvo desenlace, no cerró, no hay turno por delante y nadie
  // definió qué sigue. El lead quedó sin dueño y sin fecha: es exactamente el
  // agujero que la Fase 2 viene a tapar.
  return { ...base, state: "stalled", actionableAttemptId: sorted[0]!.id };
}
