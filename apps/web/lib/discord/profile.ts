/**
 * El perfil del bot **dentro de un servidor**: apodo y foto.
 *
 * ⭐ Por qué existe. El nombre y la foto que se configuran en el portal de
 * Discord son de la aplicación: uno solo para todos los clientes. Lo que cada
 * organización quiere es que en SU servidor el bot se llame y se vea como su
 * marca. Discord lo permite con un perfil por servidor
 * (`PATCH /guilds/{id}/members/@me`), habilitado para bots recién en septiembre
 * de 2025 — antes de eso la única salida era una aplicación de Discord por
 * cliente, con su propio token y su propia conexión al gateway.
 *
 * Se aplica desde la aplicación web y no desde el bot: la web ya tiene el token
 * (`DISCORD_BOT_TOKEN`, el mismo que lista los canales) y así el usuario ve el
 * resultado real en el momento en que guarda. Hacerlo del lado del bot obligaba
 * a inventar un canal web → bot que hoy no existe, y a que el rechazo llegara
 * —si llegaba— a un log de Railway que el usuario no mira.
 *
 * Cada campo se manda en su propia llamada a propósito: el apodo necesita el
 * permiso `CHANGE_NICKNAME` y la foto no necesita ninguno. Mandados juntos, una
 * instalación vieja sin ese permiso haría fallar **también** la foto, que sí
 * podía aplicarse.
 */

import { DiscordApiError, discordBotFetch } from "./api";
import type { DiscordImageMimeType } from "./limits";

/** La imagen viaja como data URI, no como multipart. */
export function toImageDataUri(
  buffer: Buffer,
  mimeType: DiscordImageMimeType,
): string {
  return `data:${mimeType};base64,${buffer.toString("base64")}`;
}

type GuildProfilePatch = {
  /** `null` borra el apodo y deja el nombre de la aplicación. */
  nick?: string | null;
  /** Data URI. `null` borra la foto por servidor. */
  avatar?: string | null;
};

/**
 * Traduce el estado de Discord a algo accionable.
 *
 * ⭐ El 403 al cambiar el apodo es el caso que más va a pasar y el menos obvio:
 * `CHANGE_NICKNAME` se agregó a la invitación junto con esta función, así que
 * **todo servidor conectado antes no lo tiene**, y subir el número de permisos
 * no cambia una instalación existente — Discord sólo aplica los permisos nuevos
 * cuando se vuelve a autorizar el bot. Sin este texto, el usuario ve "no se
 * pudo" sin ninguna pista de qué hacer.
 */
function explicarRechazo(status: number, patch: GuildProfilePatch): string {
  const tocaApodo = "nick" in patch;

  if (status === 403) {
    return tocaApodo
      ? "Discord no dejó cambiar el nombre: al bot le falta el permiso «Cambiar apodo» " +
          "en tu servidor. Volvé a conectar Discord desde Integraciones para " +
          "otorgárselo, o agregáselo a mano al rol del bot."
      : "Discord rechazó el cambio. Revisá que el bot siga en el servidor.";
  }

  if (status === 404) {
    return "Discord no encuentra al bot en tu servidor. Puede que lo hayan expulsado.";
  }

  if (status === 400) {
    return tocaApodo
      ? "Discord rechazó ese nombre. Probá con uno más corto o sin caracteres raros."
      : "Discord rechazó la imagen. Tiene que ser PNG, JPG o GIF.";
  }

  if (status === 429) {
    return "Discord está limitando los cambios de perfil. Esperá un minuto y probá de nuevo.";
  }

  return `Discord respondió ${status} al aplicar el perfil del bot.`;
}

/**
 * Aplica el perfil en el servidor. Lanza `DiscordApiError` si Discord lo rechaza.
 */
export async function applyGuildProfile(
  guildId: string,
  patch: GuildProfilePatch,
): Promise<void> {
  const response = await discordBotFetch(`/guilds/${guildId}/members/@me`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });

  if (!response.ok) {
    throw new DiscordApiError(explicarRechazo(response.status, patch));
  }
}
