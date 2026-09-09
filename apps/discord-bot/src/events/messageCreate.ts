import { Message } from "discord.js";
import { handleLinkCommand } from "../handlers/link-handler";
import { processMessage } from "../handlers/message-handler";
import { logError } from "../utils/logger";

export async function handleMessageCreate(message: Message) {
  if (message.author.bot) return;

  try {
    if (message.content.toLowerCase().startsWith("!vincular")) {
      await handleLinkCommand(message);
      return;
    }

    await processMessage(message);
  } catch (error) {
    logError("Error handling message:", error);
    // Un comando que falla sin decir nada es indistinguible de un bot dormido.
    if (message.content.toLowerCase().startsWith("!vincular")) {
      await message
        .reply("Algo falló de mi lado procesando el comando. Avisale al equipo.")
        .catch(() => undefined);
    }
  }
}
