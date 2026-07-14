"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Button, Input, cn } from "@ai-coo/ui";
import { DriveMimeIcon } from "@/components/marketing/marketing-icons";
import {
  listDriveFilesAction,
  type DriveFileListItem,
} from "@/app/marketing/content/drive-actions";
import { GOOGLE_OAUTH_START_URL } from "@/lib/google/oauth-paths";
import { paths } from "@/routes";

type Props = {
  onSelect: (file: { id: string; name: string; url: string }) => void;
  onClose?: () => void;
  mimeTypeFilter?: string;
  className?: string;
};

const FOLDER_MIME = "application/vnd.google-apps.folder";

function isFolder(mimeType: string): boolean {
  return mimeType === FOLDER_MIME;
}

function driveFileUrl(file: DriveFileListItem): string {
  return file.webViewLink ?? `https://drive.google.com/file/d/${file.id}/view`;
}

export function DriveFilePicker({
  onSelect,
  onClose,
  mimeTypeFilter,
  className,
}: Props) {
  const [files, setFiles] = useState<DriveFileListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [needsReconnect, setNeedsReconnect] = useState(false);
  const [needsConnect, setNeedsConnect] = useState(false);
  const [currentFolderId, setCurrentFolderId] = useState<string | undefined>();
  const [breadcrumb, setBreadcrumb] = useState<Array<{ id: string; name: string }>>(
    []
  );
  const [searchQuery, setSearchQuery] = useState("");

  const loadFiles = useCallback(
    async (folderId?: string, query?: string) => {
      setLoading(true);
      setError(null);
      setNeedsReconnect(false);
      setNeedsConnect(false);

      try {
        const result = await listDriveFilesAction({
          folderId,
          mimeTypeFilter,
          query: query || undefined,
        });
        setFiles(result);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Error desconocido";
        if (message === "GOOGLE_NOT_CONNECTED") {
          setNeedsConnect(true);
          setError("No hay conexión con Google Drive. Conectá tu cuenta de Google primero.");
        } else if (message === "GOOGLE_INSUFFICIENT_PERMISSIONS") {
          setNeedsReconnect(true);
          setError("Permisos insuficientes. Reconectá tu cuenta de Google con acceso a Drive.");
        } else {
          setError(message);
        }
        setFiles([]);
      } finally {
        setLoading(false);
      }
    },
    [mimeTypeFilter]
  );

  useEffect(() => {
    void loadFiles();
  }, [loadFiles]);

  const navigateToFolder = async (folderId: string, folderName: string) => {
    setCurrentFolderId(folderId);
    setBreadcrumb((prev) => [...prev, { id: folderId, name: folderName }]);
    await loadFiles(folderId);
  };

  const navigateToRoot = async () => {
    setBreadcrumb([]);
    setCurrentFolderId(undefined);
    await loadFiles(undefined);
  };

  const navigateBreadcrumb = async (index: number) => {
    const newBreadcrumb = breadcrumb.slice(0, index + 1);
    const target = newBreadcrumb[index];
    setBreadcrumb(newBreadcrumb);
    setCurrentFolderId(target?.id);
    await loadFiles(target?.id);
  };

  const handleSelect = (file: DriveFileListItem) => {
    onSelect({
      id: file.id,
      name: file.name,
      url: driveFileUrl(file),
    });
  };

  return (
    <div className={cn("flex flex-col gap-4 h-[500px]", className)}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1 text-sm text-muted-foreground flex-wrap min-w-0">
          <button
            type="button"
            onClick={() => void navigateToRoot()}
            className="hover:text-foreground transition-colors"
          >
            Mi Drive
          </button>
          {breadcrumb.map((crumb, i) => (
            <span key={crumb.id} className="flex items-center gap-1">
              <span>/</span>
              <button
                type="button"
                onClick={() => void navigateBreadcrumb(i)}
                className="hover:text-foreground transition-colors truncate max-w-[140px]"
              >
                {crumb.name}
              </button>
            </span>
          ))}
        </div>
        {onClose ? (
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Cerrar
          </Button>
        ) : null}
      </div>

      <div className="flex gap-2">
        <Input
          type="search"
          placeholder="Buscar en Drive..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              void loadFiles(currentFolderId, searchQuery);
            }
          }}
          className="flex-1"
        />
        <Button
          type="button"
          variant="secondary"
          onClick={() => void loadFiles(currentFolderId, searchQuery)}
        >
          Buscar
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto rounded-md border">
        {loading ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            Cargando...
          </div>
        ) : null}

        {!loading && error ? (
          <div className="space-y-3 p-4">
            <p className="text-sm text-destructive">{error}</p>
            {needsConnect ? (
              <Button asChild size="sm">
                <Link href={paths.platform.integrations}>Ir a Integraciones</Link>
              </Button>
            ) : null}
            {needsReconnect ? (
              <Button asChild size="sm">
                <a href={GOOGLE_OAUTH_START_URL.google_forms}>Reconectar Google con Drive</a>
              </Button>
            ) : null}
          </div>
        ) : null}

        {!loading && !error && files.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            Carpeta vacía
          </div>
        ) : null}

        {!loading && !error
          ? files.map((file) => (
              <div
                key={file.id}
                role="button"
                tabIndex={0}
                className="flex cursor-pointer items-center gap-3 border-b px-3 py-2 last:border-0 hover:bg-accent"
                onClick={() => {
                  if (isFolder(file.mimeType)) {
                    void navigateToFolder(file.id, file.name);
                  } else {
                    handleSelect(file);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key !== "Enter" && e.key !== " ") return;
                  e.preventDefault();
                  if (isFolder(file.mimeType)) {
                    void navigateToFolder(file.id, file.name);
                  } else {
                    handleSelect(file);
                  }
                }}
              >
                <DriveMimeIcon mimeType={file.mimeType} size={20} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(file.modifiedTime).toLocaleDateString("es-AR")}
                    {file.size
                      ? ` · ${(Number.parseInt(file.size, 10) / 1024 / 1024).toFixed(1)} MB`
                      : null}
                  </p>
                </div>
                {!isFolder(file.mimeType) ? (
                  <button
                    type="button"
                    className="flex-shrink-0 text-xs text-primary hover:underline"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelect(file);
                    }}
                  >
                    Seleccionar
                  </button>
                ) : null}
              </div>
            ))
          : null}
      </div>
    </div>
  );
}
