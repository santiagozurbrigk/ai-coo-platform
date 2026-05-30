import { GoogleIntegrationPermissionError } from "@/lib/google/errors";

export type GoogleFormDriveFile = {
  id: string;
  name: string;
  createdTime?: string;
  modifiedTime?: string;
};

/**
 * Lista formularios del usuario vía Drive API (Forms API no tiene listado).
 * @see https://developers.google.com/drive/api/guides/search-files
 */
export async function listGoogleFormFiles(
  accessToken: string
): Promise<GoogleFormDriveFile[]> {
  const url = new URL("https://www.googleapis.com/drive/v3/files");
  url.searchParams.set("q", "mimeType='application/vnd.google-apps.form'");
  url.searchParams.set("fields", "files(id,name,createdTime,modifiedTime)");
  url.searchParams.set("pageSize", "100");
  url.searchParams.set("orderBy", "modifiedTime desc");

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (res.status === 403 || res.status === 401) {
    const body = await res.text();
    console.error("[drive-forms] Permisos insuficientes:", res.status, body);
    throw new GoogleIntegrationPermissionError(res.status);
  }

  if (!res.ok) {
    const body = await res.text();
    console.error("[drive-forms] Drive API error:", res.status, body);
    return [];
  }

  const data = (await res.json()) as { files?: GoogleFormDriveFile[] };
  return data.files ?? [];
}
