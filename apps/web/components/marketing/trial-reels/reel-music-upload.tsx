"use client";

import { useRef, useState } from "react";
import { Button } from "@ai-coo/ui";
import { useToast } from "@/providers/toast-provider";
import { Loader2, Music, Trash2, Upload } from "lucide-react";
import {
  uploadReelMusicAction,
  deleteReelMusicAction,
} from "@/app/marketing/content/reel-music-actions";

// ─── Props ────────────────────────────────────────────────────────────────────

type Props = {
  /** Ruta actual en Storage, o null si no hay música configurada */
  currentPath: string | null;
};

// ─── Componente ───────────────────────────────────────────────────────────────

export function ReelMusicUpload({ currentPath }: Props) {
  const { push } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [hasMusic, setHasMusic] = useState(Boolean(currentPath));
  const [fileName, setFileName] = useState<string | null>(
    currentPath ? currentPath.split("/").pop() ?? "background.mp3" : null
  );

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("music", file);

      const result = await uploadReelMusicAction(formData);
      if (result.ok) {
        setHasMusic(true);
        setFileName(file.name);
        push({ title: "Música subida", description: "Se usará en la variante con música de fondo.", variant: "success" });
      } else {
        push({ title: "No se pudo subir", description: result.message });
      }
    } catch (err) {
      push({ title: "Error al subir", description: err instanceof Error ? err.message : "Error desconocido" });
    } finally {
      setUploading(false);
      // Limpiar el input para permitir re-subir el mismo archivo
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const result = await deleteReelMusicAction();
      if (result.ok) {
        setHasMusic(false);
        setFileName(null);
        push({ title: "Música eliminada", variant: "success" });
      } else {
        push({ title: "No se pudo eliminar", description: result.message });
      }
    } catch (err) {
      push({ title: "Error al eliminar", description: err instanceof Error ? err.message : "Error desconocido" });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="rounded-lg border bg-card p-4 space-y-3">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-muted">
          <Music className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">Música de fondo personalizada</p>
          <p className="text-xs text-muted-foreground">
            Track de audio para la variante &ldquo;Música de fondo&rdquo; en Trial Reels (MP3, M4A, WAV · máx. 30 MB)
          </p>
        </div>
      </div>

      {hasMusic && fileName ? (
        <div className="flex items-center gap-2 rounded-md bg-muted/60 px-3 py-2">
          <Music className="h-3.5 w-3.5 shrink-0 text-primary" />
          <span className="flex-1 text-xs font-mono text-muted-foreground truncate">{fileName}</span>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleDelete}
            disabled={deleting || uploading}
            className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
            title="Eliminar música"
          >
            {deleting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Trash2 className="h-3.5 w-3.5" />
            )}
          </Button>
        </div>
      ) : null}

      <div>
        <input
          ref={fileRef}
          type="file"
          accept="audio/mpeg,audio/mp4,audio/wav,audio/x-wav,.mp3,.m4a,.wav"
          className="hidden"
          onChange={handleUpload}
          disabled={uploading}
        />
        <Button
          size="sm"
          variant="outline"
          onClick={() => fileRef.current?.click()}
          disabled={uploading || deleting}
          className="gap-1.5"
        >
          {uploading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Upload className="h-3.5 w-3.5" />
          )}
          {uploading ? "Subiendo…" : hasMusic ? "Reemplazar música" : "Subir música"}
        </Button>
      </div>
    </div>
  );
}
