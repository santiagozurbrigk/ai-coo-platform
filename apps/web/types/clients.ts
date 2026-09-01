import type { PaymentPlatform } from "@/types/closing";
import type { DeepCallAnalysis } from "@/types/call-analysis";

export type ClientLinkedCall = {
  id: string;
  title: string;
  date: string;
  duration: string;
  url: string;
  fathomCallId?: string;
  closerName?: string;
  analysis?: DeepCallAnalysis;
};

export type ClientStatus =
  | "pending_onboarding"
  | "onboarding_done"
  | "active"
  | "success_case";

export type InstallmentStatus = "paid" | "pending";

export type ClientInstallment = {
  id: string;
  label: string;
  amount: number;
  status: InstallmentStatus;
  /** Fecha en que se cobró (YYYY-MM-DD). Obligatoria para cuotas pagadas tras la primera. */
  paidAt?: string;
  dueDate?: string;
};

export type ClientPayment = {
  id: string;
  clientId: string;
  amount: number;
  paymentDate: string;
  storagePath: string;
  mimeType?: string;
  installmentNumber?: number;
  paymentReceivedFrom?: string;
  paymentDestinationPlatformId?: string;
  uploadedBy?: string;
  createdAt: string;
};

export type Client = {
  id: string;
  name: string;
  nickname?: string;
  /**
   * Mail del cliente. Se hereda del lead al cerrar la venta.
   *
   * ⭐ La columna existía en la base pero la aplicación nunca la escribía: al
   * revisar, los 264 clientes cargados tenían el mail vacío. Es la identidad
   * estable que hila al lead con el cliente en que se convirtió.
   */
  email?: string | null;
  joinDate: string;
  paymentType: "upfront" | "installments" | "upfront_fee";
  platform: PaymentPlatform;
  totalAmount: number;
  upfrontAmount?: number;
  feeAmount?: number;
  feeFrequency?: "monthly" | "weekly";
  status: ClientStatus;
  isSuccessCase: boolean;
  installments?: ClientInstallment[];
  salesFathomUrl?: string;
  closingCallId?: string;
  aiInsights: string[];
  linkedCalls: ClientLinkedCall[];
  offeredProduct?: string;
  feedbackNotes?: string;
  avatar?: string;
  mainPain?: string;
  objections?: string;
  /** UUID del plan asignado al cliente (referencia a public.plans) */
  planId?: string;
  /** ID del sistema de cuotas elegido dentro del plan */
  selectedInstallmentSystemId?: string;
};
