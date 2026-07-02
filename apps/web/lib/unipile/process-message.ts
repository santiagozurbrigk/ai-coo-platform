import { createAdminClient } from "@/lib/supabase/admin";
import {
  unipileExternalRef,
  upsertInboundConversation,
} from "@/lib/sales/upsert-inbound-conversation";
import {
  fallbackUnipileLeadNameFromId,
  looksLikeUnipileIdLeadName,
  resolveUnipileAttendeeDisplayName,
} from "./attendee-name";
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

async function resolveLeadNameForInbound(options: {
  provider: "instagram" | "whatsapp";
  accountId: string;
  message: Parameters<typeof resolveUnipileLeadName>[0];
}): Promise<string> {
  const rawLeadName = resolveUnipileLeadName(options.message);

  if (
    options.provider !== "instagram" ||
    !looksLikeUnipileIdLeadName(rawLeadName)
  ) {
    return rawLeadName;
  }

  try {
    const resolved = await resolveUnipileAttendeeDisplayName({
      accountId: options.accountId,
      attendeeId: options.message.sender_id,
      chatId: options.message.chat_id,
    });
    if (resolved) return resolved;
  } catch (err) {
    console.warn("[Unipile] No se pudo resolver nombre del attendee:", err);
  }

  if (options.message.sender_id?.trim()) {
    return fallbackUnipileLeadNameFromId(options.message.sender_id);
  }

  return rawLeadName;
}

export async function processUnipileMessageWebhook(body: unknown): Promise<void> {
  const parsed = parseUnipileMessageWebhook(body);
  if (!parsed) {
    console.warn("[Unipile] parseUnipileMessageWebhook devolvió null — payload no mapeable");
    return;
  }

  const { accountId, message } = parsed;
  console.log("[Unipile] campos extraídos:", {
    accountId,
    chatId: message.chat_id,
    messageId: message.id,
    leadName: resolveUnipileLeadName(message),
    messageText: resolveUnipileMessageText(message),
    isSender: message.is_sender,
  });

  if (shouldSkipUnipileMessage(message)) {
    console.log("[Unipile] mensaje omitido (deleted/hidden/event)");
    return;
  }

  const integration = await getUnipileIntegrationByAccountId(accountId);
  if (!integration) {
    console.warn("[Unipile] Cuenta no vinculada en unipile_integrations:", accountId);
    return;
  }

  const externalRef = unipileExternalRef(integration.provider, message.chat_id);
  const leadName = await resolveLeadNameForInbound({
    provider: integration.provider,
    accountId,
    message,
  });
  const messageText = resolveUnipileMessageText(message);
  const sender = message.is_sender ? "team" : "lead";
  const timestamp = message.timestamp
    ? new Date(message.timestamp).toISOString()
    : new Date().toISOString();

  console.log("[Unipile] upsert:", {
    organizationId: integration.organization_id,
    provider: integration.provider,
    source: integration.provider,
    externalRef,
    leadName,
    sender,
    timestamp,
  });

  const admin = createAdminClient();
  const result = await upsertInboundConversation(admin, integration.organization_id, {
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

  console.log("[Unipile] conversación guardada:", {
    conversationId: result.conversationId,
    inserted: result.inserted,
    updated: result.updated,
    messageCount: result.messages.length,
  });

  await admin
    .from("unipile_integrations")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", integration.id);
}
