import type { ClosePaymentPayload } from "@/types/closing";

export function getPaidAmountFromClosePayload(payment: ClosePaymentPayload): number {
  if (payment.paidAmount > 0) return payment.paidAmount;
  if (payment.paymentType === "upfront") return payment.totalAmount ?? 0;
  if (payment.paymentType === "installments") return payment.installmentAmount ?? 0;
  return payment.upfrontAmount ?? 0;
}

export function getPaymentDateFromClosePayload(payment: ClosePaymentPayload): string {
  if (payment.paymentDate) return payment.paymentDate;
  if (payment.paymentType === "installments" && payment.firstInstallmentDate) {
    return payment.firstInstallmentDate;
  }
  return new Date().toISOString().slice(0, 10);
}

export function installmentNumberForClosePayload(
  payment: ClosePaymentPayload
): number | null {
  return payment.paymentType === "installments" ? 1 : null;
}
