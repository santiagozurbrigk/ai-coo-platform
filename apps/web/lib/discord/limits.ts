/**
 * Límites de Discord para el perfil del bot.
 *
 * Viven en su propio módulo, sin importar nada, porque **la pantalla también
 * los necesita**: el `maxLength` del campo y el `accept` del selector de archivo
 * tienen que decir lo mismo que valida el servidor. Importarlos de `profile.ts`
 * arrastraría al bundle del cliente el módulo que habla con la API de Discord.
 */

/** Tope de Discord para un apodo por servidor. */
export const MAX_NICKNAME_LENGTH = 32;

/**
 * Formatos que Discord acepta **para subir**, según Reference → Image Data:
 * "Image data is a Data URI scheme that supports JPG, GIF, and PNG formats."
 *
 * WebP se puede leer de su CDN pero no subir. Está afuera a propósito: dejarlo
 * pasar sería aceptar un archivo que Discord después rechaza con un 400 opaco.
 */
export const DISCORD_IMAGE_MIME_TYPES = [
  "image/png",
  "image/jpeg",
  "image/gif",
] as const;

export type DiscordImageMimeType = (typeof DISCORD_IMAGE_MIME_TYPES)[number];

/** Tope propio, por debajo del límite del bucket, para fallar con un texto claro. */
export const BOT_AVATAR_MAX_BYTES = 4 * 1024 * 1024;
