"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createTrialReelsJobAction } from "@/app/marketing/content/reel-variation-actions";
import { Button } from "@ai-coo/ui";
import { useToast } from "@/providers/toast-provider";
import { Loader2, Zap } from "lucide-react";

type Props = {
  contentPieceId: string;
  hasDriveFile: boolean;
  onJobCreated?: (jobId: string) => void;
};

/**
 * Botón "Crear Trial Reels" que aparece en el panel de detalle de una pieza de contenido.
 * Solo habilitado cuando la pieza tiene un archivo de Drive vinculado.
 */
export function TrialReelsButton({ contentPieceId, hasDriveFile, onJobCreated }: Props) {
  const [loading, setLoading] = useState(false);
  const { push } = useToast();
  const router = useRouter();

  const handleClick = async () => {
    if (!hasDriveFile) {
      push({
        title: "Video de Drive requerido",
        description: "Vinculá el video original desde Google Drive antes de generar variaciones.",
      });
      return;
    }

    setLoading(true);
    try {
      const result = await createTrialReelsJobAction(contentPieceId);

      if (!result.ok) {
        push({
          title: "No se pudo crear el job",
          description: result.message,
        });
        return;
      }

      push({
        title: "Trial Reels en proceso",
        description: "Estamos generando las 5 variaciones. Te avisamos cuando estén listas.",
        variant: "success",
      });

      onJobCreated?.(result.jobId);
      router.refresh();
    } catch (err) {
      push({
        title: "Error inesperado",
        description: err instanceof Error ? err.message : "Error desconocido",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleClick}
      disabled={loading || !hasDriveFile}
      title={!hasDriveFile ? "Vinculá el video desde Drive primero" : undefined}
      className="gap-1.5"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Zap className="h-4 w-4" />
      )}
      {loading ? "Procesando…" : "Crear Trial Reels"}
    </Button>
  );
}
