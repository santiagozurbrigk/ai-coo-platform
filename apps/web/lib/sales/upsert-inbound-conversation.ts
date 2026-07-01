import type { SupabaseClient } from "@supabase/supabase-js";
import { scoreConversation } from "@/lib/manychat/score-conversation";
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
  messages: SalesMessage[];
};

function defaultAnalysis(syncInsight: string): ConversationAnalysis {
  return {
    responseTimeMinutes: 0,
    ghostingRisk: "medium",
    bookingSignal: false,
    insights: [syncInsight],
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
}) {
  const shouldScore =
    params.messages.length >= 3 && params.messages.length % 5 === 0;

  if (!shouldScore) return;

  void scoreConversation({
    organizationId: params.organizationId,
    conversationId: params.conversationId,
    messages: toScoringMessages(params.messages),
    leadName: params.leadName,
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
    afterUpsert?: (conversationId: string) => Promise<void>;
  }
): Promise<InboundConversationUpsertResult> {
  const { externalRef, source, inbound, syncInsight, messageIdPrefix, afterUpsert } =
    options;
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
    .select("id, messages")
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
    const { error: updateError } = await supabase
      .from("conversations")
      .update({
        lead_name: inbound.leadName,
        last_message: inbound.messageText,
        last_message_at: timestamp,
        unread: sender === "lead",
        messages,
        source,
        updated_at: new Date().toISOString(),
      })
      .eq("id", row.id);

    if (updateError) throw new Error(updateError.message);

    if (afterUpsert) await afterUpsert(row.id);

    triggerConversationScoring({
      organizationId,
      conversationId: row.id,
      messages,
      leadName: inbound.leadName,
    });

    return {
      inserted: false,
      updated: true,
      conversationId: row.id,
      messages,
    };
  }

  const messages = [newMessage];
  const { data: inserted, error: insertError } = await supabase
    .from("conversations")
    .insert({
      organization_id: organizationId,
      lead_name: inbound.leadName,
      status: "active",
      tag: null,
      last_message: inbound.messageText,
      last_message_at: timestamp,
      unread: sender === "lead",
      messages,
      analysis: defaultAnalysis(syncInsight),
      external_ref: externalRef,
      source,
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
    leadName: inbound.leadName,
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
