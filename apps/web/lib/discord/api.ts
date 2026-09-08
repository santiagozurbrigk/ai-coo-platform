/**
 * Lectura de la API de Discord con el token del bot.
 *
 * Sólo lo que la pantalla de configuración necesita: listar los canales del
 * servidor conectado para poder elegir cuáles se monitorean.
 *
 * El token nunca sale del servidor. Se usa el mismo que ya usa el callback de
 * OAuth para leer el nombre del servidor al conectar.
 */

const API = "https://discord.com/api/v10";

/** Canal de texto donde el bot puede leer. `type: 0` en la API de Discord. */
const TEXT_CHANNEL = 0;

export type DiscordGuildChannel = {
  id: string;
  name: string;
};

export class DiscordApiError extends Error {}

/**
 * Canales de texto del servidor, ordenados por nombre.
 *
 * Discord devuelve **sólo los que el bot puede ver**. Un canal privado al que no
 * lo invitaron no aparece acá, y eso es correcto: tampoco podría leerlo.
 */
export async function listGuildTextChannels(
  guildId: string,
): Promise<DiscordGuildChannel[]> {
  const token = process.env.DISCORD_BOT_TOKEN?.trim();
  if (!token) {
    throw new DiscordApiError(
      "Falta DISCORD_BOT_TOKEN en el servidor: sin el token no se pueden listar los canales.",
    );
  }

  let response: Response;
  try {
    response = await fetch(`${API}/guilds/${guildId}/channels`, {
      headers: { Authorization: `Bot ${token}` },
      cache: "no-store",
      // Sin límite de tiempo, una respuesta lenta de Discord deja el selector
      // en "Buscando…" para siempre: el usuario no puede distinguir eso de una
      // lista vacía, y no tiene forma de reintentar.
      signal: AbortSignal.timeout(10_000),
    });
  } catch {
    throw new DiscordApiError(
      "Discord no respondió a tiempo. Probá de nuevo en un momento."
    );
  }

  if (!response.ok) {
    throw new DiscordApiError(
      response.status === 403 || response.status === 404
        ? "Discord no devolvió los canales. Revisá que el bot siga en el servidor."
        : `Discord respondió ${response.status} al pedir los canales.`,
    );
  }

  const raw = (await response.json()) as {
    id: string;
    name: string;
    type: number;
  }[];

  return raw
    .filter((channel) => channel.type === TEXT_CHANNEL)
    .map((channel) => ({ id: channel.id, name: channel.name }))
    .sort((a, b) => a.name.localeCompare(b.name, "es"));
}
