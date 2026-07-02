import { createAdminClient } from "@/lib/supabase/admin";
import { looksLikePlaceholderLeadName } from "@/lib/sales/lead-name";
import {
  rememberResolvedAttendeeName,
  resolveUnipileAttendeeDisplayName,
} from "./attendee-name";
import { getUnipileIntegrationForOrg } from "./integration";

function parseUnipileInstagramChatId(
  externalRef: string | null | undefined
): string | null {
  const match = externalRef?.match(/^unipile:instagram:(.+)$/);
  return match?.[1] ?? null;
}

export async function repairUnipileConversationLeadName(
  conversationId: string,
  options?: { knownName?: string }
): Promise<{ updated: boolean; leadName?: string }> {
  const admin = createAdminClient();

  if (options?.knownName?.trim()) {
    const leadName = options.knownName.trim();
    const { error: updateError } = await admin
      .from("conversations")
      .update({
        lead_name: leadName,
        updated_at: new Date().toISOString(),
      })
      .eq("id", conversationId);

    if (updateError) throw new Error(updateError.message);
    return { updated: true, leadName };
  }

  const { data: conv, error } = await admin
    .from("conversations")
    .select("id, organization_id, lead_name, external_ref, source")
    .eq("id", conversationId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!conv || conv.source !== "instagram") return { updated: false };
  if (!looksLikePlaceholderLeadName(conv.lead_name)) return { updated: false };

  const chatId = parseUnipileInstagramChatId(conv.external_ref);
  if (!chatId) return { updated: false };

  const integration = await getUnipileIntegrationForOrg(
    conv.organization_id,
    "instagram"
  );
  if (!integration) return { updated: false };

  const attendeeId = looksLikePlaceholderLeadName(conv.lead_name)
    ? conv.lead_name.replace(/…$/, "").replace(/\.\.\.$/, "")
    : null;

  const resolved = await resolveUnipileAttendeeDisplayName({
    accountId: integration.unipile_account_id,
    attendeeId:
      attendeeId && !attendeeId.includes("…") ? attendeeId : undefined,
    chatId,
  });

  if (!resolved) return { updated: false };

  const { error: updateError } = await admin
    .from("conversations")
    .update({
      lead_name: resolved,
      updated_at: new Date().toISOString(),
    })
    .eq("id", conversationId);

  if (updateError) throw new Error(updateError.message);

  return { updated: true, leadName: resolved };
}
