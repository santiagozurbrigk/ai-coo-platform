import { createAdminClient } from "@/lib/supabase/admin";
import { looksLikePlaceholderLeadName } from "@/lib/sales/lead-name";
import {
  unipileExternalRef,
  upsertInboundConversation,
} from "@/lib/sales/upsert-inbound-conversation";
import {
  fallbackUnipileLeadNameFromId,
  rememberResolvedAttendeeName,
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
  existingLeadName?: string | null;
}): Promise<string> {
  const rawLeadName = resolveUnipileLeadName(options.message);

  if (options.provider !== "instagram") {
    return rawLeadName;
  }

  const existingGoodName =
    options.existingLeadName?.trim() &&
    !looksLikePlaceholderLeadName(options.existingLeadName)
      ? options.existingLeadName.trim()
      : null;

  if (existingGoodName) {
    if (options.message.sender_id?.trim()) {
      rememberResolvedAttendeeName(
        options.accountId,
        options.message.sender_id,
        existingGoodName
      );
    }
    console.log("[Unipile] leadName reutilizado de conversación existente:", {
      leadName: existingGoodName,
    });
    return existingGoodName;
  }

  if (!looksLikePlaceholderLeadName(rawLeadName)) {
    if (options.message.sender_id?.trim()) {
      rememberResolvedAttendeeName(
        options.accountId,
        options.message.sender_id,
        rawLeadName
      );
    }
    return rawLeadName;
  }

  const resolved = await resolveUnipileAttendeeDisplayName({
    accountId: options.accountId,
    attendeeId: options.message.sender_id,
    chatId: options.message.chat_id,
  });

  if (resolved) return resolved;

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
    payloadLeadName: resolveUnipileLeadName(message),
    senderId: message.sender_id,
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
  const admin = createAdminClient();

  const { data: existingConv } = await admin
    .from("conversations")
    .select("id, lead_name")
    .eq("organization_id", integration.organization_id)
    .eq("external_ref", externalRef)
    .maybeSingle();

  const leadName = await resolveLeadNameForInbound({
    provider: integration.provider,
    accountId,
    message,
    existingLeadName: existingConv?.lead_name,
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
    existingLeadName: existingConv?.lead_name ?? null,
    sender,
    timestamp,
  });

  const result = await upsertInboundConversation(admin, integration.organization_id, {
    externalRef,
    source: integration.provider,
    unipileAccountId: accountId,
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
