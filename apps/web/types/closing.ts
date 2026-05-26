export type ClosingCallStatus = "scheduled" | "closed" | "not_closed" | "no_show";

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

export type ClosePaymentPayload = {
  clientName: string;
  platform: PaymentPlatform;
  paymentSourcePlatformId?: string;
  paymentDestinationPlatformId?: string;
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
};
