import { Channel, TextChannel } from "discord.js";
import {
  getOrgByGuildId,
  channelMatchesAutoPattern,
  addMonitoredChannel,
  savePendingChannel,
  getClients,
} from "../lib/supabase";
import {
  fuzzyMatchClients,
  extractClientNameFromChannel,
} from "../lib/fuzzy-match";
import { logError } from "../utils/logger";

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

    await addMonitoredChannel(guildId, {
      channel_id: textChannel.id,
      channel_name: channelName,
      purpose: "auto",
    });

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

    await savePendingChannel({
      organization_id: orgId,
      guild_id: guildId,
      channel_id: textChannel.id,
      channel_name: channelName,
    });
  } catch (error) {
    logError("Error handling new channel:", error);
  }
}
