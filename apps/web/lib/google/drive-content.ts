import { GoogleIntegrationPermissionError } from "@/lib/google/errors";

export const GOOGLE_DOC_MIME = "application/vnd.google-apps.document";
export const GOOGLE_SHEET_MIME = "application/vnd.google-apps.spreadsheet";

export type GoogleDriveContentFile = {
  id: string;
  name: string;
  modifiedTime?: string;
};

export async function listGoogleDriveFilesByMime(
  accessToken: string,
  mimeType: string
): Promise<GoogleDriveContentFile[]> {
  const url = new URL("https://www.googleapis.com/drive/v3/files");
  url.searchParams.set("q", `mimeType='${mimeType}' and trashed=false`);
  url.searchParams.set("fields", "files(id,name,modifiedTime)");
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
