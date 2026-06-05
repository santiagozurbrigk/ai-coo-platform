import { Message, TextChannel } from "discord.js";
import {
  getOrgByGuildId,
  getClientByEmail,
  getClients,
  saveClientLink,
  getClientLink,
} from "../lib/supabase";
import { fuzzyMatchClients } from "../lib/fuzzy-match";

export async function handleLinkCommand(message: Message) {
  const parts = message.content.trim().split(/\s+/);
  const email = parts[1]?.toLowerCase();

  if (!email || !email.includes("@")) {
    await message.reply(
      "Para vincular tu perfil escribí: **!vincular tu@email.com**\n" +
        "Usá el mismo email con el que te inscribiste al programa."
    );
    return;
  }

  const guildId = message.guildId!;
  const integration = await getOrgByGuildId(guildId);

  if (!integration) return;

  const orgId = integration.organization_id as string;

  const existingLink = await getClientLink(orgId, message.author.id);
  if (existingLink) {
    const clientName =
      (existingLink.clients as { name?: string } | null)?.name ?? "tu perfil";
    await message.reply(
      `Tu perfil ya está vinculado como **${clientName}**. ` +
        `Si creés que hay un error, contactá al equipo.`
    );
    return;
  }

  const clientByEmail = await getClientByEmail(email, orgId);

  if (clientByEmail) {
    await saveClientLink({
      organization_id: orgId,
      client_id: clientByEmail.id,
      discord_user_id: message.author.id,
      discord_username: message.author.username,
      discord_display_name:
        message.member?.displayName || message.author.username,
      link_method: "email_command",
      link_confidence: 1.0,
    });

    await message.reply(
      `Perfecto, **${clientByEmail.name}**! Tu perfil quedó vinculado correctamente. ` +
        `A partir de ahora tengo acceso a tu historial y puedo darte seguimiento personalizado.`
    );
    return;
  }

  const clients = await getClients(orgId);
  const displayName = message.member?.displayName || message.author.username;
  const matches = fuzzyMatchClients(displayName, clients);

  if (matches.length === 1 && matches[0].confidence > 0.85) {
    await saveClientLink({
      organization_id: orgId,
      client_id: matches[0].client.id,
      discord_user_id: message.author.id,
      discord_username: message.author.username,
      discord_display_name: displayName,
      link_method: "name_fuzzy",
      link_confidence: matches[0].confidence,
    });

    await message.reply(
      `Hola **${matches[0].client.name}**! Te vinculé por nombre. ` +
        `Si el email que pusiste no estaba en el sistema, ` +
        `contactá al equipo para actualizarlo.`
    );
    return;
  }

  await message.reply(
    `No encontré tu perfil con ese email. ` +
      `Contactá al equipo para que te vinculen manualmente.`
  );

  await notifyPendingLink({
    organizationId: orgId,
    discordUserId: message.author.id,
    discordUsername: message.author.username,
    displayName,
    emailAttempted: email,
    channelId: message.channelId,
    channelName: (message.channel as TextChannel).name,
  });
}

async function notifyPendingLink(data: {
  organizationId: string;
  discordUserId: string;
  discordUsername: string;
  displayName: string;
  emailAttempted: string;
  channelId: string;
  channelName: string;
}) {
  try {
    await fetch(`${process.env.OTC_API_URL}/api/discord/pending-link`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OTC_WEBHOOK_SECRET}`,
      },
      body: JSON.stringify(data),
    });
  } catch (e) {
    console.error("Error notifying pending link:", e);
  }
}
