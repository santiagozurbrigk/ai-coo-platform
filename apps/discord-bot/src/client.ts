import { Client, GatewayIntentBits, Partials } from "discord.js";

/**
 * ⭐ Los intents que se piden acá son un contrato con Discord: si el bot pide uno
 * **privilegiado** que no está activado en el portal, el login **falla entero**
 * (`Used disallowed intents`) y el proceso muere. No degrada: no arranca.
 *
 * De los que existen, el bot necesita **uno solo privilegiado**:
 *
 * - `MessageContent` (PRIVILEGIADO) — sin esto los mensajes llegan con el
 *   contenido **vacío** y el bot guarda filas en blanco sin errores. Hay que
 *   activarlo en el portal. Gratis hasta 100 servidores; después, verificación.
 * - `Guilds`, `GuildMessages` — no privilegiados.
 *
 * `GuildMembers` **se sacó a propósito**: también es privilegiado, el código no
 * usa nada de members, y pedirlo obligaba a activar un segundo permiso sólo para
 * poder arrancar. Menos permisos pedidos = menos superficie y una cosa menos que
 * puede fallar el día del despliegue.
 */
export function createDiscordClient() {
  return new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
    ],
    partials: [Partials.Channel, Partials.Message],
  });
}
