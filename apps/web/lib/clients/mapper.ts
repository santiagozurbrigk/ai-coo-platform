import type { Client, ClientInstallment } from "@/types/clients";
import type { PaymentPlatform } from "@/types/closing";

export type ClientRow = {
  id: string;
  organization_id: string;
  name: string;
  join_date: string;
  payment_type: Client["paymentType"];
  platform: PaymentPlatform;
  total_amount: number;
  upfront_amount: number | null;
  fee_amount: number | null;
  fee_frequency: Client["feeFrequency"] | null;
  status: Client["status"];
  is_success_case: boolean;
  installments: ClientInstallment[] | null;
  sales_fathom_url: string | null;
  closing_call_id: string | null;
  ai_insights: string[] | null;
  linked_calls: Client["linkedCalls"] | null;
  created_at?: string;
  updated_at?: string;
};

export function rowToClient(row: ClientRow): Client {
  return {
    id: row.id,
    name: row.name,
    joinDate: row.join_date,
    paymentType: row.payment_type,
    platform: row.platform,
    totalAmount: Number(row.total_amount),
    upfrontAmount: row.upfront_amount != null ? Number(row.upfront_amount) : undefined,
    feeAmount: row.fee_amount != null ? Number(row.fee_amount) : undefined,
    feeFrequency: row.fee_frequency ?? undefined,
    status: row.status,
    isSuccessCase: row.is_success_case,
    installments: row.installments ?? undefined,
    salesFathomUrl: row.sales_fathom_url ?? undefined,
    closingCallId: row.closing_call_id ?? undefined,
    aiInsights: row.ai_insights ?? [],
    linkedCalls: row.linked_calls ?? [],
  };
}

export function clientToInsertRow(
  client: Omit<Client, "id">,
  organizationId: string
): Omit<ClientRow, "id" | "created_at" | "updated_at"> {
  return {
    organization_id: organizationId,
    name: client.name,
    join_date: client.joinDate,
    payment_type: client.paymentType,
    platform: client.platform,
    total_amount: client.totalAmount,
    upfront_amount: client.upfrontAmount ?? null,
    fee_amount: client.feeAmount ?? null,
    fee_frequency: client.feeFrequency ?? null,
    status: client.status,
    is_success_case: client.isSuccessCase,
    installments: client.installments ?? [],
    sales_fathom_url: client.salesFathomUrl ?? null,
    closing_call_id: client.closingCallId ?? null,
    ai_insights: client.aiInsights,
    linked_calls: client.linkedCalls,
  };
}

export function patchToUpdateRow(
  patch: Partial<Client>
): Partial<ClientRow> {
  const row: Partial<ClientRow> = {};
  if (patch.name != null) row.name = patch.name;
  if (patch.joinDate != null) row.join_date = patch.joinDate;
  if (patch.paymentType != null) row.payment_type = patch.paymentType;
  if (patch.platform != null) row.platform = patch.platform;
  if (patch.totalAmount != null) row.total_amount = patch.totalAmount;
  if (patch.upfrontAmount !== undefined) row.upfront_amount = patch.upfrontAmount ?? null;
  if (patch.feeAmount !== undefined) row.fee_amount = patch.feeAmount ?? null;
  if (patch.feeFrequency !== undefined) row.fee_frequency = patch.feeFrequency ?? null;
  if (patch.status != null) row.status = patch.status;
  if (patch.isSuccessCase != null) row.is_success_case = patch.isSuccessCase;
  if (patch.installments !== undefined) row.installments = patch.installments ?? [];
  if (patch.salesFathomUrl !== undefined) row.sales_fathom_url = patch.salesFathomUrl ?? null;
  if (patch.closingCallId !== undefined) row.closing_call_id = patch.closingCallId ?? null;
  if (patch.aiInsights != null) row.ai_insights = patch.aiInsights;
  if (patch.linkedCalls != null) row.linked_calls = patch.linkedCalls;
  row.updated_at = new Date().toISOString();
  return row;
}
