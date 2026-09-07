export const SOP_ATTACHMENTS_BUCKET = "sop-attachments";

export const SOP_ATTACHMENTS_MAX_BYTES = 25 * 1024 * 1024;

export const SOP_ATTACHMENTS_ACCEPT =
  ".pdf,.doc,.docx,.txt,.md,.png,.jpg,.jpeg,.webp,application/pdf,text/plain,text/markdown,image/png,image/jpeg,image/webp";

/** Bucket privado de los videos que se convierten en SOP. */
export const SOP_VIDEOS_BUCKET = "sop-videos";

/**
 * ⭐ El tamaño máximo real de un video, y por qué no es el del bucket.
 *
 * Por encima del límite del bucket manda el **límite global del proyecto de
 * Supabase**, que en el plan gratis no puede pasar de 50 MB. El bucket dice
 * 1 GB y eso no sirve de nada: un archivo de 246 MB se transfiere entero, tarda
 * 35 segundos, y recién ahí Storage lo rechaza con un 400 que no explica nada.
 *
 * Acá estaba el error: el código decía 1 GB porque miré la configuración del
 * bucket sin mirar el techo del plan. Prometer un límite que la plataforma no
 * respeta es peor que tener un límite bajo, porque el usuario se entera cuando
 * ya perdió el tiempo.
 *
 * `SOP_VIDEO_MAX_BYTES` sale de una variable de entorno para que el día que se
 * pase a Pro no haya que tocar código: se sube el límite global en Supabase, se
 * sube esta variable, y listo.
 */
const LIMITE_PLAN_GRATIS = 50 * 1024 * 1024;

export const SOP_VIDEO_MAX_BYTES = (() => {
  const configurado = Number(process.env.NEXT_PUBLIC_SOP_VIDEO_MAX_MB);
  if (Number.isFinite(configurado) && configurado > 0) {
    return Math.floor(configurado) * 1024 * 1024;
  }
  return LIMITE_PLAN_GRATIS;
})();

export function formatearLimiteDeVideo(): string {
  const mb = Math.round(SOP_VIDEO_MAX_BYTES / (1024 * 1024));
  return mb >= 1024 ? `${Math.round(mb / 1024)} GB` : `${mb} MB`;
}
