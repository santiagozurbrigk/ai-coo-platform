import { Client } from "discord.js";
import { describirClave, diagnosticarAcceso, supabaseHost } from "../lib/supabase";
import { log, logError } from "../utils/logger";

export async function handleReady(client: Client) {
  log(`Discord bot online: ${client.user?.tag}`);
  log(`Monitoring ${client.guilds.cache.size} server(s)`);

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

  // No alcanza con mirar la clave: lo que importa es que la base conteste. Esta
  // linea es la que cierra el diagnostico sin tener que adivinar.
  log(`Acceso a datos: ${await diagnosticarAcceso()}`);

  for (const guild of client.guilds.cache.values()) {
    log(`  servidor: ${guild.name} (${guild.id})`);
  }
}
