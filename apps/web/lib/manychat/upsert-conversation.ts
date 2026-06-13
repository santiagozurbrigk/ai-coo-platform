import type { SupabaseClient } from "@supabase/supabase-js";
import { attributeConversationFromManyChatRef } from "@/lib/utm/attribute-manychat-ref";
import type { ConversationAnalysis, SalesMessage } from "@/types/sales";
import { scoreConversation } from "./score-conversation";

export type ManyChatConversationInbound = {
  subscriberId: string;
  leadName: string;
  messageText: string;
  sender?: "lead" | "team";
  timestamp?: string;
  ref?: string;
};

type ConversationRow = {
  id: string;
  messages: SalesMessage[];
};

export type ManyChatUpsertResult = {
  inserted: boolean;
  updated: boolean;
  conversationId: string;
  messages: SalesMessage[];
};

function defaultAnalysis(): ConversationAnalysis {
  return {
    responseTimeMinutes: 0,
    ghostingRisk: "medium",
    bookingSignal: false,
    insights: ["Sincronizado desde ManyChat"],
  };
}

export function manyChatExternalRef(subscriberId: string): string {
  return `manychat:${subscriberId}`;
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
    console.error("[UpsertConversation] Error en scoring:", err);
  });
}

export async function upsertConversationFromManyChat(
  supabase: SupabaseClient,
  organizationId: string,
  inbound: ManyChatConversationInbound
): Promise<ManyChatUpsertResult> {
  const externalRef = manyChatExternalRef(inbound.subscriberId);
  const timestamp = inbound.timestamp ?? new Date().toISOString();
  const sender = inbound.sender ?? "lead";
  const newMessage: SalesMessage = {
    id: `mc-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
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
    const messages = [...(row.messages ?? []), newMessage];
    const { error: updateError } = await supabase
      .from("conversations")
      .update({
        lead_name: inbound.leadName,
        last_message: inbound.messageText,
        last_message_at: timestamp,
        unread: sender === "lead",
        messages,
        updated_at: new Date().toISOString(),
      })
      .eq("id", row.id);

    if (updateError) throw new Error(updateError.message);

    if (inbound.ref) {
      await attributeConversationFromManyChatRef(
        supabase,
        organizationId,
        row.id,
        inbound.ref,
        externalRef
      );
    }

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
      messages: [newMessage],
      analysis: defaultAnalysis(),
      external_ref: externalRef,
    })
    .select("id")
    .single();

  if (insertError) throw new Error(insertError.message);
  if (!inserted?.id) throw new Error("No se pudo crear la conversación");

  const messages = [newMessage];

  if (inbound.ref) {
    await attributeConversationFromManyChatRef(
      supabase,
      organizationId,
      inserted.id,
      inbound.ref,
      externalRef
    );
  }

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
