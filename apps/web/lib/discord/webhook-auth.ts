import { timingSafeEqual } from "node:crypto";

/**
 * Secreto compartido entre el bot de Discord y la aplicación.
 *
 * Se lee primero el nombre nuevo y después el legado, para que renombrar la
 * variable no tumbe el bot mientras la configuración del host todavía no se
 * actualizó. El nombre viejo se puede borrar de acá una vez que
 * `LIMITLESS_WEBHOOK_SECRET` esté cargada en producción.
 */
export function discordWebhookSecret(): string | null {
  const value =
    process.env.LIMITLESS_WEBHOOK_SECRET?.trim() ||
    process.env.OTC_WEBHOOK_SECRET?.trim();
  return value || null;
}

/**
 * Autoriza una llamada del bot de Discord.
 *
 * ⚠️ **Sin secreto configurado no se autoriza nada.** Antes cada ruta comparaba
 * contra `` `Bearer ${process.env.OTC_WEBHOOK_SECRET}` ``: con la variable sin
 * cargar, esa plantilla resuelve a la cadena `"Bearer undefined"` y cualquiera
 * que mandara exactamente ese encabezado entraba.
 */
export function isDiscordWebhookAuthorized(authHeader: string | null): boolean {
  const secret = discordWebhookSecret();
  if (!secret || !authHeader) return false;

  const expected = Buffer.from(`Bearer ${secret}`);
  const received = Buffer.from(authHeader);
  if (expected.length !== received.length) return false;

  return timingSafeEqual(expected, received);
}
