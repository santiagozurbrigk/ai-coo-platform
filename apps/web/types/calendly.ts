export type CalendlyQA = {
  question: string;
  answer: string;
};

/** Fragmento del payload de webhooks Calendly (invitee.*). */
export type CalendlyWebhookInviteePayload = {
  uri?: string;
  email?: string;
  name?: string;
  first_name?: string;
  last_name?: string;
  firstName?: string;
  lastName?: string;
  questions_and_answers?: Array<{
    question?: string;
    answer?: string | number | null;
  }>;
  scheduled_event?: { start_time?: string; end_time?: string };
  event?: string | { start_time?: string; uri?: string };
  start_time?: string;
  invitee?: string | { uri?: string };
  routing_form_submission?: string | { uri?: string };
};

export type CalendlyWebhookBody = {
  event?: string;
  payload?: CalendlyWebhookInviteePayload;
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
  statusHint?: "scheduled" | "not_closed" | "no_show" | "cancelled";
};

