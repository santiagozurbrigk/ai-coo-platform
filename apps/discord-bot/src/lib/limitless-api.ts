/**
 * Datos de conexión con la aplicación Limitless.
 *
 * Se lee primero el nombre nuevo de cada variable y después el legado, para que
 * el renombrado no tumbe el bot mientras la configuración del host todavía no se
 * actualizó. Los nombres viejos se pueden borrar de acá una vez que
 * `LIMITLESS_API_URL` y `LIMITLESS_WEBHOOK_SECRET` estén cargadas.
 */
export function limitlessApiUrl(): string | null {
  const value =
    process.env.LIMITLESS_API_URL?.trim() || process.env.OTC_API_URL?.trim();
  return value ? value.replace(/\/$/, "") : null;
}

export function limitlessWebhookSecret(): string | null {
  const value =
    process.env.LIMITLESS_WEBHOOK_SECRET?.trim() ||
    process.env.OTC_WEBHOOK_SECRET?.trim();
  return value || null;
}
