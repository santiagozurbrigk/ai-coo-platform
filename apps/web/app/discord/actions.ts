"use server";

import { revalidatePath } from "next/cache";
import { requireOrganizationId } from "@/lib/auth/bootstrap";
import { runMutation, type MutationResult } from "@/lib/server/action-result";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { paths } from "@/routes";
import type {
  DiscordClientLink,
  DiscordIntegration,
  DiscordIntegrationStats,
  DiscordMessage,
  DiscordPendingLink,
  MonitoredChannel,
} from "@/types/discord";

export type DiscordIntegrationStatus = {
  connected: boolean;
  integration: DiscordIntegration | null;
  stats: DiscordIntegrationStats;
};

const EMPTY_STATS: DiscordIntegrationStats = {
  linkedClientsCount: 0,
  messagesCount: 0,
  testimonialsCount: 0,
};

export async function getDiscordIntegrationStatusAction(): Promise<DiscordIntegrationStatus> {
  if (!isSupabaseConfigured()) {
    return { connected: false, integration: null, stats: EMPTY_STATS };
  }

  const organizationId = await requireOrganizationId();
  const supabase = await createClient();

  const { data: integration } = await supabase
    .from("discord_integrations")
    .select("*")
    .eq("organization_id", organizationId)
    .eq("status", "connected")
    .maybeSingle();

  if (!integration) {
    return { connected: false, integration: null, stats: EMPTY_STATS };
  }

  const [linksRes, messagesRes, testimonialsRes] = await Promise.all([
    supabase
      .from("discord_client_links")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", organizationId),
    supabase
      .from("discord_messages")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", organizationId),
    supabase
      .from("discord_messages")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", organizationId)
      .eq("is_testimonial", true),
  ]);

  return {
    connected: true,
    integration: integration as DiscordIntegration,
    stats: {
      linkedClientsCount: linksRes.count ?? 0,
      messagesCount: messagesRes.count ?? 0,
      testimonialsCount: testimonialsRes.count ?? 0,
    },
  };
}

export async function getDiscordSettingsAction(): Promise<{
  integration: DiscordIntegration | null;
  linkedClients: DiscordClientLink[];
  pendingLinks: DiscordPendingLink[];
  clients: { id: string; name: string }[];
}> {
  if (!isSupabaseConfigured()) {
    return {
      integration: null,
      linkedClients: [],
      pendingLinks: [],
      clients: [],
    };
  }

  const organizationId = await requireOrganizationId();
  const supabase = await createClient();

  const [integrationRes, linksRes, pendingRes, clientsRes] = await Promise.all([
    supabase
      .from("discord_integrations")
      .select("*")
      .eq("organization_id", organizationId)
      .maybeSingle(),
    supabase
      .from("discord_client_links")
      .select("*, clients(id, name)")
      .eq("organization_id", organizationId)
      .order("linked_at", { ascending: false }),
    supabase
      .from("discord_pending_links")
      .select("*")
      .eq("organization_id", organizationId)
      .eq("status", "pending")
      .order("created_at", { ascending: false }),
    supabase
      .from("clients")
      .select("id, name")
      .eq("organization_id", organizationId)
      .order("name"),
  ]);

  return {
    integration: (integrationRes.data as DiscordIntegration | null) ?? null,
    linkedClients: (linksRes.data as DiscordClientLink[]) ?? [],
    pendingLinks: (pendingRes.data as DiscordPendingLink[]) ?? [],
    clients: clientsRes.data ?? [],
  };
}

export async function updateDiscordBotNameAction(
  botName: string
): Promise<MutationResult> {
  return runMutation(async () => {
    const organizationId = await requireOrganizationId();
    const supabase = await createClient();
    const { error } = await supabase
      .from("discord_integrations")
      .update({ bot_name: botName.trim(), updated_at: new Date().toISOString() })
      .eq("organization_id", organizationId);

    if (error) throw new Error(error.message);
    revalidatePath(paths.platform.integrationsDiscord);
  });
}

export async function updateDiscordAutoPatternAction(
  pattern: string
): Promise<MutationResult> {
  return runMutation(async () => {
    const organizationId = await requireOrganizationId();
    const supabase = await createClient();
    const { error } = await supabase
      .from("discord_integrations")
      .update({
        auto_monitor_pattern: pattern.trim(),
        updated_at: new Date().toISOString(),
      })
      .eq("organization_id", organizationId);

    if (error) throw new Error(error.message);
    revalidatePath(paths.platform.integrationsDiscord);
  });
}

export async function removeDiscordMonitoredChannelAction(
  channelId: string
): Promise<MutationResult> {
  return runMutation(async () => {
    const organizationId = await requireOrganizationId();
    const supabase = await createClient();

    const { data: integration } = await supabase
      .from("discord_integrations")
      .select("monitored_channels")
      .eq("organization_id", organizationId)
      .single();

    if (!integration) throw new Error("Integración no encontrada");

    const channels =
      (integration.monitored_channels as MonitoredChannel[]) ?? [];
    const updated = channels.filter((c) => c.channel_id !== channelId);

    const { error } = await supabase
      .from("discord_integrations")
      .update({
        monitored_channels: updated,
        updated_at: new Date().toISOString(),
      })
      .eq("organization_id", organizationId);

    if (error) throw new Error(error.message);
    revalidatePath(paths.platform.integrationsDiscord);
  });
}

export async function linkDiscordClientManuallyAction(
  pendingLinkId: string,
  clientId: string
): Promise<MutationResult> {
  return runMutation(async () => {
    const organizationId = await requireOrganizationId();
    const supabase = await createClient();

    const { data: pending } = await supabase
      .from("discord_pending_links")
      .select("*")
      .eq("id", pendingLinkId)
      .eq("organization_id", organizationId)
      .single();

    if (!pending) throw new Error("Vinculación pendiente no encontrada");

    const { error: linkError } = await supabase
      .from("discord_client_links")
      .upsert(
        {
          organization_id: organizationId,
          client_id: clientId,
          discord_user_id: pending.discord_user_id,
          discord_username: pending.discord_username,
          discord_display_name: pending.discord_display_name,
          link_method: "manual",
          link_confidence: 1,
        },
        { onConflict: "organization_id,discord_user_id" }
      );

    if (linkError) throw new Error(linkError.message);

    await supabase
      .from("discord_pending_links")
      .update({ status: "resolved" })
      .eq("id", pendingLinkId);

    revalidatePath(paths.platform.integrationsDiscord);
  });
}

export async function dismissDiscordPendingLinkAction(
  pendingLinkId: string
): Promise<MutationResult> {
  return runMutation(async () => {
    const organizationId = await requireOrganizationId();
    const supabase = await createClient();

    const { error } = await supabase
      .from("discord_pending_links")
      .update({ status: "ignored" })
      .eq("id", pendingLinkId)
      .eq("organization_id", organizationId);

    if (error) throw new Error(error.message);
    revalidatePath(paths.platform.integrationsDiscord);
  });
}

export async function disconnectDiscordIntegrationAction(): Promise<MutationResult> {
  return runMutation(async () => {
    const organizationId = await requireOrganizationId();
    const supabase = await createClient();

    const { error } = await supabase
      .from("discord_integrations")
      .update({
        status: "disconnected",
        updated_at: new Date().toISOString(),
      })
      .eq("organization_id", organizationId);

    if (error) throw new Error(error.message);
    revalidatePath(paths.platform.integrations);
    revalidatePath(paths.platform.integrationsDiscord);
  });
}

export async function getClientDiscordActivityAction(
  clientId: string
): Promise<{
  link: DiscordClientLink | null;
  messages: DiscordMessage[];
}> {
  if (!isSupabaseConfigured()) {
    return { link: null, messages: [] };
  }

  const organizationId = await requireOrganizationId();
  const supabase = await createClient();

  const { data: link } = await supabase
    .from("discord_client_links")
    .select("*")
    .eq("organization_id", organizationId)
    .eq("client_id", clientId)
    .maybeSingle();

  const { data: messages } = await supabase
    .from("discord_messages")
    .select("*")
    .eq("organization_id", organizationId)
    .eq("client_id", clientId)
    .order("sent_at", { ascending: false })
    .limit(20);

  return {
    link: (link as DiscordClientLink | null) ?? null,
    messages: (messages as DiscordMessage[]) ?? [],
  };
}
