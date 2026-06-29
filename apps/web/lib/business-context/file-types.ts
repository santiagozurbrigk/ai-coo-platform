/** Tipos permitidos para subida manual de documentos de contexto (Fase 1). */

export const BUSINESS_CONTEXT_MAX_FILE_BYTES = 25 * 1024 * 1024; // 25 MB

const EXTENSION_MIME: Record<string, string> = {
  pdf: "application/pdf",
  txt: "text/plain",
  md: "text/markdown",
};

const ALLOWED_MIMES = new Set(Object.values(EXTENSION_MIME));

export function extensionFromFilename(name: string): string {
  const parts = name.split(".");
  return parts.length > 1 ? (parts.pop()?.toLowerCase() ?? "") : "";
}

export function resolveDocumentMimeType(
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

export function isAllowedDocumentFile(
  fileName: string,
  reportedMime?: string,
  fileSize?: number
): { ok: true; mimeType: string } | { ok: false; error: string } {
  if (fileSize != null && fileSize > BUSINESS_CONTEXT_MAX_FILE_BYTES) {
    return {
      ok: false,
      error: `El archivo supera el límite de ${
        BUSINESS_CONTEXT_MAX_FILE_BYTES / (1024 * 1024)
      } MB.`,
    };
  }

  const mimeType = resolveDocumentMimeType(fileName, reportedMime);
  if (!mimeType) {
    return {
      ok: false,
      error: "Formato no permitido. Usá PDF, TXT o MD.",
    };
  }

  return { ok: true, mimeType };
}

export function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120);
}

export const BUSINESS_CONTEXT_ACCEPT =
  ".pdf,.txt,.md,application/pdf,text/plain,text/markdown";

export const BUSINESS_CONTEXT_FORMATS_LABEL = "PDF, TXT o MD · hasta 25 MB";
