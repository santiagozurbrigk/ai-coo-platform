import { GoogleIntegrationPermissionError } from "@/lib/google/errors";

export const GOOGLE_DOC_MIME = "application/vnd.google-apps.document";
export const GOOGLE_SHEET_MIME = "application/vnd.google-apps.spreadsheet";

export type GoogleDriveContentFile = {
  id: string;
  name: string;
  modifiedTime?: string;
  /** Descripción editable en Google Drive (puede estar vacía). */
  description?: string;
};

export async function listGoogleDriveFilesByMime(
  accessToken: string,
  mimeType: string
): Promise<GoogleDriveContentFile[]> {
  const url = new URL("https://www.googleapis.com/drive/v3/files");
  url.searchParams.set("q", `mimeType='${mimeType}' and trashed=false`);
  url.searchParams.set("fields", "files(id,name,modifiedTime,description)");
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
