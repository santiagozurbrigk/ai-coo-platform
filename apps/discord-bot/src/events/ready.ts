import { Client } from "discord.js";
import { log } from "../utils/logger";

export function handleReady(client: Client) {
  log(`Discord bot online: ${client.user?.tag}`);
  log(`Monitoring ${client.guilds.cache.size} server(s)`);
}
