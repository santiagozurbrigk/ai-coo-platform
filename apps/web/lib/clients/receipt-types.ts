import { sanitizeFilename } from "@/lib/business-context/file-types";
import {
  CLIENT_PAYMENT_RECEIPTS_ACCEPT,
  CLIENT_PAYMENT_RECEIPTS_MAX_BYTES,
} from "./constants";

const EXTENSION_MIME: Record<string, string> = {
  pdf: "application/pdf",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
};

const ALLOWED_MIMES = new Set(Object.values(EXTENSION_MIME));

function extensionFromFilename(name: string): string {
  const parts = name.split(".");
  return parts.length > 1 ? (parts.pop()?.toLowerCase() ?? "") : "";
}

function resolveMimeType(fileName: string, reportedMime?: string): string | null {
  const normalized = reportedMime?.split(";")[0]?.trim().toLowerCase();
  if (normalized && ALLOWED_MIMES.has(normalized)) return normalized;
  const ext = extensionFromFilename(fileName);
  return EXTENSION_MIME[ext] ?? null;
}

export function isAllowedPaymentReceipt(
  fileName: string,
  reportedMime?: string,
  fileSize?: number
): { ok: true; mimeType: string } | { ok: false; error: string } {
  if (fileSize != null && fileSize > CLIENT_PAYMENT_RECEIPTS_MAX_BYTES) {
    return {
      ok: false,
      error: `El archivo supera el límite de ${
        CLIENT_PAYMENT_RECEIPTS_MAX_BYTES / (1024 * 1024)
      } MB.`,
    };
  }

  const mimeType = resolveMimeType(fileName, reportedMime);
  if (!mimeType) {
    return {
      ok: false,
      error: "Formato no permitido. Usá PDF, PNG, JPG o WEBP.",
    };
  }

  return { ok: true, mimeType };
}

export { sanitizeFilename, CLIENT_PAYMENT_RECEIPTS_ACCEPT };
