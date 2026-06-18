import { createAdminClient } from "@/lib/supabase/admin";
import { upsertConversationFromManyChat } from "@/lib/manychat/upsert-conversation";

export type ManyChatWebhookInbound = {
  subscriberId: string;
  leadName: string;
  messageText: string;
  sender: "lead" | "team";
  timestamp: string;
  ref?: string;
};

/** Procesa un webhook de ManyChat autenticado por token en la URL (no invocable desde el cliente). */
export async function processManyChatWebhookForOrganization(
  organizationId: string,
  inbound: ManyChatWebhookInbound
) {
  const admin = createAdminClient();
  await upsertConversationFromManyChat(admin, organizationId, {
    subscriberId: inbound.subscriberId,
    leadName: inbound.leadName,
    messageText: inbound.messageText,
    sender: inbound.sender,
    timestamp: inbound.timestamp,
    ref: inbound.ref,
  });

  await admin
    .from("manychat_integrations")
    .update({ updated_at: new Date().toISOString() })
    .eq("organization_id", organizationId);
}
