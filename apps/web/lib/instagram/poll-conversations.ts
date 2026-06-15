import { createAdminClient } from "@/lib/supabase/admin";
import { INSTAGRAM_GRAPH_URL } from "@/lib/instagram/config";
import { processInstagramMessage } from "@/lib/instagram/process-message";

interface IGMessage {
  id: string;
  message?: string;
  from: { id: string; username?: string };
  to: { data: Array<{ id: string; username?: string }> };
  created_time: string;
}

interface IGConversation {
  id: string;
  participants: {
    data: Array<{ id: string; username?: string; name?: string }>;
  };
  messages?: { data: IGMessage[] };
  updated_time?: string;
}

export async function pollInstagramConversations(
  organizationId: string
): Promise<void> {
  const supabase = createAdminClient();

  const { data: integration } = await supabase
    .from("instagram_integrations")
    .select("access_token, instagram_user_id, instagram_username")
    .eq("organization_id", organizationId)
    .eq("status", "active")
    .maybeSingle();

  if (!integration?.access_token) {
    console.log(`[IG Poll] No hay integración activa para org ${organizationId}`);
    return;
  }

  const { access_token, instagram_user_id } = integration;

  try {
    const conversationsUrl = new URL(`${INSTAGRAM_GRAPH_URL}/me/conversations`);
    conversationsUrl.searchParams.set(
      "fields",
      "id,participants,messages{id,message,from,to,created_time},updated_time"
    );
    conversationsUrl.searchParams.set("access_token", access_token);
    conversationsUrl.searchParams.set("limit", "20");

    const conversationsRes = await fetch(conversationsUrl);

    if (!conversationsRes.ok) {
      const error = await conversationsRes.json().catch(() => ({}));
      console.error("[IG Poll] Error obteniendo conversaciones:", error);
      return;
    }

    const { data: conversations } = (await conversationsRes.json()) as {
      data?: IGConversation[];
    };

    if (!conversations?.length) {
      console.log(`[IG Poll] No hay conversaciones para org ${organizationId}`);
      return;
    }

    console.log(`[IG Poll] ${conversations.length} conversaciones encontradas`);

    for (const conversation of conversations) {
      await processConversation({
        organizationId,
        igAccountId: String(instagram_user_id),
        conversation,
      });
      await new Promise((r) => setTimeout(r, 200));
    }

    await supabase
      .from("instagram_integrations")
      .update({ last_sync_at: new Date().toISOString() })
      .eq("organization_id", organizationId);
  } catch (err) {
    console.error("[IG Poll] Error general:", err);
    throw err;
  }
}

async function processConversation({
  organizationId,
  igAccountId,
  conversation,
}: {
  organizationId: string;
  igAccountId: string;
  conversation: IGConversation;
}): Promise<void> {
  const supabase = createAdminClient();

  const leadParticipant = conversation.participants.data.find(
    (p) => p.id !== igAccountId
  );

  if (!leadParticipant) return;

  const leadIgId = leadParticipant.id;
  const threadId = conversation.id;
  const messages = conversation.messages?.data ?? [];

  if (!messages.length) return;

  const { data: existingMessages } = await supabase
    .from("instagram_messages")
    .select("instagram_message_id")
    .eq("organization_id", organizationId)
    .in(
      "instagram_message_id",
      messages.map((m) => m.id)
    );

  const existingIds = new Set(
    existingMessages?.map((m) => m.instagram_message_id) ?? []
  );

  const newMessages = messages.filter((m) => !existingIds.has(m.id));

  if (!newMessages.length) return;

  console.log(
    `[IG Poll] ${newMessages.length} mensajes nuevos en thread ${threadId}`
  );

  const leadName =
    leadParticipant.name?.trim() ||
    (leadParticipant.username
      ? `@${leadParticipant.username}`
      : undefined);

  for (const msg of newMessages) {
    const isInbound = msg.from.id !== igAccountId;
    const recipientId = isInbound
      ? igAccountId
      : msg.to.data[0]?.id ?? leadIgId;

    await processInstagramMessage({
      organizationId,
      igAccountId,
      instagramThreadId: threadId,
      leadName,
      leadUsername: leadParticipant.username,
      messaging: {
        sender: { id: msg.from.id },
        recipient: { id: recipientId },
        timestamp: new Date(msg.created_time).getTime(),
        message: {
          mid: msg.id,
          text: msg.message,
        },
      },
    }).catch((err) => {
      console.error("[IG Poll] Error procesando mensaje:", msg.id, err);
    });
  }
}
