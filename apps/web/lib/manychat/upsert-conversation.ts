import type { SupabaseClient } from "@supabase/supabase-js";
import type { ConversationAnalysis, SalesMessage } from "@/types/sales";

export type ManyChatConversationInbound = {
  subscriberId: string;
  leadName: string;
  messageText: string;
  sender?: "lead" | "team";
  timestamp?: string;
};

type ConversationRow = {
  id: string;
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

export async function upsertConversationFromManyChat(
  supabase: SupabaseClient,
  organizationId: string,
  inbound: ManyChatConversationInbound
): Promise<{ inserted: boolean; updated: boolean }> {
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
    return { inserted: false, updated: true };
  }

  const { error: insertError } = await supabase.from("conversations").insert({
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
  });

  if (insertError) throw new Error(insertError.message);
  return { inserted: true, updated: false };
}
