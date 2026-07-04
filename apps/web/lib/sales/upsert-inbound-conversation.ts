import type { SupabaseClient } from "@supabase/supabase-js";
import { scoreConversation } from "@/lib/manychat/score-conversation";
import { pickInboundLeadName } from "@/lib/sales/lead-name";
import type { ConversationAnalysis, ConversationSource, SalesMessage } from "@/types/sales";

export type InboundConversationPayload = {
  leadName: string;
  messageText: string;
  sender?: "lead" | "team";
  timestamp?: string;
  messageId?: string;
  ref?: string;
};

export type InboundConversationUpsertResult = {
  inserted: boolean;
  updated: boolean;
  conversationId: string;
  messages: SalesMessage[];
};

type ConversationRow = {
  id: string;
  lead_name?: string;
  messages: SalesMessage[];
  analysis?: ConversationAnalysis;
};

function defaultAnalysis(
  syncInsight: string,
  responseTimeMinutes: number
): ConversationAnalysis {
  return {
    responseTimeMinutes,
    ghostingRisk: "medium",
    bookingSignal: false,
    insights: [syncInsight],
  };
}

function computeAverageResponseTimeMinutes(messages: SalesMessage[]): number {
  const deltas: number[] = [];

  for (let i = 0; i < messages.length; i++) {
    if (messages[i].sender !== "lead") continue;

    for (let j = i + 1; j < messages.length; j++) {
      if (messages[j].sender !== "team") continue;

      const leadMs = new Date(messages[i].timestamp).getTime();
      const teamMs = new Date(messages[j].timestamp).getTime();
      if (
        Number.isFinite(leadMs) &&
        Number.isFinite(teamMs) &&
        teamMs >= leadMs
      ) {
        deltas.push((teamMs - leadMs) / 60_000);
      }
      break;
    }
  }

  if (deltas.length === 0) return 0;
  return Math.round(deltas.reduce((sum, delta) => sum + delta, 0) / deltas.length);
}

function buildAnalysisFromMessages(
  priorAnalysis: ConversationAnalysis | undefined,
  messages: SalesMessage[],
  syncInsight: string
): ConversationAnalysis {
  const responseTimeMinutes = computeAverageResponseTimeMinutes(messages);
  const base = priorAnalysis ?? defaultAnalysis(syncInsight, responseTimeMinutes);

  return {
    ...base,
    responseTimeMinutes,
  };
}

function toScoringMessages(messages: SalesMessage[]) {
  return messages.map((m) => ({
    sender: m.sender,
    message: m.content,
    timestamp: m.timestamp,
  }));
}

function triggerConversationScoring(params: {
  organizationId: string;
  conversationId: string;
  messages: SalesMessage[];
  leadName: string;
  source: ConversationSource;
}) {
  const shouldScore =
    params.messages.length >= 3 && params.messages.length % 5 === 0;

  if (!shouldScore) return;

  void scoreConversation({
    organizationId: params.organizationId,
    conversationId: params.conversationId,
    messages: toScoringMessages(params.messages),
    leadName: params.leadName,
    source: params.source,
  }).catch((err) => {
    console.error("[UpsertInboundConversation] Error en scoring:", err);
  });
}

function buildMessageId(prefix: string, inbound: InboundConversationPayload): string {
  if (inbound.messageId) return `${prefix}-${inbound.messageId}`;
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export async function upsertInboundConversation(
  supabase: SupabaseClient,
  organizationId: string,
  options: {
    externalRef: string;
    source: ConversationSource;
    inbound: InboundConversationPayload;
    syncInsight: string;
    messageIdPrefix: string;
    unipileAccountId?: string;
    leadUnipileAttendeeId?: string;
    afterUpsert?: (conversationId: string) => Promise<void>;
  }
): Promise<InboundConversationUpsertResult> {
  const {
    externalRef,
    source,
    inbound,
    syncInsight,
    messageIdPrefix,
    unipileAccountId,
    leadUnipileAttendeeId,
    afterUpsert,
  } = options;
  const timestamp = inbound.timestamp ?? new Date().toISOString();
  const sender = inbound.sender ?? "lead";
  const messageId = buildMessageId(messageIdPrefix, inbound);
  const newMessage: SalesMessage = {
    id: messageId,
    sender,
    content: inbound.messageText,
    timestamp,
  };

  const { data: existing, error: selectError } = await supabase
    .from("conversations")
    .select("id, lead_name, messages, analysis")
    .eq("organization_id", organizationId)
    .eq("external_ref", externalRef)
    .maybeSingle();

  if (selectError) throw new Error(selectError.message);

  if (existing) {
    const row = existing as ConversationRow;
    const priorMessages = row.messages ?? [];
    if (priorMessages.some((m) => m.id === messageId)) {
      return {
        inserted: false,
        updated: false,
        conversationId: row.id,
        messages: priorMessages,
      };
    }

    const messages = [...priorMessages, newMessage];
    const leadName = pickInboundLeadName(row.lead_name, inbound.leadName, false);
    const analysis = buildAnalysisFromMessages(row.analysis, messages, syncInsight);
    const updatePayload: Record<string, unknown> = {
      lead_name: leadName,
      last_message: inbound.messageText,
      last_message_at: timestamp,
      unread: sender === "lead",
      messages,
      analysis,
      source,
      updated_at: new Date().toISOString(),
    };
    if (unipileAccountId) {
      updatePayload.unipile_account_id = unipileAccountId;
    }
    if (leadUnipileAttendeeId) {
      updatePayload.lead_unipile_attendee_id = leadUnipileAttendeeId;
    }
    const { error: updateError } = await supabase
      .from("conversations")
      .update(updatePayload)
      .eq("id", row.id);

    if (updateError) throw new Error(updateError.message);

    if (afterUpsert) await afterUpsert(row.id);

    triggerConversationScoring({
      organizationId,
      conversationId: row.id,
      messages,
      leadName,
      source,
    });

    return {
      inserted: false,
      updated: true,
      conversationId: row.id,
      messages,
    };
  }

  const messages = [newMessage];
  const leadName = pickInboundLeadName(null, inbound.leadName, true);
  const { data: inserted, error: insertError } = await supabase
    .from("conversations")
    .insert({
      organization_id: organizationId,
      lead_name: leadName,
      status: "active",
      tag: null,
      last_message: inbound.messageText,
      last_message_at: timestamp,
      unread: sender === "lead",
      messages,
      analysis: defaultAnalysis(syncInsight, 0),
      external_ref: externalRef,
      source,
      unipile_account_id: unipileAccountId ?? null,
      lead_unipile_attendee_id: leadUnipileAttendeeId ?? null,
    })
    .select("id")
    .single();

  if (insertError) throw new Error(insertError.message);
  if (!inserted?.id) throw new Error("No se pudo crear la conversación");

  if (afterUpsert) await afterUpsert(inserted.id);

  triggerConversationScoring({
    organizationId,
    conversationId: inserted.id,
    messages,
    leadName,
    source,
  });

  return {
    inserted: true,
    updated: false,
    conversationId: inserted.id,
    messages,
  };
}

export function unipileExternalRef(
  provider: "instagram" | "whatsapp",
  chatId: string
): string {
  return `unipile:${provider}:${chatId}`;
}
