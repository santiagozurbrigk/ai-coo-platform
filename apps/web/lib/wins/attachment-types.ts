/**
 * Qué se acepta como captura de un win.
 *
 * Sólo imágenes: una captura es una imagen. Aceptar PDFs o documentos abriría la
 * puerta a usar el bucket como archivo general, que no es lo que es.
 */
import { sanitizeFilename } from "@/lib/workboard/attachment-types";

const ALLOWED_EXTENSIONS = new Set(["png", "jpg", "jpeg", "webp"]);
const ALLOWED_MIME = new Set(["image/png", "image/jpeg", "image/webp"]);

/** Igual que el límite del bucket, para fallar acá con un mensaje claro. */
const MAX_BYTES = 10 * 1024 * 1024;

export function isAllowedWinAttachment(
  fileName: string,
  mimeType: string,
  fileSize?: number
): { ok: true; mimeType: string } | { ok: false; error: string } {
  const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
  const normalizedMime = mimeType.split(";")[0]?.trim().toLowerCase() ?? "";

  if (!ALLOWED_EXTENSIONS.has(ext) || !ALLOWED_MIME.has(normalizedMime)) {
    return {
      ok: false,
      error: "La captura tiene que ser una imagen PNG, JPG o WEBP.",
    };
  }

  if (fileSize != null && fileSize > MAX_BYTES) {
    return { ok: false, error: "La captura no puede superar 10 MB." };
  }

  return { ok: true, mimeType: normalizedMime };
}

export { sanitizeFilename };
