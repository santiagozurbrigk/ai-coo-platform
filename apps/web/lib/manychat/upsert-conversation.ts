import type { SupabaseClient } from "@supabase/supabase-js";
import { attributeConversationFromManyChatRef } from "@/lib/utm/attribute-manychat-ref";
import {
  upsertInboundConversation,
  type InboundConversationUpsertResult,
} from "@/lib/sales/upsert-inbound-conversation";

export type ManyChatConversationInbound = {
  subscriberId: string;
  leadName: string;
  messageText: string;
  sender?: "lead" | "team";
  timestamp?: string;
  ref?: string;
};

export type ManyChatUpsertResult = InboundConversationUpsertResult;

export function manyChatExternalRef(subscriberId: string): string {
  return `manychat:${subscriberId}`;
}

export async function upsertConversationFromManyChat(
  supabase: SupabaseClient,
  organizationId: string,
  inbound: ManyChatConversationInbound
): Promise<ManyChatUpsertResult> {
  const externalRef = manyChatExternalRef(inbound.subscriberId);

  return upsertInboundConversation(supabase, organizationId, {
    externalRef,
    source: "manychat",
    inbound: {
      leadName: inbound.leadName,
      messageText: inbound.messageText,
      sender: inbound.sender,
      timestamp: inbound.timestamp,
      ref: inbound.ref,
    },
    syncInsight: "Sincronizado desde ManyChat",
    messageIdPrefix: "mc",
    afterUpsert:
      inbound.ref
        ? async (conversationId) => {
            await attributeConversationFromManyChatRef(
              supabase,
              organizationId,
              conversationId,
              inbound.ref!,
              externalRef
            );
          }
        : undefined,
  });
}
