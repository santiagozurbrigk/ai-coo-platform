import { Message, TextChannel } from "discord.js";
import {
  getOrgByGuildId,
  getClientLink,
  saveMessage,
  getMonitoredChannel,
  getChannelClients,
  esPersonaDelEquipo,
  touchIntegrationEvent,
} from "../lib/supabase";
import { atribuirMensaje } from "../lib/attribution";
import { isTestimonial } from "./testimonial-handler";
import { limitlessApiUrl, limitlessWebhookSecret } from "../lib/limitless-api";

export async function processMessage(message: Message) {
  if (message.author.bot) return;

  const guildId = message.guildId!;
  const channelId = message.channelId;
  const channelName = (message.channel as TextChannel).name || "dm";

  const integration = await getOrgByGuildId(guildId);
  if (!integration) return;

  const orgId = integration.organization_id as string;

  const canal = await getMonitoredChannel(guildId, channelId);
  if (!canal) return;

  /**
   * ⭐ Dos preguntas distintas, no una.
   *
   * A quién pertenece el mensaje sale del autor o del dueño del canal
   * (`atribuirMensaje`). Si acá se buscan logros sale del tilde del canal, que
   * el usuario elige. Un canal puede ser de un cliente Y de logros, o
   * comunitario y no serlo: atarlas llenaría el buzón de wins con saludos.
   */
  const delEquipo = await esPersonaDelEquipo(orgId, message.author.id);

  const [clientLink, clientesDelCanal] = delEquipo
    ? // Siendo del equipo no hay nada que atribuir: las dos consultas
      // siguientes no cambiarían el resultado y este camino corre por cada
      // mensaje del servidor.
      [null, []]
    : await Promise.all([
        getClientLink(orgId, message.author.id),
        getChannelClients(orgId, channelId),
      ]);

  const { clientId, attributedBy } = atribuirMensaje(
    clientLink?.client_id as string | undefined,
    clientesDelCanal,
    delEquipo
  );

  /**
   * ⭐ El equipo no genera logros.
   *
   * "Felicitaciones Thiago, tremendo logro" escrito por el coach tiene la
   * palabra y tiene el largo: pasa el pre-filtro, se manda a clasificar —lo que
   * cuesta plata— y termina propuesto como win de nadie. Es la felicitación más
   * común en un canal de wins, así que no es un caso de borde.
   */
  const testimonial = canal.wins && !delEquipo && isTestimonial(message.content);

  const attachments = message.attachments.map((att) => ({
    url: att.url,
    type: att.contentType || "unknown",
    name: att.name,
  }));

  await saveMessage({
    organization_id: orgId,
    client_id: clientId,
    attributed_by: attributedBy,
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
      clientId,
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
    await fetch(`${limitlessApiUrl()}/api/discord/testimonial`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${limitlessWebhookSecret()}`,
      },
      body: JSON.stringify(data),
    });
  } catch (e) {
    console.error("Error notifying testimonial:", e);
  }
}
