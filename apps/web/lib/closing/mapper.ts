import type {
  CalendlyFormAnswer,
  ClosingCall,
  ClosingCallStatus,
  ClosingOutcome,
} from "@/types/closing";

export type ClosingCallRow = {
  id: string;
  organization_id: string;
  lead_name: string;
  scheduled_at: string;
  status: ClosingCallStatus;
  conversation_id: string | null;
  form_answers: CalendlyFormAnswer[] | null;
  fathom_url: string | null;
  outcome: ClosingOutcome | null;
  closed_by_name: string | null;
  payment_source_platform_id: string | null;
  payment_destination_platform_id: string | null;
  payment_received_from: string | null;
  created_at?: string;
  updated_at?: string;
};

export function rowToClosingCall(row: ClosingCallRow): ClosingCall {
  return {
    id: row.id,
    leadName: row.lead_name,
    scheduledAt: row.scheduled_at,
    status: row.status,
    conversationId: row.conversation_id ?? undefined,
    formAnswers: row.form_answers ?? [],
    fathomUrl: row.fathom_url ?? undefined,
    outcome: row.outcome ?? undefined,
    closedByName: row.closed_by_name ?? undefined,
    paymentSourcePlatformId: row.payment_source_platform_id ?? undefined,
    paymentDestinationPlatformId: row.payment_destination_platform_id ?? undefined,
    paymentReceivedFrom: row.payment_received_from ?? undefined,
  };
}

export function closingCallToInsertRow(
  call: Omit<ClosingCall, "id">,
  organizationId: string
): Omit<ClosingCallRow, "id" | "created_at" | "updated_at"> {
  return {
    organization_id: organizationId,
    lead_name: call.leadName,
    scheduled_at: call.scheduledAt,
    status: call.status,
    conversation_id: call.conversationId ?? null,
    form_answers: call.formAnswers,
    fathom_url: call.fathomUrl ?? null,
    outcome: call.outcome ?? null,
    closed_by_name: call.closedByName ?? null,
    payment_source_platform_id: call.paymentSourcePlatformId ?? null,
    payment_destination_platform_id: call.paymentDestinationPlatformId ?? null,
    payment_received_from: call.paymentReceivedFrom ?? null,
  };
}

export function patchToClosingUpdateRow(
  patch: Partial<ClosingCall>
): Partial<ClosingCallRow> {
  const row: Partial<ClosingCallRow> = { updated_at: new Date().toISOString() };

  if (patch.leadName != null) row.lead_name = patch.leadName;
  if (patch.scheduledAt != null) row.scheduled_at = patch.scheduledAt;
  if (patch.status != null) row.status = patch.status;
  if (patch.conversationId !== undefined) {
    row.conversation_id = patch.conversationId ?? null;
  }
  if (patch.formAnswers != null) row.form_answers = patch.formAnswers;
  if (patch.fathomUrl !== undefined) row.fathom_url = patch.fathomUrl ?? null;
  if (patch.outcome !== undefined) row.outcome = patch.outcome ?? null;
  if (patch.closedByName !== undefined) row.closed_by_name = patch.closedByName ?? null;
  if (patch.paymentSourcePlatformId !== undefined) {
    row.payment_source_platform_id = patch.paymentSourcePlatformId ?? null;
  }
  if (patch.paymentDestinationPlatformId !== undefined) {
    row.payment_destination_platform_id = patch.paymentDestinationPlatformId ?? null;
  }
  if (patch.paymentReceivedFrom !== undefined) {
    row.payment_received_from = patch.paymentReceivedFrom ?? null;
  }

  return row;
}
