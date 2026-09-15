import { Message, TextChannel } from "discord.js";
import {
  getOrgByGuildId,
  getClientByEmail,
  getClients,
  saveClientLink,
  getClientLink,
} from "../lib/supabase";
import { fuzzyMatchClients } from "../lib/fuzzy-match";
import { puedeHablar } from "../lib/can-speak";
import { limitlessApiUrl, limitlessWebhookSecret } from "../lib/limitless-api";
import { log, logError } from "../utils/logger";

/**
 * ⭐ `!vincular` en modo silencioso.
 *
 * El comando sigue funcionando: lo único que se apaga es la respuesta en el
 * canal. Pero eso cambia qué conviene hacer con cada resultado, porque ya no hay
 * nadie a quien avisarle si se erró:
 *
 * - **Email exacto** → se vincula igual. Es certeza, no una interpretación, y
 *   mandarlo al buzón sería crearle trabajo manual a alguien para confirmar algo
 *   que el sistema ya sabe.
 * - **Parecido de nombre** → **no** se vincula, va al buzón. Con el bot hablando
 *   se auto-vinculaba y el mensaje decía "te vinculé por nombre, si está mal
 *   avisá" — el aviso era lo que hacía aceptable la corazonada. Sin ese mensaje,
 *   una conjetura se convertiría en un hecho que nadie puede ver ni corregir.
 * - **Sin coincidencia** → al buzón, igual que siempre.
 */
export async function handleLinkCommand(message: Message) {
  const guildId = message.guildId!;
  const integration = await getOrgByGuildId(guildId);

  /**
   * Un servidor sin integración no tiene configuración que respetar, así que
   * acá el bot habla igual. Antes se iba en silencio: quien escribía
   * `!vincular` no recibía nada y no quedaba rastro.
   */
  if (!integration) {
    await message.reply(
      "Este servidor no está vinculado a Limitless todavía. Avisale al equipo."
    );
    return;
  }

  const hablar = puedeHablar(integration);

  /**
   * ⭐ El aviso de error se resuelve acá y no en `messageCreate`.
   *
   * Es el único lugar del flujo que ya sabe si el servidor está en silencio.
   * Arriba habría que volver a preguntárselo a la base —y si lo que falló fue
   * justamente la base, esa consulta también falla y el bot terminaría
   * rompiendo el silencio con un mensaje de error, en el peor momento posible.
   */
  try {
    await vincular(message, integration, hablar);
  } catch (error) {
    logError("Error en !vincular:", error);
    // Un comando que falla sin decir nada es indistinguible de un bot dormido.
    if (hablar) {
      await message
        .reply("Algo falló de mi lado procesando el comando. Avisale al equipo.")
        .catch(() => undefined);
    }
  }
}

async function vincular(
  message: Message,
  integration: Record<string, unknown>,
  hablar: boolean
) {
  const orgId = integration.organization_id as string;
  const displayName = message.member?.displayName || message.author.username;

  /** Responde en el canal, o no dice nada si el servidor está en silencio. */
  const responder = async (texto: string) => {
    if (!hablar) return;
    await message.reply(texto);
  };

  const parts = message.content.trim().split(/\s+/);
  const email = parts[1]?.toLowerCase();

  if (!email || !email.includes("@")) {
    await responder(
      "Para vincular tu perfil escribí: **!vincular tu@email.com**\n" +
        "Usá el mismo email con el que te inscribiste al programa.",
    );
    // En silencio no hay forma de pedirle que lo reescriba, pero su identidad
    // de Discord alcanza para vincularlo a mano desde el panel.
    if (!hablar) {
      await notifyPendingLink({
        organizationId: orgId,
        discordUserId: message.author.id,
        discordUsername: message.author.username,
        displayName,
        emailAttempted: "",
        channelId: message.channelId,
        channelName: (message.channel as TextChannel).name,
      });
    }
    return;
  }

  const existingLink = await getClientLink(orgId, message.author.id);
  if (existingLink) {
    const clientName =
      (existingLink.clients as { name?: string } | null)?.name ?? "tu perfil";
    await responder(
      `Tu perfil ya está vinculado como **${clientName}**. ` +
        `Si creés que hay un error, contactá al equipo.`,
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
      discord_display_name: displayName,
      link_method: "email_command",
      link_confidence: 1.0,
    });

    if (!hablar) {
      log(
        `[discord] ${message.author.username} vinculado en silencio a ` +
          `${clientByEmail.name} por email exacto.`
      );
      return;
    }

    await message.reply(
      `Perfecto, **${clientByEmail.name}**! Tu perfil quedó vinculado correctamente. ` +
        `A partir de ahora tengo acceso a tu historial y puedo darte seguimiento personalizado.`,
    );
    return;
  }

  const clients = await getClients(orgId);
  const matches = fuzzyMatchClients(displayName, clients);

  if (hablar && matches.length === 1 && matches[0].confidence > 0.85) {
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
        `contactá al equipo para actualizarlo.`,
    );
    return;
  }

  await responder(
    `No encontré tu perfil con ese email. ` +
      `Contactá al equipo para que te vinculen manualmente.`,
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
    await fetch(`${limitlessApiUrl()}/api/discord/pending-link`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${limitlessWebhookSecret()}`,
      },
      body: JSON.stringify(data),
    });
  } catch (e) {
    console.error("Error notifying pending link:", e);
  }
}
