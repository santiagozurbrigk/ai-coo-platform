/**
 * Persiste thumbnails de contenido (posts, reels, carousels, stories) en Supabase Storage
 * antes de que las URLs efímeras de Instagram expiren.
 *
 * Bucket: content-thumbnails (público, sin autenticación)
 * Paths:
 *   Stories: {organizationId}/stories/{platformPostId}.jpg
 *   Resto:   {organizationId}/posts/{platformPostId}.jpg
 */
import type { ContentPieceType } from "@/types/content";
import { createAdminClient } from "@/lib/supabase/admin";
import { isInstagramCdnUrl } from "@/lib/marketing/cdn-utils";

export { isInstagramCdnUrl } from "@/lib/marketing/cdn-utils";

const BUCKET = "content-thumbnails";

/** Detecta si una URL ya está persistida en nuestro bucket de Supabase. */
export function isPersistedThumbnail(url: string, supabaseUrl: string): boolean {
  return url.startsWith(supabaseUrl);
}

export function contentThumbnailPath(
  organizationId: string,
  platformPostId: string,
  type: ContentPieceType
): string {
  const safeId = platformPostId.replace(/[^a-zA-Z0-9_\-]/g, "_");
  const folder = type === "story" ? "stories" : "posts";
  return `${organizationId}/${folder}/${safeId}.jpg`;
}

/** @deprecated Use contentThumbnailPath */
export function storyThumbnailPath(
  organizationId: string,
  platformPostId: string
): string {
  return contentThumbnailPath(organizationId, platformPostId, "story");
}

/**
 * Descarga una thumbnail desde la URL efímera de Instagram/Zernio
 * y la persiste en Supabase Storage.
 *
 * - Si ya existe en storage → devuelve la URL pública existente (no re-descarga).
 * - Si falla → devuelve null sin lanzar (no bloquea el sync).
 */
export async function persistContentThumbnail(
  organizationId: string,
  platformPostId: string,
  ephemeralUrl: string,
  type: ContentPieceType = "post"
): Promise<string | null> {
  if (!ephemeralUrl?.trim()) return null;

  const admin = createAdminClient();
  const path = contentThumbnailPath(organizationId, platformPostId, type);
  const folder = type === "story" ? "stories" : "posts";
  const safeId = platformPostId.replace(/[^a-zA-Z0-9_\-]/g, "_");

  // Si ya existe en storage, devolver la URL pública sin re-descargar
  const { data: existing } = await admin.storage
    .from(BUCKET)
    .list(`${organizationId}/${folder}`, {
      search: `${safeId}.jpg`,
    });

  if (existing && existing.length > 0) {
    const { data: urlData } = admin.storage.from(BUCKET).getPublicUrl(path);
    return urlData?.publicUrl ?? null;
  }

  // Descargar desde la URL efímera
  let imageBuffer: ArrayBuffer;
  try {
    const res = await fetch(ephemeralUrl, { signal: AbortSignal.timeout(10_000) });
    if (!res.ok) {
      console.warn("[contentThumbnail] failed to fetch ephemeral URL", {
        url: ephemeralUrl,
        status: res.status,
        type,
      });
      return null;
    }
    imageBuffer = await res.arrayBuffer();
  } catch (err) {
    console.warn("[contentThumbnail] fetch error", {
      url: ephemeralUrl,
      error: err instanceof Error ? err.message : err,
      type,
    });
    return null;
  }

  // Subir al bucket
  const { error: uploadError } = await admin.storage
    .from(BUCKET)
    .upload(path, imageBuffer, {
      contentType: "image/jpeg",
      upsert: true,
      cacheControl: "31536000", // 1 año — inmutable
    });

  if (uploadError) {
    console.warn("[contentThumbnail] upload error", {
      path,
      error: uploadError.message,
    });
    return null;
  }

  const { data: urlData } = admin.storage.from(BUCKET).getPublicUrl(path);
  return urlData?.publicUrl ?? null;
}

/** @deprecated Use persistContentThumbnail */
export async function persistStoryThumbnail(
  organizationId: string,
  platformPostId: string,
  ephemeralUrl: string
): Promise<string | null> {
  return persistContentThumbnail(organizationId, platformPostId, ephemeralUrl, "story");
}

/**
 * Genera la URL pública de un thumbnail ya persistido sin llamada de red.
 */
export function getPersistedThumbnailUrl(
  organizationId: string,
  platformPostId: string,
  type: ContentPieceType = "post"
): string {
  const admin = createAdminClient();
  const path = contentThumbnailPath(organizationId, platformPostId, type);
  const { data } = admin.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

/** @deprecated Use getPersistedThumbnailUrl */
export function getPersistedStoryThumbnailUrl(
  organizationId: string,
  platformPostId: string
): string {
  return getPersistedThumbnailUrl(organizationId, platformPostId, "story");
}
