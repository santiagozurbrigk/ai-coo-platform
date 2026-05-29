import type { PaymentPlatform } from "@/types/closing";

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
  proofLabel?: string;
};

export type Client = {
  id: string;
  name: string;
  nickname?: string;
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
  linkedCalls: { id: string; title: string; date: string; duration: string; url: string }[];
};
