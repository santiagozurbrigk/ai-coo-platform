import { sanitizeFilename } from "@/lib/workboard/attachment-types";

const ALLOWED_EXTENSIONS = new Set([
  "pdf",
  "doc",
  "docx",
  "txt",
  "md",
  "png",
  "jpg",
  "jpeg",
  "webp",
]);

const ALLOWED_MIME = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "text/markdown",
  "image/png",
  "image/jpeg",
  "image/webp",
]);

export function isAllowedSopAttachment(
  fileName: string,
  mimeType: string,
  fileSize?: number
): { ok: true; mimeType: string } | { ok: false; error: string } {
  const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
  const normalizedMime = mimeType.split(";")[0]?.trim().toLowerCase() ?? "";

  if (!ALLOWED_EXTENSIONS.has(ext) && !ALLOWED_MIME.has(normalizedMime)) {
    return {
      ok: false,
      error: "Tipo de archivo no permitido. Usá PDF, Word, TXT, MD o imágenes.",
    };
  }

  if (fileSize != null && fileSize > 25 * 1024 * 1024) {
    return { ok: false, error: "El archivo no puede superar 25 MB." };
  }

  return { ok: true, mimeType: normalizedMime || "application/octet-stream" };
}

export { sanitizeFilename };
