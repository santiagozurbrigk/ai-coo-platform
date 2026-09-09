import { Client } from "discord.js";
import { supabaseHost } from "../lib/supabase";
import { log } from "../utils/logger";

export function handleReady(client: Client) {
  log(`Discord bot online: ${client.user?.tag}`);
  log(`Monitoring ${client.guilds.cache.size} server(s)`);
  // Sin esta linea, un bot apuntado a la base equivocada arranca perfecto y no
  // encuentra nada, y no hay forma de notarlo desde afuera.
  log(`Base de datos: ${supabaseHost()}`);
  for (const guild of client.guilds.cache.values()) {
    log(`  servidor: ${guild.name} (${guild.id})`);
  }
}
