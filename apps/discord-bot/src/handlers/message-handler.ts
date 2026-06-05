import { Message, TextChannel } from "discord.js";
import {
  getOrgByGuildId,
  getClientLink,
  saveMessage,
  isChannelMonitored,
  touchIntegrationEvent,
} from "../lib/supabase";
import { isTestimonial } from "./testimonial-handler";

export async function processMessage(message: Message) {
  if (message.author.bot) return;

  const guildId = message.guildId!;
  const channelId = message.channelId;
  const channelName = (message.channel as TextChannel).name || "dm";

  const integration = await getOrgByGuildId(guildId);
  if (!integration) return;

  const orgId = integration.organization_id as string;

  const monitored = await isChannelMonitored(guildId, channelId);
  if (!monitored) return;

  const clientLink = await getClientLink(orgId, message.author.id);
  const testimonial = isTestimonial(message.content, channelName, integration);

  const attachments = message.attachments.map((att) => ({
    url: att.url,
    type: att.contentType || "unknown",
    name: att.name,
  }));

  await saveMessage({
    organization_id: orgId,
    client_id: (clientLink?.client_id as string | undefined) || null,
    discord_message_id: message.id,
    discord_user_id: message.author.id,
    discord_username: message.author.username,
    discord_display_name:
      message.member?.displayName || message.author.username,
    guild_id: guildId,
    channel_id: channelId,
    channel_name: channelName,
    content: message.content,
    message_type: testimonial ? "testimonial" : "message",
    is_testimonial: testimonial,
    attachments,
    sent_at: message.createdAt,
  });

  await touchIntegrationEvent(guildId);

  if (testimonial) {
    await notifyTestimonial({
      organizationId: orgId,
      clientId: (clientLink?.client_id as string | undefined) || null,
      messageId: message.id,
      content: message.content,
      discordUsername: message.author.username,
      channelName,
    });
  }
}

async function notifyTestimonial(data: {
  organizationId: string;
  clientId: string | null;
  messageId: string;
  content: string;
  discordUsername: string;
  channelName: string;
}) {
  try {
    await fetch(`${process.env.OTC_API_URL}/api/discord/testimonial`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OTC_WEBHOOK_SECRET}`,
      },
      body: JSON.stringify(data),
    });
  } catch (e) {
    console.error("Error notifying testimonial:", e);
  }
}
