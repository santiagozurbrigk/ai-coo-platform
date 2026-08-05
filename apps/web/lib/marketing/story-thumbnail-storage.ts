/**
 * Persiste thumbnails de historias de Instagram en Supabase Storage
 * antes de que expiren (las historias duran 24hs en Instagram).
 *
 * Bucket: content-thumbnails (público, acceso de lectura sin autenticación)
 * Path:   {organizationId}/stories/{platformPostId}.jpg
 */
import { createAdminClient } from "@/lib/supabase/admin";

const BUCKET = "content-thumbnails";

export function storyThumbnailPath(
  organizationId: string,
  platformPostId: string
): string {
  // Sanitizar el ID de la plataforma para que sea un path válido
  const safeId = platformPostId.replace(/[^a-zA-Z0-9_\-]/g, "_");
  return `${organizationId}/stories/${safeId}.jpg`;
}

/**
 * Descarga el thumbnail de una historia desde la URL efímera de Instagram/Zernio
 * y lo persiste en Supabase Storage.
 *
 * Retorna la URL pública persistida, o null si falla (no bloquea el sync).
 */
export async function persistStoryThumbnail(
  organizationId: string,
  platformPostId: string,
  ephemeralUrl: string
): Promise<string | null> {
  if (!ephemeralUrl?.trim()) return null;

  const admin = createAdminClient();
  const path = storyThumbnailPath(organizationId, platformPostId);

  // Si ya existe, no re-descargamos
  const { data: existing } = await admin.storage
    .from(BUCKET)
    .list(`${organizationId}/stories`, {
      search: `${platformPostId.replace(/[^a-zA-Z0-9_\-]/g, "_")}.jpg`,
    });

  if (existing && existing.length > 0) {
    const { data: urlData } = admin.storage.from(BUCKET).getPublicUrl(path);
    return urlData?.publicUrl ?? null;
  }

  // Descargar la imagen desde la URL efímera
  let imageBuffer: ArrayBuffer;
  try {
    const res = await fetch(ephemeralUrl, { signal: AbortSignal.timeout(10_000) });
    if (!res.ok) {
      console.warn("[storyThumbnail] failed to fetch ephemeral URL", {
        url: ephemeralUrl,
        status: res.status,
      });
      return null;
    }
    imageBuffer = await res.arrayBuffer();
  } catch (err) {
    console.warn("[storyThumbnail] fetch error", {
      url: ephemeralUrl,
      error: err instanceof Error ? err.message : err,
    });
    return null;
  }

  // Subir al bucket
  const { error: uploadError } = await admin.storage
    .from(BUCKET)
    .upload(path, imageBuffer, {
      contentType: "image/jpeg",
      upsert: true, // sobreescribir si por alguna razón ya existe
      cacheControl: "31536000", // 1 año — es inmutable
    });

  if (uploadError) {
    console.warn("[storyThumbnail] upload error", {
      path,
      error: uploadError.message,
    });
    return null;
  }

  const { data: urlData } = admin.storage.from(BUCKET).getPublicUrl(path);
  return urlData?.publicUrl ?? null;
}

/**
 * Genera la URL pública de un thumbnail de historia ya persistido
 * sin hacer ninguna llamada de red (para lectura).
 */
export function getPersistedStoryThumbnailUrl(
  organizationId: string,
  platformPostId: string
): string {
  const admin = createAdminClient();
  const path = storyThumbnailPath(organizationId, platformPostId);
  const { data } = admin.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
