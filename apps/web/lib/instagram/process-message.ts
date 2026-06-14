import { createAdminClient } from "@/lib/supabase/admin";
import { scoreConversation } from "@/lib/manychat/score-conversation";
import { INSTAGRAM_GRAPH_URL } from "@/lib/instagram/config";
import type { ConversationAnalysis, SalesMessage } from "@/types/sales";

export interface InstagramMessaging {
  sender: { id: string };
  recipient: { id: string };
  timestamp: number;
  message?: {
    mid: string;
    text?: string;
    attachments?: Array<{ type: string; payload: unknown }>;
    is_deleted?: boolean;
    is_unsupported?: boolean;
  };
}

function defaultAnalysis(): ConversationAnalysis {
  return {
    responseTimeMinutes: 0,
    ghostingRisk: "medium",
    bookingSignal: false,
    insights: ["Sincronizado desde Instagram DM"],
  };
}

function instagramExternalRef(threadId: string): string {
  return `instagram:${threadId}`;
}

function toMessageTimestamp(raw: number): string {
  const ms = raw > 1_000_000_000_000 ? raw : raw * 1000;
  return new Date(ms).toISOString();
}

function resolveMessageType(message: NonNullable<InstagramMessaging["message"]>): string {
  if (message.is_deleted) return "deleted";
  if (message.is_unsupported) return "unsupported";
  const attachmentType = message.attachments?.[0]?.type;
  if (attachmentType === "image") return "image";
  if (attachmentType === "video") return "video";
  if (attachmentType === "audio") return "audio";
  if (attachmentType === "story_reply") return "story_reply";
  if (attachmentType === "story_mention") return "story_mention";
  return "text";
}

function toScoringMessages(messages: SalesMessage[]) {
  return messages.map((m) => ({
    sender: m.sender,
    message: m.content,
    timestamp: m.timestamp,
  }));
}

export async function processInstagramMessage({
  organizationId,
  igAccountId,
  messaging,
}: {
  organizationId: string;
  igAccountId: string;
  messaging: InstagramMessaging;
}): Promise<void> {
  const supabase = createAdminClient();
  const { sender, recipient, timestamp, message } = messaging;

  if (!message?.mid) return;

  const { data: existingMessage } = await supabase
    .from("instagram_messages")
    .select("id")
    .eq("instagram_message_id", message.mid)
    .maybeSingle();

  if (existingMessage) return;

  const isInbound = sender.id !== igAccountId;
  const leadIgId = isInbound ? sender.id : recipient.id;
  const threadId = [igAccountId, leadIgId].sort().join("_");
  const messageAt = toMessageTimestamp(timestamp);
  const messageType = resolveMessageType(message);
  const messageText = message.text ?? `[${messageType}]`;

  const { data: existingThread } = await supabase
    .from("instagram_threads")
    .select("*")
    .eq("organization_id", organizationId)
    .eq("instagram_thread_id", threadId)
    .maybeSingle();

  let thread = existingThread;

  if (thread) {
    await supabase
      .from("instagram_threads")
      .update({
        last_message_at: messageAt,
        message_count: (thread.message_count ?? 0) + 1,
      })
      .eq("id", thread.id);
  } else {
    const { data: insertedThread, error: threadError } = await supabase
      .from("instagram_threads")
      .insert({
        organization_id: organizationId,
        instagram_thread_id: threadId,
        instagram_user_id: leadIgId,
        last_message_at: messageAt,
        message_count: 1,
      })
      .select("*")
      .single();

    if (threadError) throw new Error(threadError.message);
    thread = insertedThread;
  }

  let conversationId = thread?.conversation_id ?? null;
  let leadName = thread?.instagram_name ?? `Lead Instagram ${leadIgId.slice(-6)}`;

  if (!conversationId) {
    const { data: integration } = await supabase
      .from("instagram_integrations")
      .select("access_token")
      .eq("organization_id", organizationId)
      .maybeSingle();

    let leadUsername = thread?.instagram_username ?? "";

    if (integration?.access_token) {
      try {
        const profileRes = await fetch(
          `${INSTAGRAM_GRAPH_URL}/${leadIgId}?fields=name,username&access_token=${integration.access_token}`
        );
        const profile = (await profileRes.json()) as {
          name?: string;
          username?: string;
        };
        if (profile.name) leadName = profile.name;
        if (profile.username) leadUsername = profile.username;
      } catch {
        // Perfil opcional
      }
    }

    const newMessage: SalesMessage = {
      id: message.mid,
      sender: isInbound ? "lead" : "team",
      content: messageText,
      timestamp: messageAt,
    };

    const { data: conv, error: convError } = await supabase
      .from("conversations")
      .insert({
        organization_id: organizationId,
        lead_name: leadName,
        status: "active",
        tag: null,
        last_message: messageText,
        last_message_at: messageAt,
        unread: isInbound,
        messages: [newMessage],
        analysis: defaultAnalysis(),
        external_ref: instagramExternalRef(threadId),
        source: "instagram",
      })
      .select("id")
      .single();

    if (convError) throw new Error(convError.message);
    conversationId = conv?.id ?? null;

    if (conversationId && thread) {
      await supabase
        .from("instagram_threads")
        .update({
          conversation_id: conversationId,
          instagram_username: leadUsername || null,
          instagram_name: leadName,
        })
        .eq("id", thread.id);
    }
  }

  await supabase.from("instagram_messages").insert({
    organization_id: organizationId,
    instagram_message_id: message.mid,
    instagram_thread_id: threadId,
    instagram_sender_id: sender.id,
    instagram_recipient_id: recipient.id,
    message_text: message.text ?? null,
    message_type: messageType,
    attachments: message.attachments ?? [],
    direction: isInbound ? "inbound" : "outbound",
    timestamp: messageAt,
    conversation_id: conversationId,
  });

  if (conversationId && isInbound) {
    const { data: conv } = await supabase
      .from("conversations")
      .select("messages, lead_name")
      .eq("id", conversationId)
      .single();

    const currentMessages = (conv?.messages ?? []) as SalesMessage[];
    const alreadyStored = currentMessages.some((m) => m.id === message.mid);

    if (!alreadyStored) {
      const updatedMessages: SalesMessage[] = [
        ...currentMessages,
        {
          id: message.mid,
          sender: "lead",
          content: messageText,
          timestamp: messageAt,
        },
      ];

      await supabase
        .from("conversations")
        .update({
          messages: updatedMessages,
          last_message: messageText,
          last_message_at: messageAt,
          unread: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", conversationId);

      const inboundCount = updatedMessages.filter((m) => m.sender === "lead").length;
      if (inboundCount >= 3 && inboundCount % 5 === 0) {
        void scoreConversation({
          organizationId,
          conversationId,
          messages: toScoringMessages(updatedMessages),
          leadName: conv?.lead_name ?? leadName,
        }).catch(() => {});
      }
    }
  }

  console.log(`[Instagram DM] Mensaje procesado: ${message.mid}`);
}
