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
  }
}
