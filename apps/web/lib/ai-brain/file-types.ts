/** Tipos permitidos en el bucket ai-brain-documents */

export const AI_BRAIN_MAX_FILE_BYTES = 50 * 1024 * 1024; // 50 MB

const EXTENSION_MIME: Record<string, string> = {
  pdf: "application/pdf",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  txt: "text/plain",
  md: "text/markdown",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
};

const ALLOWED_MIMES = new Set(Object.values(EXTENSION_MIME));

export function extensionFromFilename(name: string): string {
  const parts = name.split(".");
  return parts.length > 1 ? (parts.pop()?.toLowerCase() ?? "") : "";
}

export function resolveBrainFileMimeType(
  fileName: string,
  reportedMime?: string
): string | null {
  const normalized = reportedMime?.split(";")[0]?.trim().toLowerCase();
  if (normalized && ALLOWED_MIMES.has(normalized)) {
    return normalized;
  }

  const ext = extensionFromFilename(fileName);
  return EXTENSION_MIME[ext] ?? null;
}

export function isAllowedBrainFile(
  fileName: string,
  reportedMime?: string,
  fileSize?: number
): { ok: true; mimeType: string } | { ok: false; error: string } {
  if (fileSize != null && fileSize > AI_BRAIN_MAX_FILE_BYTES) {
    return {
      ok: false,
      error: `El archivo supera el límite de ${AI_BRAIN_MAX_FILE_BYTES / (1024 * 1024)} MB.`,
    };
  }

  const mimeType = resolveBrainFileMimeType(fileName, reportedMime);
  if (!mimeType) {
    return {
      ok: false,
      error:
        "Formato no permitido. Usá PDF, DOCX, XLSX, TXT, MD, PNG, JPG o WEBP.",
    };
  }

  return { ok: true, mimeType };
}

export const AI_BRAIN_ACCEPT =
  ".pdf,.docx,.xlsx,.txt,.md,.png,.jpg,.jpeg,.webp,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

export const AI_BRAIN_FORMATS_LABEL =
  "PDF, DOCX, XLSX, TXT, MD, PNG, JPG, WEBP";
