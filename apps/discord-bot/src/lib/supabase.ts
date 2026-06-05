import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function getOrgByGuildId(guildId: string) {
  const { data } = await supabase
    .from("discord_integrations")
    .select("*, organizations(*)")
    .eq("guild_id", guildId)
    .eq("status", "connected")
    .single();
  return data;
}

export async function getClientLink(
  organizationId: string,
  discordUserId: string
) {
  const { data } = await supabase
    .from("discord_client_links")
    .select("*, clients(*)")
    .eq("organization_id", organizationId)
    .eq("discord_user_id", discordUserId)
    .single();
  return data;
}

export async function saveMessage(message: {
  organization_id: string;
  client_id: string | null;
  discord_message_id: string;
  discord_user_id: string;
  discord_username: string;
  discord_display_name: string;
  guild_id: string;
  channel_id: string;
  channel_name: string;
  content: string;
  message_type: string;
  is_testimonial: boolean;
  attachments: { url: string; type: string; name: string | null }[];
  sent_at: Date;
}) {
  const { error } = await supabase
    .from("discord_messages")
    .upsert(message, { onConflict: "discord_message_id" });

  if (error) console.error("Error saving message:", error);
}

export async function saveClientLink(link: {
  organization_id: string;
  client_id: string;
  discord_user_id: string;
  discord_username: string;
  discord_display_name: string;
  link_method: string;
  link_confidence: number;
}) {
  const { error } = await supabase
    .from("discord_client_links")
    .upsert(link, { onConflict: "organization_id,discord_user_id" });

  if (error) console.error("Error saving link:", error);
}

export async function getClients(organizationId: string) {
  const { data } = await supabase
    .from("clients")
    .select("id, name, nickname, email")
    .eq("organization_id", organizationId);
  return data || [];
}

export async function getClientByEmail(
  email: string,
  organizationId: string
) {
  const { data } = await supabase
    .from("clients")
    .select("id, name")
    .eq("organization_id", organizationId)
    .ilike("email", email)
    .single();
  return data;
}

export async function savePendingChannel(data: {
  organization_id: string;
  guild_id: string;
  channel_id: string;
  channel_name: string;
}) {
  await supabase
    .from("discord_pending_channels")
    .upsert(data, { onConflict: "channel_id" });
}

export async function isChannelMonitored(
  guildId: string,
  channelId: string
): Promise<boolean> {
  const { data } = await supabase
    .from("discord_integrations")
    .select("monitored_channels")
    .eq("guild_id", guildId)
    .single();

  if (!data) return false;

  const channels = (data.monitored_channels as { channel_id: string }[]) || [];
  return channels.some((c) => c.channel_id === channelId);
}

export async function channelMatchesAutoPattern(
  guildId: string,
  channelName: string
): Promise<{ matches: boolean; integration: Record<string, unknown> | null }> {
  const { data } = await supabase
    .from("discord_integrations")
    .select("*")
    .eq("guild_id", guildId)
    .single();

  if (!data) return { matches: false, integration: null };

  const pattern = (data.auto_monitor_pattern as string) || "cliente-";
  const matches = channelName.toLowerCase().includes(pattern.toLowerCase());
  return { matches, integration: data };
}

export async function addMonitoredChannel(
  guildId: string,
  channel: {
    channel_id: string;
    channel_name: string;
    purpose: string;
  }
) {
  const { data } = await supabase
    .from("discord_integrations")
    .select("monitored_channels")
    .eq("guild_id", guildId)
    .single();

  if (!data) return;

  const existing =
    (data.monitored_channels as { channel_id: string }[]) || [];
  if (existing.some((c) => c.channel_id === channel.channel_id)) return;

  const updated = [
    ...existing,
    { ...channel, added_at: new Date().toISOString() },
  ];

  await supabase
    .from("discord_integrations")
    .update({ monitored_channels: updated, updated_at: new Date().toISOString() })
    .eq("guild_id", guildId);
}

export async function touchIntegrationEvent(guildId: string) {
  await supabase
    .from("discord_integrations")
    .update({
      last_event_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("guild_id", guildId);
}
