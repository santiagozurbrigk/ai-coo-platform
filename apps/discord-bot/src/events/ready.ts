import { Client } from "discord.js";
import { describirClave, supabaseHost } from "../lib/supabase";
import { log, logError } from "../utils/logger";

export function handleReady(client: Client) {
  log(`Discord bot online: ${client.user?.tag}`);
  log(`Monitoring ${client.guilds.cache.size} server(s)`);

  // Sin estas dos lineas, un bot apuntado a la base equivocada —o con la clave
  // equivocada— arranca perfecto y no encuentra nada, y no hay forma de notarlo
  // desde afuera.
  const clave = describirClave();
  log(`Base de datos: ${supabaseHost()} (clave: ${clave.rol})`);

  if (!clave.sirve) {
    logError(
      `La clave de Supabase es "${clave.rol}", no la service role. Con una clave ` +
        `publica, RLS devuelve CERO FILAS SIN ERROR: el bot va a decir que ningun ` +
        `servidor esta vinculado aunque lo este. Cargá SUPABASE_SERVICE_ROLE_KEY ` +
        `con la service role de Supabase → Settings → API.`
    );
  }

  for (const guild of client.guilds.cache.values()) {
    log(`  servidor: ${guild.name} (${guild.id})`);
  }
}
