/**
 * Estados de una llamada de cierre.
 *
 * `attended` y `cancelled` se agregaron en la Fase 0 porque describen cosas que
 * pasan y no se podían representar: asistir sin resultado cargado (lo que
 * significa `showed` en GHL) y un turno que se canceló antes de ocurrir.
 *
 * Las etiquetas y los predicados viven en `lib/closing/call-status.ts`.
 * No compares contra estos strings a mano: preguntale a ese módulo.
 */
export type ClosingCallStatus =
  | "scheduled"
  | "attended"
  | "closed"
  | "not_closed"
  | "no_show"
  | "cancelled";

/** Quién fijó el estado actual. Los syncs no pisan lo que marcó una persona. */
export type ClosingCallStatusSource = "sync" | "manual";

/** Autor de la cancelación. `unknown` cuando el proveedor no lo informa. */
export type ClosingCallCancelledBy = "lead" | "closer" | "unknown";

export type CalendlyFormAnswer = {
  question: string;
  answer: string;
};

export type ClosingOutcome = {
  paymentType?: "upfront" | "installments" | "upfront_fee";
  revenue?: number;
  noCloseReason?: string;
  notes?: string;
};

export type ClosingCallSource = "calendly" | "ghl" | "manual";

export type ClosingCall = {
  id: string;
  leadName: string;
  scheduledAt: string;
  status: ClosingCallStatus;
  conversationId?: string;
  formAnswers: CalendlyFormAnswer[];
  fathomUrl?: string;
  outcome?: ClosingOutcome;
  /** Quién marcó el deal como cerrado (Fase 0 — mock) */
  closedByName?: string;
  paymentSourcePlatformId?: string;
  paymentDestinationPlatformId?: string;
  paymentReceivedFrom?: string;
  /** Origen de la llamada: Calendly, GHL o cargada manualmente */
  source?: ClosingCallSource;
  /** Quién fijó el estado actual. Los syncs respetan `manual`. */
  statusSource?: ClosingCallStatusSource;
  /** Autor de la cancelación, cuando la llamada está cancelada. */
  cancelledBy?: ClosingCallCancelledBy;
  /** Identidad estable del lead, para hilar reagendas entre turnos. */
  leadEmail?: string | null;
  leadPhone?: string | null;
  /** Atribución UTM del contacto en GHL (disponible para llamadas de origen GHL) */
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  utmContent?: string | null;
  utmTerm?: string | null;
  /** ID del calendario GHL al que pertenece esta llamada (para filtrar por calendario) */
  ghlCalendarId?: string | null;
};

export type PaymentPlatform =
  | "stripe"
  | "mercadopago"
  | "paypal"
  | "bank_transfer"
  | "other";

export type NoCloseReasonId =
  | "price"
  | "timing"
  | "think"
  | "partner"
  | "not_qualified"
  | "no_show"
  | "other";

export type PaymentProofMeta = {
  storagePath: string;
  mimeType: string;
  fileName: string;
};

export type ClosePaymentPayload = {
  clientName: string;
  /** Texto libre: de dónde vino el pago del lead (banco, billetera, etc.). */
  paymentReceivedFrom: string;
  /** Plataforma de cobro configurada en Configuración. */
  paymentDestinationPlatformId: string;
  closedByName?: string;
  paymentType: "upfront" | "installments" | "upfront_fee";
  totalAmount?: number;
  installmentCount?: number;
  installmentAmount?: number;
  firstInstallmentDate?: string;
  upfrontAmount?: number;
  feeAmount?: number;
  feeFrequency?: "monthly" | "weekly";
  fathomUrl?: string;
  offeredProduct?: string;
  feedbackNotes?: string;
  avatar?: string;
  mainPain?: string;
  objections?: string;
  /** Monto efectivamente pagado en este cierre (primera cuota o pago único). */
  paidAmount: number;
  /** Fecha del pago registrado (YYYY-MM-DD). */
  paymentDate: string;
  proof: PaymentProofMeta;
  /**
   * Si el closer overrideó los montos por cuota manualmente (aplica cuando
   * paymentType === "installments").
   * Longitud = installmentCount. Cuando está presente, reemplaza installmentAmount
   * uniforme; cada posición tiene el monto real acordado para esa cuota.
   */
  customInstallmentAmounts?: number[];
  /** UUID del plan seleccionado al cerrar (opcional). */
  planId?: string;
  /** ID del sistema de cuotas elegido dentro del plan (opcional). */
  selectedInstallmentSystemId?: string;
};
