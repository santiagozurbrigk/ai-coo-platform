import type { ClientPayment } from "@/types/clients";

export type ClientPaymentRow = {
  id: string;
  client_id: string;
  organization_id: string;
  amount: number | string;
  payment_date: string;
  storage_path: string;
  mime_type: string | null;
  installment_number: number | null;
  uploaded_by: string | null;
  created_at: string;
};

export function rowToClientPayment(row: ClientPaymentRow): ClientPayment {
  return {
    id: row.id,
    clientId: row.client_id,
    amount: Number(row.amount),
    paymentDate: row.payment_date,
    storagePath: row.storage_path,
    mimeType: row.mime_type ?? undefined,
    installmentNumber: row.installment_number ?? undefined,
    uploadedBy: row.uploaded_by ?? undefined,
    createdAt: row.created_at,
  };
}
