"use server";

import { getCurrentProfile } from "@/lib/auth/bootstrap";
import { GoogleIntegrationPermissionError } from "@/lib/google/errors";
import { getGoogleAccessTokenForOrganization } from "@/lib/google/get-access-token";
import { updateContentPieceAction } from "./actions";

const GOOGLE_DOC_MIME = "application/vnd.google-apps.document";
const GOOGLE_SHEET_MIME = "application/vnd.google-apps.spreadsheet";
const GOOGLE_SLIDE_MIME = "application/vnd.google-apps.presentation";

const GOOGLE_EXPORT_MIME: Record<string, string> = {
  [GOOGLE_DOC_MIME]: "application/pdf",
  [GOOGLE_SHEET_MIME]:
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  [GOOGLE_SLIDE_MIME]: "application/pdf",
};

const MAX_DOWNLOAD_BYTES = 500 * 1024 * 1024;

export type DriveFileListItem = {
  id: string;
  name: string;
  mimeType: string;
  thumbnailLink?: string;
  webViewLink?: string;
  size?: string;
  modifiedTime: string;
  parents?: string[];
};

async function requireGoogleAccessToken(): Promise<string> {
  const profile = await getCurrentProfile();
  if (!profile?.organization_id) {
    throw new Error("Sesión no válida");
  }

  const token = await getGoogleAccessTokenForOrganization(profile.organization_id);
  if (!token) {
    throw new Error("GOOGLE_NOT_CONNECTED");
  }

  return token;
}

function handleDriveApiError(res: Response): never {
  if (res.status === 401 || res.status === 403) {
    throw new Error("GOOGLE_INSUFFICIENT_PERMISSIONS");
  }
  throw new Error(`Error de Google Drive (${res.status})`);
}

function escapeDriveQueryValue(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}

export async function listDriveFilesAction(params?: {
  folderId?: string;
  mimeTypeFilter?: string;
  query?: string;
}): Promise<DriveFileListItem[]> {
  const token = await requireGoogleAccessToken();

  let q = "trashed = false";

  if (params?.folderId) {
    q += ` and '${escapeDriveQueryValue(params.folderId)}' in parents`;
  } else {
    q += " and 'root' in parents";
  }

  if (params?.mimeTypeFilter) {
    q += ` and mimeType = '${escapeDriveQueryValue(params.mimeTypeFilter)}'`;
  }

  if (params?.query?.trim()) {
    q += ` and name contains '${escapeDriveQueryValue(params.query.trim())}'`;
  }

  const url = new URL("https://www.googleapis.com/drive/v3/files");
  url.searchParams.set("q", q);
  url.searchParams.set(
    "fields",
    "files(id,name,mimeType,thumbnailLink,webViewLink,size,modifiedTime,parents)"
  );
  url.searchParams.set("orderBy", "folder,name");
  url.searchParams.set("pageSize", "100");
  url.searchParams.set("includeItemsFromAllDrives", "true");
  url.searchParams.set("supportsAllDrives", "true");

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    try {
      const err = (await res.json()) as { error?: { message?: string } };
      if (res.status === 401 || res.status === 403) {
        throw new Error("GOOGLE_INSUFFICIENT_PERMISSIONS");
      }
      throw new Error(err.error?.message ?? "Error al listar archivos de Drive");
    } catch (error) {
      if (error instanceof Error && error.message.startsWith("GOOGLE_")) {
        throw error;
      }
      handleDriveApiError(res);
    }
  }

  const data = (await res.json()) as { files?: DriveFileListItem[] };
  return data.files ?? [];
}

export async function getDriveFileAction(
  fileId: string
): Promise<DriveFileListItem> {
  const token = await requireGoogleAccessToken();

  const url = new URL(
    `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}`
  );
  url.searchParams.set(
    "fields",
    "id,name,mimeType,thumbnailLink,webViewLink,size,modifiedTime"
  );
  url.searchParams.set("supportsAllDrives", "true");

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    handleDriveApiError(res);
  }

  return res.json() as Promise<DriveFileListItem>;
}

export async function getDriveFolderPathAction(
  folderId: string
): Promise<Array<{ id: string; name: string }>> {
  const token = await requireGoogleAccessToken();

  const path: Array<{ id: string; name: string }> = [];
  let currentId = folderId;

  for (let i = 0; i < 10; i++) {
    if (currentId === "root") break;

    const url = new URL(
      `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(currentId)}`
    );
    url.searchParams.set("fields", "id,name,parents");
    url.searchParams.set("supportsAllDrives", "true");

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) break;

    const file = (await res.json()) as {
      id: string;
      name: string;
      parents?: string[];
    };

    path.unshift({ id: file.id, name: file.name });

    if (!file.parents?.length) break;
    currentId = file.parents[0];
  }

  return path;
}

export async function linkDriveFileToContentAction(
  contentPieceId: string,
  driveFile: { id: string; name: string; url: string }
): Promise<void> {
  await updateContentPieceAction(contentPieceId, {
    drive_file_id: driveFile.id,
    drive_file_name: driveFile.name,
    drive_file_url: driveFile.url,
  });
}

export async function unlinkDriveFileAction(contentPieceId: string): Promise<void> {
  await updateContentPieceAction(contentPieceId, {
    drive_file_id: null,
    drive_file_name: null,
    drive_file_url: null,
  });
}

export async function downloadDriveFileAction(
  fileId: string
): Promise<{ buffer: Buffer; mimeType: string; name: string }> {
  const token = await requireGoogleAccessToken();

  const metaUrl = new URL(
    `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}`
  );
  metaUrl.searchParams.set("fields", "id,name,mimeType,size");
  metaUrl.searchParams.set("supportsAllDrives", "true");

  const metaRes = await fetch(metaUrl.toString(), {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!metaRes.ok) {
    handleDriveApiError(metaRes);
  }

  const meta = (await metaRes.json()) as {
    id: string;
    name: string;
    mimeType: string;
    size?: string;
  };

  const fileSize = meta.size ? Number.parseInt(meta.size, 10) : 0;
  if (fileSize > MAX_DOWNLOAD_BYTES) {
    throw new Error("El archivo supera el límite de 500 MB");
  }

  const exportMime = GOOGLE_EXPORT_MIME[meta.mimeType];
  let downloadUrl: URL;
  let resultMimeType = meta.mimeType;

  if (exportMime) {
    downloadUrl = new URL(
      `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}/export`
    );
    downloadUrl.searchParams.set("mimeType", exportMime);
    resultMimeType = exportMime;
  } else {
    downloadUrl = new URL(
      `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}`
    );
    downloadUrl.searchParams.set("alt", "media");
  }

  downloadUrl.searchParams.set("supportsAllDrives", "true");

  const res = await fetch(downloadUrl.toString(), {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (res.status === 401 || res.status === 403) {
    throw new GoogleIntegrationPermissionError(res.status);
  }

  if (!res.ok) {
    throw new Error("Error al descargar archivo de Drive");
  }

  const arrayBuffer = await res.arrayBuffer();
  return {
    buffer: Buffer.from(arrayBuffer),
    mimeType: resultMimeType,
    name: meta.name,
  };
}

export async function createDriveFolderAction(_params: {
  name: string;
  parentFolderId?: string;
}): Promise<{ id: string; name: string; mimeType: string }> {
  throw new Error(
    "La creación de carpetas no está disponible temporalmente. Seleccioná una carpeta existente de tu Drive."
  );
}

export async function searchDriveFilesAction(
  query: string
): Promise<DriveFileListItem[]> {
  const token = await requireGoogleAccessToken();
  const trimmedQuery = query.trim();

  if (!trimmedQuery) {
    return [];
  }

  const q = `name contains '${escapeDriveQueryValue(trimmedQuery)}' and trashed = false`;
  const url = new URL("https://www.googleapis.com/drive/v3/files");
  url.searchParams.set("q", q);
  url.searchParams.set(
    "fields",
    "files(id,name,mimeType,thumbnailLink,webViewLink,size,modifiedTime,parents)"
  );
  url.searchParams.set("pageSize", "30");
  url.searchParams.set("orderBy", "modifiedByMeTime desc");
  url.searchParams.set("includeItemsFromAllDrives", "true");
  url.searchParams.set("supportsAllDrives", "true");

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    if (res.status === 401 || res.status === 403) {
      throw new Error("GOOGLE_INSUFFICIENT_PERMISSIONS");
    }
    throw new Error("Error al buscar en Drive");
  }

  const data = (await res.json()) as { files?: DriveFileListItem[] };
  return data.files ?? [];
}
