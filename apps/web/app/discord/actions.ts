"use server";

import { revalidatePath } from "next/cache";
import { requireOrganizationId } from "@/lib/auth/bootstrap";
import { runMutation, type MutationResult } from "@/lib/server/action-result";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { paths } from "@/routes";
import { summarizeByClient, type ClientActivity } from "@/lib/discord/activity";
import {
  CLASSIFY_RUN_LIMIT,
  classifyDiscordMessagesForOrg,
} from "@/lib/discord/classify-run";
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

// ─── D2 · Actividad y silencio ──────────────────────────────────────────────

/**
 * Resumen de actividad de todos los clientes vinculados, en una sola consulta.
 *
 * Es la conexión de mayor valor y la más barata del bot: no necesita IA, sale de
 * contar filas que el bot ya guarda. Se usa en la lista de clientes, así que
 * pedir el detalle de cada uno por separado no serviría.
 */
export async function getClientsDiscordActivityAction(): Promise<
  Record<string, ClientActivity>
> {
  try {
    if (!isSupabaseConfigured()) return {};
    const organizationId = await requireOrganizationId();
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("discord_messages")
      .select("client_id, sent_at, is_testimonial")
      .eq("organization_id", organizationId)
      .not("client_id", "is", null)
      // Más de 90 días atrás no cambia ninguna de las señales que se muestran.
      .gte("sent_at", new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString());

    if (error) return {};

    return summarizeByClient(
      (data as { client_id: string | null; sent_at: string; is_testimonial: boolean }[]).map(
        (row) => ({
          clientId: row.client_id,
          sentAt: row.sent_at,
          isTestimonial: row.is_testimonial,
        })
      )
    );
  } catch {
    return {};
  }
}

// ─── D3 · Clasificación por lote ────────────────────────────────────────────

/**
 * Clasifica los mensajes que todavía no se clasificaron.
 *
 * Llena `ai_sentiment`, `ai_summary` y `requires_attention` —las tres columnas
 * que existían desde el día uno y nadie llenaba— y **corrige** `is_testimonial`,
 * que el bot sólo puede pre-filtrar por palabras.
 *
 * Por lote: una llamada cada 25 mensajes. El costo por mensaje no cerraría.
 */
export async function classifyDiscordMessagesAction(
  limit = CLASSIFY_RUN_LIMIT
): Promise<MutationResult<{ clasificados: number; testimonios: number }>> {
  return runMutation(async () => {
    const organizationId = await requireOrganizationId();
    const { clasificados, testimonios } = await classifyDiscordMessagesForOrg(
      organizationId,
      { limit }
    );

    revalidatePath(paths.platform.clients.root);
    return { clasificados, testimonios };
  });
}

// ─── D3 · Los candidatos, todos juntos ──────────────────────────────────────

export type WinCandidate = {
  messageId: string;
  clientId: string;
  clientName: string;
  content: string;
  aiSummary: string | null;
  channelName: string | null;
  sentAt: string;
};

/**
 * ⭐ Los testimonios que todavía no se convirtieron en win, de todos los clientes.
 *
 * La ficha de cada cliente ya los mostraba, pero de a uno: había que entrar a
 * cada cliente para descubrir si tenía algo. Esto es la misma información
 * puesta donde se trabaja con los wins — que es donde alguien se va a acordar
 * de mirarla.
 */
export async function listWinCandidatesAction(): Promise<WinCandidate[]> {
  try {
    if (!isSupabaseConfigured()) return [];
    const organizationId = await requireOrganizationId();
    const supabase = await createClient();

    const [messagesResult, winsResult] = await Promise.all([
      supabase
        .from("discord_messages")
        .select("id, content, ai_summary, channel_name, sent_at, client_id, discord_message_id, clients(name)")
        .eq("organization_id", organizationId)
        .eq("is_testimonial", true)
        .not("client_id", "is", null)
        .order("sent_at", { ascending: false })
        .limit(100),
      supabase
        .from("client_wins")
        .select("source_ref")
        .eq("organization_id", organizationId)
        .eq("source", "discord"),
    ]);

    if (messagesResult.error) return [];

    // Los que ya se convirtieron no vuelven a ofrecerse.
    const yaUsados = new Set(
      ((winsResult.data as { source_ref: string | null }[]) ?? [])
        .map((row) => row.source_ref)
        .filter((ref): ref is string => Boolean(ref))
    );

    type Row = {
      id: string;
      content: string | null;
      ai_summary: string | null;
      channel_name: string | null;
      sent_at: string;
      client_id: string | null;
      discord_message_id: string;
      clients: { name: string } | { name: string }[] | null;
    };

    return ((messagesResult.data as Row[]) ?? [])
      .filter((row) => row.client_id && row.content?.trim() && !yaUsados.has(row.discord_message_id))
      .map((row) => {
        const cliente = Array.isArray(row.clients) ? row.clients[0] : row.clients;
        return {
          messageId: row.id,
          clientId: row.client_id!,
          clientName: cliente?.name ?? "Cliente",
          content: row.content ?? "",
          aiSummary: row.ai_summary,
          channelName: row.channel_name,
          sentAt: row.sent_at,
        };
      });
  } catch {
    return [];
  }
}

/**
 * "Esto no era un testimonio."
 *
 * ⭐ No hace falta una columna nueva para descartarlo: se corrige la marca que
 * puso el clasificador, que es exactamente lo que la persona está diciendo. Y
 * la corrección vale también en la ficha del cliente, donde el mensaje deja de
 * aparecer resaltado.
 */
export async function dismissWinCandidateAction(
  messageId: string
): Promise<MutationResult<void>> {
  return runMutation(async () => {
    const organizationId = await requireOrganizationId();
    const supabase = await createClient();

    const { error } = await supabase
      .from("discord_messages")
      .update({ is_testimonial: false })
      .eq("id", messageId)
      .eq("organization_id", organizationId);

    if (error) throw new Error(error.message);
    revalidatePath(paths.platform.clients.wins);
  });
}

// ─── D3 · Testimonio → candidato a win ──────────────────────────────────────

/**
 * Convierte un testimonio de Discord en un win del tracker (Encargo A).
 *
 * ⭐ **Lo acepta una persona.** El bot y el clasificador producen candidatos; un
 * win es una afirmación sobre el negocio de un cliente y no la hace un
 * heurístico. Por eso esto es una acción explícita y no un efecto del clasificador.
 *
 * El win queda con `source = 'discord'` y `source_ref` apuntando al mensaje, así
 * siempre se puede volver al original.
 */
export async function createWinFromTestimonialAction(
  messageId: string
): Promise<MutationResult<{ winId: string }>> {
  return runMutation(async () => {
    const organizationId = await requireOrganizationId();
    const supabase = await createClient();

    const { data: message, error } = await supabase
      .from("discord_messages")
      .select("id, client_id, content, ai_summary, sent_at, discord_message_id")
      .eq("id", messageId)
      .eq("organization_id", organizationId)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!message) throw new Error("El mensaje no existe");

    const row = message as {
      id: string;
      client_id: string | null;
      content: string;
      ai_summary: string | null;
      sent_at: string;
      discord_message_id: string;
    };

    // Sin cliente vinculado no hay a quién atribuirle el win. Vincularlo primero
    // es parte del flujo del bot.
    if (!row.client_id) {
      throw new Error(
        "Este mensaje no está vinculado a ningún cliente. Vinculá el usuario de Discord primero."
      );
    }

    // Un mismo mensaje no puede generar dos wins.
    const { data: existing } = await supabase
      .from("client_wins")
      .select("id")
      .eq("organization_id", organizationId)
      .eq("source", "discord")
      .eq("source_ref", row.discord_message_id)
      .maybeSingle();

    if (existing) throw new Error("Este testimonio ya se convirtió en un win.");

    // El resumen de la IA si existe; si no, el mensaje. Nunca se inventa el logro.
    const achievement = (row.ai_summary?.trim() || row.content.trim()).slice(0, 500);

    const { data: win, error: insertError } = await supabase
      .from("client_wins")
      .insert({
        organization_id: organizationId,
        client_id: row.client_id,
        win_date: row.sent_at.slice(0, 10),
        achievement,
        source: "discord",
        source_ref: row.discord_message_id,
        notes: row.ai_summary ? row.content.slice(0, 2000) : null,
      })
      .select("id")
      .single();

    if (insertError) throw new Error(insertError.message);

    revalidatePath(paths.platform.clients.wins);
    revalidatePath(paths.platform.clients.detail(row.client_id));
    return { winId: (win as { id: string }).id };
  });
}
