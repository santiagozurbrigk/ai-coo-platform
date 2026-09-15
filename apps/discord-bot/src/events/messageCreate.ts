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
    // El aviso al usuario lo da `handleLinkCommand`, que es quien sabe si el
    // servidor tiene permitido que el bot escriba. Acá sólo queda el registro.
    logError("Error handling message:", error);
  }
}
