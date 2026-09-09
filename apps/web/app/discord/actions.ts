"use server";

import { revalidatePath } from "next/cache";
import { requireOrganizationId } from "@/lib/auth/bootstrap";
import {
  actionErrorMessage,
  runMutation,
  type MutationResult,
} from "@/lib/server/action-result";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { paths } from "@/routes";
import { summarizeByClient, type ClientActivity } from "@/lib/discord/activity";
import {
  CLASSIFY_RUN_LIMIT,
  classifyDiscordMessagesForOrg,
} from "@/lib/discord/classify-run";
import {
  listGuildTextChannels,
  type DiscordGuildChannel,
} from "@/lib/discord/api";
import { applyGuildProfile, toImageDataUri } from "@/lib/discord/profile";
import {
  BOT_AVATAR_MAX_BYTES,
  DISCORD_IMAGE_MIME_TYPES,
  MAX_NICKNAME_LENGTH,
  type DiscordImageMimeType,
} from "@/lib/discord/limits";
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

/**
 * El servidor conectado de la organización. Todas las acciones de perfil lo
 * necesitan: sin `guild_id` no hay a quién aplicarle nada.
 */
async function requireConnectedGuild(
  supabase: Awaited<ReturnType<typeof createClient>>,
  organizationId: string,
): Promise<string> {
  const { data } = await supabase
    .from("discord_integrations")
    .select("guild_id")
    .eq("organization_id", organizationId)
    .eq("status", "connected")
    .maybeSingle();

  if (!data?.guild_id) {
    throw new Error("No hay ningún servidor de Discord conectado.");
  }
  return data.guild_id as string;
}

/**
 * Aplica un cambio de perfil en Discord y **deja registrado si lo rechazó**.
 *
 * ⭐ Es la mitad que evita repetir el bug que este cambio arregla. Guardar el
 * nombre en la base no lo cambia en Discord; si el rechazo viviera nada más en
 * un toast, al recargar la pantalla volvería a decir que está guardado mientras
 * en el servidor sigue el nombre viejo. `bot_profile_error` sobrevive a la
 * recarga y la pantalla lo muestra hasta que se resuelva.
 *
 * El error se vuelve a lanzar: para el usuario esto **falló**, aunque la fila se
 * haya guardado. Lo que quería era ver el cambio en su servidor. Marcar el éxito
 * queda en manos de quien llama, que además tiene que guardar lo suyo.
 */
async function aplicarEnDiscord(
  supabase: Awaited<ReturnType<typeof createClient>>,
  organizationId: string,
  guildId: string,
  patch: { nick?: string | null; avatar?: string | null },
): Promise<void> {
  try {
    await applyGuildProfile(guildId, patch);
  } catch (error) {
    await supabase
      .from("discord_integrations")
      .update({
        bot_profile_error: actionErrorMessage(error),
        updated_at: new Date().toISOString(),
      })
      .eq("organization_id", organizationId);
    revalidatePath(paths.platform.integrationsDiscord);
    throw error;
  }
}

/** Lo que se escribe cuando Discord aceptó el cambio. */
function perfilAplicado(extra: Record<string, unknown> = {}) {
  return {
    ...extra,
    bot_profile_applied_at: new Date().toISOString(),
    bot_profile_error: null,
    updated_at: new Date().toISOString(),
  };
}

/**
 * El nombre del bot, que ahora sí es el que Discord muestra.
 *
 * Antes esto sólo guardaba una fila que se usaba **dentro del texto** del saludo
 * ("Hola, soy X"): el nombre al lado del mensaje seguía siendo el de la
 * aplicación, igual para todos los clientes.
 */
export async function updateDiscordBotNameAction(
  botName: string,
): Promise<MutationResult> {
  return runMutation(async () => {
    const organizationId = await requireOrganizationId();
    const supabase = await createClient();

    const nick = botName.trim();
    if (!nick) throw new Error("El nombre no puede quedar vacío.");
    if (nick.length > MAX_NICKNAME_LENGTH) {
      throw new Error(
        `Discord no acepta nombres de más de ${MAX_NICKNAME_LENGTH} caracteres.`,
      );
    }

    const guildId = await requireConnectedGuild(supabase, organizationId);

    // Primero la intención, después la aplicación: si Discord rechaza, lo que
    // el usuario pidió queda guardado y el motivo del rechazo también.
    const { error } = await supabase
      .from("discord_integrations")
      .update({ bot_name: nick, updated_at: new Date().toISOString() })
      .eq("organization_id", organizationId);
    if (error) throw new Error(error.message);

    await aplicarEnDiscord(supabase, organizationId, guildId, { nick });

    const { error: marcaError } = await supabase
      .from("discord_integrations")
      .update(perfilAplicado())
      .eq("organization_id", organizationId);
    if (marcaError) throw new Error(marcaError.message);

    revalidatePath(paths.platform.integrationsDiscord);
  });
}

const BOT_AVATAR_BUCKET = "discord-bot-avatars";

/**
 * Los tres paths que puede ocupar la foto de una organización.
 *
 * El nombre del archivo lleva la extensión, así que subir un JPG encima de un
 * PNG no lo pisa: deja el anterior colgado en el bucket y sin nadie que lo
 * referencie. Borrarlos todos antes de subir evita juntar basura.
 */
function pathsDeFoto(organizationId: string): string[] {
  return ["png", "jpg", "gif"].map((ext) => `${organizationId}/bot.${ext}`);
}

function extensionParaMime(mime: DiscordImageMimeType): string {
  if (mime === "image/png") return "png";
  if (mime === "image/gif") return "gif";
  return "jpg";
}

/**
 * La foto del bot en el servidor de la organización.
 *
 * ⭐ Se aplica en Discord **antes** de subirla al bucket. Al revés, un rechazo
 * de Discord dejaría un archivo huérfano y una URL guardada que la pantalla
 * mostraría como si fuera la foto vigente. Así, lo que está guardado es siempre
 * lo que Discord aceptó.
 */
export async function updateDiscordBotAvatarAction(
  formData: FormData,
): Promise<MutationResult> {
  return runMutation(async () => {
    const organizationId = await requireOrganizationId();
    const supabase = await createClient();

    const file = formData.get("file");
    if (!(file instanceof File) || file.size === 0) {
      throw new Error("No llegó ninguna imagen.");
    }
    if (
      !DISCORD_IMAGE_MIME_TYPES.includes(file.type as DiscordImageMimeType)
    ) {
      throw new Error(
        "Discord sólo acepta PNG, JPG o GIF para la foto del bot. WebP no sirve.",
      );
    }
    if (file.size > BOT_AVATAR_MAX_BYTES) {
      throw new Error("La imagen no puede superar 4 MB.");
    }

    const guildId = await requireConnectedGuild(supabase, organizationId);
    const mime = file.type as DiscordImageMimeType;
    const buffer = Buffer.from(await file.arrayBuffer());

    await aplicarEnDiscord(supabase, organizationId, guildId, {
      avatar: toImageDataUri(buffer, mime),
    });

    await supabase.storage.from(BOT_AVATAR_BUCKET).remove(pathsDeFoto(organizationId));

    const storagePath = `${organizationId}/bot.${extensionParaMime(mime)}`;
    const { error: uploadError } = await supabase.storage
      .from(BOT_AVATAR_BUCKET)
      .upload(storagePath, buffer, {
        upsert: true,
        contentType: mime,
        cacheControl: "3600",
      });

    if (uploadError) {
      throw new Error(
        uploadError.message.includes("Bucket not found")
          ? `La foto se aplicó en Discord pero no se pudo guardar la copia. ¿Existe el bucket "${BOT_AVATAR_BUCKET}"?`
          : uploadError.message,
      );
    }

    const { data: urlData } = supabase.storage
      .from(BOT_AVATAR_BUCKET)
      .getPublicUrl(storagePath);

    // El path se reescribe siempre igual, así que sin este sufijo el navegador
    // seguiría mostrando la foto anterior desde su caché.
    const publicUrl = `${urlData.publicUrl}?v=${Date.now()}`;

    const { error } = await supabase
      .from("discord_integrations")
      .update(perfilAplicado({ bot_avatar_url: publicUrl }))
      .eq("organization_id", organizationId);

    if (error) throw new Error(error.message);
    revalidatePath(paths.platform.integrationsDiscord);
  });
}

/** Vuelve a la foto de la aplicación, la misma para todos los servidores. */
export async function removeDiscordBotAvatarAction(): Promise<MutationResult> {
  return runMutation(async () => {
    const organizationId = await requireOrganizationId();
    const supabase = await createClient();
    const guildId = await requireConnectedGuild(supabase, organizationId);

    await aplicarEnDiscord(supabase, organizationId, guildId, { avatar: null });

    await supabase.storage.from(BOT_AVATAR_BUCKET).remove(pathsDeFoto(organizationId));

    const { error } = await supabase
      .from("discord_integrations")
      .update(perfilAplicado({ bot_avatar_url: null }))
      .eq("organization_id", organizationId);

    if (error) throw new Error(error.message);
    revalidatePath(paths.platform.integrationsDiscord);
  });
}

export async function updateDiscordAutoPatternAction(
  pattern: string,
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

export type DiscordChannelOption = DiscordGuildChannel & {
  /** Ya está en la lista de monitoreados. */
  monitored: boolean;
};

/**
 * Canales del servidor conectado, marcando cuáles ya se monitorean.
 *
 * Se pide a Discord en el momento y no se guarda: la lista de canales de un
 * servidor cambia todo el tiempo, y una copia vieja ofrecería canales borrados.
 */
export async function listDiscordGuildChannelsAction(): Promise<
  { ok: true; channels: DiscordChannelOption[] } | { ok: false; error: string }
> {
  try {
    const organizationId = await requireOrganizationId();
    const supabase = await createClient();

    const { data: integration } = await supabase
      .from("discord_integrations")
      .select("guild_id, monitored_channels")
      .eq("organization_id", organizationId)
      .eq("status", "connected")
      .maybeSingle();

    if (!integration?.guild_id) {
      return {
        ok: false,
        error: "No hay ningún servidor de Discord conectado.",
      };
    }

    const monitored = new Set(
      ((integration.monitored_channels as MonitoredChannel[]) ?? []).map(
        (channel) => channel.channel_id,
      ),
    );

    const channels = await listGuildTextChannels(
      integration.guild_id as string,
    );

    return {
      ok: true,
      channels: channels.map((channel) => ({
        ...channel,
        monitored: monitored.has(channel.id),
      })),
    };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : "No se pudieron traer los canales.",
    };
  }
}

/**
 * Suma un canal existente a la lista de monitoreados.
 *
 * Antes esto no se podía: un canal sólo entraba si lo **creaba** alguien
 * después de configurar el patrón de detección automática. En un servidor que ya
 * existía —que es el caso normal— no había forma de monitorear nada.
 *
 * El nombre del canal se resuelve contra Discord y no se acepta del cliente: es
 * lo que después se muestra en la pantalla, y de paso valida que el canal exista
 * de verdad en ese servidor.
 */
export async function addDiscordMonitoredChannelAction(
  channelId: string,
): Promise<MutationResult> {
  return runMutation(async () => {
    const organizationId = await requireOrganizationId();
    const supabase = await createClient();

    const { data: integration } = await supabase
      .from("discord_integrations")
      .select("guild_id, monitored_channels")
      .eq("organization_id", organizationId)
      .eq("status", "connected")
      .maybeSingle();

    if (!integration?.guild_id) throw new Error("Integración no encontrada");

    const channels =
      (integration.monitored_channels as MonitoredChannel[]) ?? [];
    if (channels.some((channel) => channel.channel_id === channelId)) return;

    const guildChannels = await listGuildTextChannels(
      integration.guild_id as string,
    );
    const channel = guildChannels.find((c) => c.id === channelId);
    if (!channel) {
      throw new Error("Ese canal no existe en el servidor conectado.");
    }

    const updated: MonitoredChannel[] = [
      ...channels,
      {
        channel_id: channel.id,
        channel_name: channel.name,
        purpose: "clients",
        added_at: new Date().toISOString(),
      },
    ];

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

export async function removeDiscordMonitoredChannelAction(
  channelId: string,
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
  clientId: string,
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
        { onConflict: "organization_id,discord_user_id" },
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
  pendingLinkId: string,
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
  clientId: string,
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
      .gte(
        "sent_at",
        new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
      );

    if (error) return {};

    return summarizeByClient(
      (
        data as {
          client_id: string | null;
          sent_at: string;
          is_testimonial: boolean;
        }[]
      ).map((row) => ({
        clientId: row.client_id,
        sentAt: row.sent_at,
        isTestimonial: row.is_testimonial,
      })),
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
  limit = CLASSIFY_RUN_LIMIT,
): Promise<MutationResult<{ clasificados: number; testimonios: number }>> {
  return runMutation(async () => {
    const organizationId = await requireOrganizationId();
    const { clasificados, testimonios } = await classifyDiscordMessagesForOrg(
      organizationId,
      { limit },
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
        .select(
          "id, content, ai_summary, channel_name, sent_at, client_id, discord_message_id, clients(name)",
        )
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
        .filter((ref): ref is string => Boolean(ref)),
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
      .filter(
        (row) =>
          row.client_id &&
          row.content?.trim() &&
          !yaUsados.has(row.discord_message_id),
      )
      .map((row) => {
        const cliente = Array.isArray(row.clients)
          ? row.clients[0]
          : row.clients;
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
  messageId: string,
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
  messageId: string,
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
        "Este mensaje no está vinculado a ningún cliente. Vinculá el usuario de Discord primero.",
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
    const achievement = (row.ai_summary?.trim() || row.content.trim()).slice(
      0,
      500,
    );

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
