/**
 * Llamadas a la API de Discord con el token del bot.
 *
 * Sólo lo que la pantalla de configuración necesita: listar los canales del
 * servidor conectado, y aplicar el perfil del bot en ese servidor
 * (`./profile.ts`).
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
 * Una llamada a Discord con el token del bot.
 *
 * Centraliza las tres cosas que toda llamada necesita y que es fácil olvidar al
 * agregar la siguiente: el token, el límite de tiempo, y traducir una caída de
 * red en un error con texto en vez de un `TypeError: fetch failed` que no le
 * dice nada a nadie.
 *
 * Devuelve la `Response` tal cual —incluso con estado de error— porque **qué
 * significa un 403 depende de la llamada**: en los canales quiere decir que el
 * bot ya no está en el servidor, y en el perfil que le falta un permiso. Cada
 * quien traduce el suyo.
 */
export async function discordBotFetch(
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  const token = process.env.DISCORD_BOT_TOKEN?.trim();
  if (!token) {
    throw new DiscordApiError(
      "Falta DISCORD_BOT_TOKEN en el servidor: sin el token no se puede hablar con Discord.",
    );
  }

  try {
    return await fetch(`${API}${path}`, {
      ...init,
      headers: { ...init.headers, Authorization: `Bot ${token}` },
      cache: "no-store",
      // Sin límite de tiempo, una respuesta lenta de Discord deja la pantalla
      // esperando para siempre: el usuario no puede distinguir eso de una lista
      // vacía, y no tiene forma de reintentar.
      signal: AbortSignal.timeout(10_000),
    });
  } catch {
    throw new DiscordApiError(
      "Discord no respondió a tiempo. Probá de nuevo en un momento.",
    );
  }
}

/**
 * Canales de texto del servidor, ordenados por nombre.
 *
 * Discord devuelve **sólo los que el bot puede ver**. Un canal privado al que no
 * lo invitaron no aparece acá, y eso es correcto: tampoco podría leerlo.
 */
export async function listGuildTextChannels(
  guildId: string,
): Promise<DiscordGuildChannel[]> {
  const response = await discordBotFetch(`/guilds/${guildId}/channels`);

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
