import { normalizeEmail } from "@/lib/fathom/invitees";

/**
 * Cruce entre una grabación de Fathom y un turno agendado (`closing_calls`).
 *
 * ⭐ **Es la señal más fuerte del módulo, y no depende de nadie.** Funciona
 * aunque el título esté vacío y aunque nadie configure tipos de reunión: si una
 * grabación arranca dentro de la ventana de un turno y el mail de un invitado
 * coincide con el del lead de ese turno, **es esa llamada de venta**.
 *
 * ⭐ **El horario no tiene faltas de ortografía.** El cruce anterior era un
 * `ilike '%nombre%'` que tomaba el turno más reciente sin mirar fechas. Los
 * nombres de la base vienen con emojis y dobles espacios (`"🩷 Diana
 * Villarreal"`, `"Bastián  Sesión de Consultoría 🚀"`); las marcas de tiempo, no.
 *
 * ⭐ **Dos señales independientes.** Mail y horario se confirman entre sí. Con
 * las dos, la confianza es alta y la ventana puede ser amplia —una llamada puede
 * arrancar tarde—. Con una sola, la ventana se achica y la confianza baja. Sin
 * ninguna, no hay match: preferimos no vincular a vincular mal.
 */

export type AppointmentCandidate = {
  id: string;
  scheduledAt: string;
  leadName: string | null;
  leadEmail: string | null;
};

export type AppointmentMatch = {
  appointmentId: string;
  confidence: "high" | "medium";
  /** Qué señales coincidieron. Se guarda para poder auditar un vínculo. */
  matchedOn: ("email" | "time")[];
  minutesApart: number;
};

export type AppointmentMatchResult =
  | { status: "matched"; match: AppointmentMatch }
  | { status: "no_match"; reason: NoMatchReason };

export type NoMatchReason =
  /** La grabación no tiene hora de inicio utilizable. */
  | "no_recording_time"
  /** No había turnos en el período consultado. */
  | "no_candidates"
  /** Ninguno cayó dentro de la ventana ni coincidió por mail. */
  | "outside_window"
  /** Varios turnos igual de plausibles: vincular sería adivinar. */
  | "ambiguous";

/**
 * Ventana amplia, para cuando el mail ya confirmó de quién es la llamada.
 *
 * Cubre que la llamada arranque tarde o que se corra dentro del día sin que se
 * actualice el turno.
 */
export const EMAIL_MATCH_WINDOW_MINUTES = 12 * 60;

/**
 * Ventana ajustada, para cuando lo único que hay es la coincidencia horaria.
 *
 * Sin mail, sólo el solapamiento sostiene el vínculo: 45 minutos cubre el
 * arranque tarde de una llamada sin llegar a tocar el turno siguiente.
 */
export const TIME_ONLY_WINDOW_MINUTES = 45;

function minutesBetween(a: number, b: number): number {
  return Math.abs(a - b) / 60_000;
}

/**
 * Elige el turno al que corresponde una grabación.
 *
 * Puro: recibe los candidatos ya consultados. La consulta vive en el resolver.
 */
export function matchRecordingToAppointment(params: {
  recordingStart: string | null | undefined;
  inviteeEmails: string[];
  candidates: AppointmentCandidate[];
}): AppointmentMatchResult {
  const startedAt = params.recordingStart
    ? new Date(params.recordingStart).getTime()
    : NaN;

  if (Number.isNaN(startedAt)) {
    return { status: "no_match", reason: "no_recording_time" };
  }
  if (params.candidates.length === 0) {
    return { status: "no_match", reason: "no_candidates" };
  }

  const emails = new Set(
    params.inviteeEmails
      .map((email) => normalizeEmail(email))
      .filter((email): email is string => Boolean(email))
  );

  type Scored = { candidate: AppointmentCandidate; minutes: number; byEmail: boolean };
  const scored: Scored[] = [];

  for (const candidate of params.candidates) {
    const scheduled = new Date(candidate.scheduledAt).getTime();
    if (Number.isNaN(scheduled)) continue;

    const minutes = minutesBetween(startedAt, scheduled);
    const candidateEmail = normalizeEmail(candidate.leadEmail);
    const byEmail = Boolean(candidateEmail && emails.has(candidateEmail));

    const window = byEmail ? EMAIL_MATCH_WINDOW_MINUTES : TIME_ONLY_WINDOW_MINUTES;
    if (minutes <= window) scored.push({ candidate, minutes, byEmail });
  }

  if (scored.length === 0) {
    return { status: "no_match", reason: "outside_window" };
  }

  // Con mail coincidente siempre gana, por lejos que esté en el tiempo: es la
  // señal de identidad, y la hora es sólo corroboración.
  const withEmail = scored.filter((s) => s.byEmail);
  const pool = withEmail.length > 0 ? withEmail : scored;
  pool.sort((a, b) => a.minutes - b.minutes);

  const best = pool[0]!;

  // Empate real: dos turnos del mismo lead a la misma hora, o dos turnos
  // distintos igual de cerca sin mail que los separe. Vincular sería elegir al
  // azar, así que se manda a revisión.
  const runnerUp = pool[1];
  if (runnerUp && Math.abs(runnerUp.minutes - best.minutes) < 1) {
    return { status: "no_match", reason: "ambiguous" };
  }

  const matchedOn: ("email" | "time")[] = best.byEmail ? ["email"] : [];
  if (best.minutes <= TIME_ONLY_WINDOW_MINUTES) matchedOn.push("time");

  return {
    status: "matched",
    match: {
      appointmentId: best.candidate.id,
      // Alta sólo cuando las dos señales independientes coinciden.
      confidence: matchedOn.length === 2 ? "high" : "medium",
      matchedOn,
      minutesApart: Math.round(best.minutes),
    },
  };
}
