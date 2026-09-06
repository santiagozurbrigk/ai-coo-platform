import type { ClientPayment } from "@/types/clients";

export type ClientPaymentRow = {
  id: string;
  client_id: string;
  organization_id: string;
  amount: number | string;
  payment_date: string;
  storage_path: string | null;
  mime_type: string | null;
  installment_number: number | null;
  payment_received_from: string | null;
  payment_destination_platform_id: string | null;
  uploaded_by: string | null;
  created_at: string;
};

export function rowToClientPayment(row: ClientPaymentRow): ClientPayment {
  return {
    id: row.id,
    clientId: row.client_id,
    amount: Number(row.amount),
    paymentDate: row.payment_date,
    storagePath: row.storage_path ?? null,
    mimeType: row.mime_type ?? undefined,
    installmentNumber: row.installment_number ?? undefined,
    paymentReceivedFrom: row.payment_received_from ?? undefined,
    paymentDestinationPlatformId:
      row.payment_destination_platform_id ?? undefined,
    uploadedBy: row.uploaded_by ?? undefined,
    createdAt: row.created_at,
  };
}
