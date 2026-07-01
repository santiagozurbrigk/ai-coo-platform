import { createAdminClient } from "@/lib/supabase/admin";
import {
  unipileExternalRef,
  upsertInboundConversation,
} from "@/lib/sales/upsert-inbound-conversation";
import { getUnipileIntegrationByAccountId } from "./integration";
import {
  parseUnipileMessageWebhook,
  resolveUnipileLeadName,
  resolveUnipileMessageText,
  shouldSkipUnipileMessage,
} from "./parse-webhook";

const SYNC_INSIGHT: Record<"instagram" | "whatsapp", string> = {
  instagram: "Sincronizado desde Instagram DM (Unipile)",
  whatsapp: "Sincronizado desde WhatsApp (Unipile)",
};

export async function processUnipileMessageWebhook(body: unknown): Promise<void> {
  const parsed = parseUnipileMessageWebhook(body);
  if (!parsed) return;

  const { accountId, message } = parsed;
  if (shouldSkipUnipileMessage(message)) return;

  const integration = await getUnipileIntegrationByAccountId(accountId);
  if (!integration) {
    console.warn("[Unipile] Cuenta no vinculada:", accountId);
    return;
  }

  const externalRef = unipileExternalRef(integration.provider, message.chat_id);
  const leadName = resolveUnipileLeadName(message);
  const messageText = resolveUnipileMessageText(message);
  const sender = message.is_sender ? "team" : "lead";
  const timestamp = message.timestamp
    ? new Date(message.timestamp).toISOString()
    : new Date().toISOString();

  const admin = createAdminClient();
  await upsertInboundConversation(admin, integration.organization_id, {
    externalRef,
    source: integration.provider,
    inbound: {
      leadName,
      messageText,
      sender,
      timestamp,
      messageId: message.id,
    },
    syncInsight: SYNC_INSIGHT[integration.provider],
    messageIdPrefix: "up",
  });

  await admin
    .from("unipile_integrations")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", integration.id);
}
