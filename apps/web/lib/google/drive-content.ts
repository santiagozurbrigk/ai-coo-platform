import { GoogleIntegrationPermissionError } from "@/lib/google/errors";

export const GOOGLE_DOC_MIME = "application/vnd.google-apps.document";
export const GOOGLE_SHEET_MIME = "application/vnd.google-apps.spreadsheet";

export type GoogleDriveContentFile = {
  id: string;
  name: string;
  modifiedTime?: string;
  /** Descripción editable en Google Drive (puede estar vacía). */
  description?: string;
  /** URL de miniatura (requiere auth — usar proxy OTC para <img>). */
  thumbnailLink?: string;
};

export async function listGoogleDriveFilesByMime(
  accessToken: string,
  mimeType: string
): Promise<GoogleDriveContentFile[]> {
  const url = new URL("https://www.googleapis.com/drive/v3/files");
  url.searchParams.set("q", `mimeType='${mimeType}' and trashed=false`);
  url.searchParams.set("fields", "files(id,name,modifiedTime,description,thumbnailLink)");
  url.searchParams.set("pageSize", "100");
  url.searchParams.set("orderBy", "modifiedTime desc");

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (res.status === 403 || res.status === 401) {
    throw new GoogleIntegrationPermissionError(res.status);
  }

  if (!res.ok) {
    const body = await res.text();
    console.error("[drive-content] list error:", res.status, body);
    return [];
  }

  const data = (await res.json()) as { files?: GoogleDriveContentFile[] };
  return data.files ?? [];
}

/**
 * Exports a Google Doc as Markdown (text/markdown).
 * Returns null if the format is not supported by the file (e.g. Sheets).
 * Falls back to null silently so callers can degrade gracefully.
 */
export async function exportGoogleDocAsMarkdown(
  accessToken: string,
  fileId: string
): Promise<string | null> {
  const url = new URL(
    `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}/export`
  );
  url.searchParams.set("mimeType", "text/markdown");

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (res.status === 403 || res.status === 401) {
    throw new GoogleIntegrationPermissionError(res.status);
  }

  // Some older Docs or Workspace editions may not support markdown export.
  if (!res.ok) return null;

  const text = await res.text();
  return text.trim() || null;
}

export async function exportGoogleDriveFile(
  accessToken: string,
  fileId: string,
  exportMimeType: string
): Promise<string> {
  const url = new URL(
    `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}/export`
  );
  url.searchParams.set("mimeType", exportMimeType);

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (res.status === 403 || res.status === 401) {
    throw new GoogleIntegrationPermissionError(res.status);
  }

  if (!res.ok) {
    const body = await res.text();
    throw new Error(
      `No se pudo exportar el archivo de Google (${res.status}): ${body.slice(0, 200)}`
    );
  }

  return res.text();
}

/** Primeras líneas del archivo exportado (para vista previa en el picker). */
export async function exportGoogleDriveFilePreview(
  accessToken: string,
  fileId: string,
  exportMimeType: string,
  maxChars = 320
): Promise<string> {
  const text = await exportGoogleDriveFile(accessToken, fileId, exportMimeType);
  const clean = text.replace(/\s+/g, " ").trim();
  if (!clean) return "";
  if (clean.length <= maxChars) return clean;
  return `${clean.slice(0, maxChars).trimEnd()}…`;
}

export async function getGoogleDriveFileMetadata(
  accessToken: string,
  fileId: string
): Promise<{ name: string } | null> {
  const url = new URL(
    `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}`
  );
  url.searchParams.set("fields", "name");

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) return null;
  const data = (await res.json()) as { name?: string };
  return data.name ? { name: data.name } : null;
}

/** Descarga la miniatura de un archivo (requiere Bearer en la URL de Google). */
export async function fetchGoogleDriveThumbnail(
  accessToken: string,
  fileId: string
): Promise<{ body: ArrayBuffer; contentType: string } | null> {
  const metaUrl = new URL(
    `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}`
  );
  metaUrl.searchParams.set("fields", "thumbnailLink");

  const metaRes = await fetch(metaUrl.toString(), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (metaRes.status === 403 || metaRes.status === 401) {
    throw new GoogleIntegrationPermissionError(metaRes.status);
  }

  if (!metaRes.ok) return null;

  const meta = (await metaRes.json()) as { thumbnailLink?: string };
  if (!meta.thumbnailLink) return null;

  const thumbRes = await fetch(meta.thumbnailLink, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!thumbRes.ok) return null;

  const contentType = thumbRes.headers.get("content-type") ?? "image/jpeg";
  const body = await thumbRes.arrayBuffer();
  if (!body.byteLength) return null;

  return { body, contentType };
}
