import * as dotenv from "dotenv";
import { createDiscordClient } from "./client";
import { handleReady } from "./events/ready";
import { handleMessageCreate } from "./events/messageCreate";
import { handleChannelCreate } from "./events/channelCreate";
import { log, logError } from "./utils/logger";

dotenv.config();

const required = [
  "DISCORD_BOT_TOKEN",
  "SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  // Sin estas dos el bot arranca y guarda mensajes, pero no puede avisarle a OTC
  // de un testimonio ni de una vinculación pendiente: falla en silencio en cada
  // request. Es peor que no arrancar.
  "OTC_API_URL",
  "OTC_WEBHOOK_SECRET",
];

const missing = required.filter((key) => !process.env[key]);
if (missing.length > 0) {
  logError(
    `Faltan variables de entorno: ${missing.join(", ")}. ` +
      `Cargalas en el servicio (ver apps/discord-bot/.env.example).`
  );
  process.exit(1);
}

const client = createDiscordClient();

client.once("ready", () => handleReady(client));
client.on("messageCreate", handleMessageCreate);
client.on("channelCreate", handleChannelCreate);

/**
 * Un error del gateway no debe matar el proceso en silencio: Railway lo
 * reiniciaría en loop sin que nadie sepa por qué.
 */
client.on("error", (error) => logError(`Error del gateway de Discord: ${error.message}`));

process.on("unhandledRejection", (reason) => {
  logError(`Promesa sin manejar: ${reason instanceof Error ? reason.message : String(reason)}`);
});

/** Railway manda SIGTERM al redesplegar: cerrar limpio evita sesiones colgadas. */
for (const signal of ["SIGTERM", "SIGINT"] as const) {
  process.on(signal, () => {
    log(`${signal} recibido: cerrando la conexión con Discord.`);
    void client.destroy().finally(() => process.exit(0));
  });
}

client.login(process.env.DISCORD_BOT_TOKEN).catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);

  // ⭐ El error más probable del primer despliegue, y el más confuso: el intent
  // MESSAGE CONTENT es privilegiado y hay que activarlo a mano en el portal.
  // Sin esto, el mensaje de discord.js no dice qué hacer.
  if (message.includes("disallowed intents")) {
    logError(
      "Discord rechazó los intents. Activá MESSAGE CONTENT INTENT en " +
        "https://discord.com/developers/applications → tu app → Bot → " +
        "Privileged Gateway Intents, y volvé a desplegar."
    );
  } else if (message.toLowerCase().includes("token")) {
    logError(`El token del bot no es válido: ${message}`);
  } else {
    logError(`No se pudo conectar con Discord: ${message}`);
  }
  process.exit(1);
});
