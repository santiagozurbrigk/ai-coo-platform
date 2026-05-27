export type CalendlyQA = {
  question: string;
  answer: string;
};

export type CalendlyEventSyncPayload = {
  /** Identificador único del evento en Calendly (id/slug). */
  eventId: string;
  /** ISO string (ej: "2026-05-27T10:00:00Z") */
  startTime: string;
  inviteeName: string;
  inviteeEmail?: string;
  /** URL del evento en Calendly (opcional, para debugging/links). */
  url?: string;
  /** Respuestas del formulario previo (pregunta/respuesta). */
  questionsAndAnswers?: CalendlyQA[];
  /**
   * Estado sugerido para closing_calls (solo si la llamada NO está marcada como closed).
   * Ej: "scheduled", "no_show".
   */
  statusHint?: "scheduled" | "not_closed" | "no_show";
};

