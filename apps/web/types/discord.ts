export type MonitoredChannel = {
  channel_id: string;
  channel_name: string;
  purpose: "clients" | "testimonials" | "general" | "auto";
  added_at?: string;
};

export type DiscordIntegration = {
  id: string;
  organization_id: string;
  guild_id: string;
  guild_name: string | null;
  bot_name: string | null;
  monitored_channels: MonitoredChannel[];
  auto_monitor_pattern: string | null;
  status: string;
  last_event_at: string | null;
};

export type DiscordClientLink = {
  id: string;
  organization_id: string;
  client_id: string;
  discord_user_id: string;
  discord_username: string | null;
  discord_display_name: string | null;
  link_method: string;
  link_confidence: number | null;
  linked_at: string;
  clients?: { id: string; name: string } | null;
};

export type DiscordMessage = {
  id: string;
  organization_id: string;
  client_id: string | null;
  discord_message_id: string;
  discord_user_id: string;
  discord_username: string | null;
  discord_display_name: string | null;
  channel_id: string;
  channel_name: string | null;
  content: string;
  message_type: string;
  is_testimonial: boolean;
  requires_attention: boolean;
  sent_at: string;
};

export type DiscordPendingLink = {
  id: string;
  organization_id: string;
  discord_user_id: string;
  discord_username: string | null;
  discord_display_name: string | null;
  email_attempted: string | null;
  channel_id: string | null;
  channel_name: string | null;
  status: string;
  created_at: string;
};

export type DiscordIntegrationStats = {
  linkedClientsCount: number;
  messagesCount: number;
  testimonialsCount: number;
};
