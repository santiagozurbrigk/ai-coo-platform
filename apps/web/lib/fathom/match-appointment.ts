import { normalizeEmail } from "@/lib/fathom/invitees";

/**
 * Cruce entre una grabación de Fathom y un turno agendado (`closing_calls`).
 *
 * ⭐ **Es toda la regla del módulo.** OTC registra **únicamente llamadas de
 * venta**, y una grabación es una llamada de venta cuando el mail de alguno de
 * sus participantes coincide con el del lead de un turno y el horario
 * corresponde. Lo que no cruza no es un error ni algo a revisar: simplemente no
 * es una llamada de venta.
 *
 * ⭐ **El horario no tiene faltas de ortografía.** El cruce anterior era un
 * `ilike '%nombre%'` que tomaba el turno más reciente sin mirar fechas. Los
 * nombres de la base vienen con emojis y dobles espacios (`"🩷 Diana
 * Villarreal"`, `"Bastián  Sesión de Consultoría 🚀"`); las marcas de tiempo, no.
 *
 * ⭐ **El match provisional es temporal, y se apaga solo.** Los turnos todavía no
 * tienen mail: `lead_email` se agregó en la Fase 0 y se llena a medida que
 * corren los syncs. Con la regla estricta no se asociaría **ninguna** llamada
 * durante semanas. Por eso un solo turno dentro de una ventana corta alcanza
 * para asociar, marcado como `provisional` para que se pueda distinguir de un
 * cruce confirmado. Cuando los turnos tengan mail, este camino deja de usarse
 * por sí mismo: el match por mail siempre gana.
 */

export type AppointmentCandidate = {
  id: string;
  scheduledAt: string;
  leadName: string | null;
  leadEmail: string | null;
};

export type MatchConfidence =
  /** Mail y horario coinciden: es esa llamada, sin ambigüedad. */
  | "confirmed"
  /** Sólo el horario, y un único turno posible. Se revisa cuando haya mails. */
  | "provisional";

export type AppointmentMatch = {
  appointmentId: string;
  confidence: MatchConfidence;
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
  /** Varios turnos igual de plausibles: asociar sería adivinar. */
  | "ambiguous";

/**
 * Ventana para un cruce confirmado por mail.
 *
 * Amplia a propósito: el mail ya dice de quién es la llamada, así que la hora
 * sólo corrobora. Cubre que la llamada arranque tarde o se corra dentro del día.
 */
export const EMAIL_MATCH_WINDOW_MINUTES = 12 * 60;

/**
 * Ventana para un cruce provisional, sin mail.
 *
 * Ajustada: sin mail, el solapamiento es lo único que sostiene el vínculo.
 * 45 minutos cubre el arranque tarde de una llamada sin llegar al turno
 * siguiente.
 */
export const TIME_ONLY_WINDOW_MINUTES = 45;

function minutesBetween(a: number, b: number): number {
  return Math.abs(a - b) / 60_000;
}

/**
 * Decide a qué turno corresponde una grabación.
 *
 * Puro: recibe los candidatos ya consultados. La consulta vive en el resolver.
 */
export function matchRecordingToAppointment(params: {
  recordingStart: string | null | undefined;
  /** Mails de los participantes de la grabación. */
  participantEmails: string[];
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
    params.participantEmails
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

  const withEmail = scored.filter((s) => s.byEmail);

  // ── Camino confirmado ──────────────────────────────────────────────────────
  if (withEmail.length > 0) {
    withEmail.sort((a, b) => a.minutes - b.minutes);

    // El mismo lead con dos turnos a la misma hora: no hay forma de elegir.
    if (
      withEmail.length > 1 &&
      Math.abs(withEmail[1]!.minutes - withEmail[0]!.minutes) < 1
    ) {
      return { status: "no_match", reason: "ambiguous" };
    }

    const best = withEmail[0]!;
    return {
      status: "matched",
      match: {
        appointmentId: best.candidate.id,
        confidence: "confirmed",
        minutesApart: Math.round(best.minutes),
      },
    };
  }

  // ── Camino provisional ─────────────────────────────────────────────────────
  //
  // Sin mail, sólo se asocia cuando hay **un único** turno en la ventana. Con
  // dos candidatos elegir el más cercano sería adivinar, y un vínculo mal hecho
  // le adjudica a un lead una llamada que no tuvo.
  if (scored.length > 1) {
    return { status: "no_match", reason: "ambiguous" };
  }

  const only = scored[0]!;
  return {
    status: "matched",
    match: {
      appointmentId: only.candidate.id,
      confidence: "provisional",
      minutesApart: Math.round(only.minutes),
    },
  };
}
