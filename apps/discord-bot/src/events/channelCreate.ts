import { Channel, TextChannel } from "discord.js";
import {
  getOrgByGuildId,
  channelMatchesAutoPattern,
  addMonitoredChannel,
  getClients,
} from "../lib/supabase";
import {
  fuzzyMatchClients,
  extractClientNameFromChannel,
} from "../lib/fuzzy-match";
import { puedeHablar } from "../lib/can-speak";
import { buscaLogrosPorNombre } from "../lib/wins-channel";
import { log, logError } from "../utils/logger";

export async function handleChannelCreate(channel: Channel) {
  if (!channel.isTextBased() || !("guildId" in channel)) return;

  const textChannel = channel as TextChannel;
  const guildId = textChannel.guildId;
  const channelName = textChannel.name;

  try {
    const integration = await getOrgByGuildId(guildId);
    if (!integration) return;

    const orgId = integration.organization_id as string;

    const { matches, integration: fullIntegration } =
      await channelMatchesAutoPattern(guildId, channelName);

    if (!matches) return;

    /**
     * ⭐ Nace como canal **de cliente**, sin cliente asignado todavía.
     *
     * Llegó acá por coincidir con el patrón —`cliente-` de fábrica—, así que es
     * el caso que el patrón describe. Pero **no se le asigna nadie solo**:
     * abajo hay una coincidencia por nombre lo bastante buena como para
     * saludar, y aun así no alcanza para atribuirle mensajes a alguien. Saludar
     * mal es una vergüenza; atribuir mal le mete a un cliente conversaciones
     * de otro y nadie se entera hasta que las ve.
     *
     * La pantalla lo muestra como «sin cliente asignado» y ahí se decide.
     */
    await addMonitoredChannel(guildId, {
      channel_id: textChannel.id,
      channel_name: channelName,
      purpose: "client",
      wins: buscaLogrosPorNombre(channelName),
    });

    /**
     * ⭐ El canal queda monitoreado ANTES de decidir si se saluda.
     *
     * Es lo que hace que el modo silencioso no sea un modo degradado: agregar
     * el canal es lo útil —a partir de acá se leen sus mensajes—, y el saludo
     * es sólo cortesía. Apagar el interruptor saca la cortesía, no la función.
     */
    if (!puedeHablar(fullIntegration)) {
      log(
        `[discord] #${channelName} agregado en silencio: el servidor ${guildId} ` +
          `tiene apagado «el bot puede escribir».`
      );
      return;
    }

    const extractedName = extractClientNameFromChannel(channelName);
    const clients = await getClients(orgId);
    const matchesClients = fuzzyMatchClients(extractedName, clients);

    const botName =
      (fullIntegration?.bot_name as string | undefined) || "Asistente Limitless";

    await new Promise((resolve) => setTimeout(resolve, 3000));

    if (
      matchesClients.length === 1 &&
      matchesClients[0].confidence > 0.8
    ) {
      const client = matchesClients[0].client;

      await textChannel.send(
        `Hola! Soy ${botName}, el asistente del equipo 👋\n\n` +
          `Detecté que este canal es para **${client.name}**.\n\n` +
          `Para conectar tu perfil y que pueda darte seguimiento personalizado, ` +
          `escribí:\n\n**!vincular tu@email.com**\n\n` +
          `Usá el mismo email con el que te inscribiste al programa.`
      );
    } else {
      await textChannel.send(
        `Hola! Soy ${botName}, el asistente del equipo 👋\n\n` +
          `Para conectar tu perfil, escribí:\n\n` +
          `**!vincular tu@email.com**\n\n` +
          `Usá el mismo email con el que te inscribiste al programa.`
      );
    }

  } catch (error) {
    logError("Error handling new channel:", error);
  }
}
