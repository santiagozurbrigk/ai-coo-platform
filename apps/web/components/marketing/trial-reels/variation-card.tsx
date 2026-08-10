"use client";

import { useState } from "react";
import { updateReelVariationAction } from "@/app/marketing/content/reel-variation-actions";
import { Badge, Button, Textarea, cn } from "@ai-coo/ui";
import { useToast } from "@/providers/toast-provider";
import {
  Check,
  ChevronDown,
  ChevronUp,
  Instagram,
  Loader2,
  X,
} from "lucide-react";
import type { ReelVariation, ReelVariationType } from "@/types/reel-variations";

// ─── Labels ───────────────────────────────────────────────────────────────────

const VARIATION_LABELS: Record<ReelVariationType, string> = {
  speed_up:   "Velocidad +25%",
  speed_down: "Velocidad -15%",
  music:      "Música de fondo",
  subtitles:  "Subtítulos",
  color:      "Corrección de color",
};

const VARIATION_DESCRIPTIONS: Record<ReelVariationType, string> = {
  speed_up:   "Video acelerado un 25% para mayor dinamismo y engagement",
  speed_down: "Video a -15% de velocidad, más contemplativo",
  music:      "Audio original reemplazado con música de fondo",
  subtitles:  "Subtítulos quemados para espectadores sin sonido",
  color:      "LUT de color cálido aplicado para diferente estética",
};

// ─── Props ────────────────────────────────────────────────────────────────────

type Props = {
  jobId: string;
  index: number;
  variation: ReelVariation;
  onUpdate: (index: number, patch: Partial<ReelVariation>) => void;
};

// ─── Componente ───────────────────────────────────────────────────────────────

export function VariationCard({ jobId, index, variation, onUpdate }: Props) {
  const { push } = useToast();
  const [saving, setSaving] = useState(false);
  const [localDescription, setLocalDescription] = useState(variation.description);
  const [localHashtags, setLocalHashtags] = useState(
    (variation.hashtags ?? []).join(" ")
  );
  const [videoExpanded, setVideoExpanded] = useState(false);

  const isDirty =
    localDescription !== variation.description ||
    localHashtags !== (variation.hashtags ?? []).join(" ");

  const handleSave = async () => {
    setSaving(true);
    try {
      const hashtags = localHashtags
        .split(/\s+/)
        .map((h) => (h.startsWith("#") ? h : `#${h}`))
        .filter(Boolean);

      await updateReelVariationAction(jobId, index, {
        description: localDescription,
        hashtags,
      });

      onUpdate(index, { description: localDescription, hashtags });
      push({ title: "Variante actualizada", variant: "success" });
    } catch (err) {
      push({
        title: "No se pudo guardar",
        description: err instanceof Error ? err.message : "Error desconocido",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleIncluded = async () => {
    const next = !variation.included;
    try {
      await updateReelVariationAction(jobId, index, { included: next });
      onUpdate(index, { included: next });
    } catch {
      // Revert local optimistic update
      onUpdate(index, { included: variation.included });
    }
  };

  const isReady = variation.status === "ready";
  const isPublished = variation.status === "published";
  const isFailed = variation.status === "failed";
  const isProcessing = variation.status === "processing";

  return (
    <div
      className={cn(
        "rounded-lg border bg-card transition-all",
        !variation.included && "opacity-60",
        isPublished && "border-green-500/40 bg-green-500/5"
      )}
    >
      {/* Cabecera */}
      <div className="flex items-center gap-3 p-4">
        {/* Número */}
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
          V{index + 1}
        </span>

        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">
            {VARIATION_LABELS[variation.type]}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {VARIATION_DESCRIPTIONS[variation.type]}
          </p>
        </div>

        {/* Estado */}
        {isProcessing && (
          <Badge variant="secondary" className="gap-1">
            <Loader2 className="h-3 w-3 animate-spin" />
            Procesando
          </Badge>
        )}
        {isReady && !isPublished && (
          <Badge variant="secondary" className="text-muted-foreground">Lista</Badge>
        )}
        {isPublished && (
          <Badge className="gap-1 bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30">
            <Instagram className="h-3 w-3" />
            Publicada
          </Badge>
        )}
        {isFailed && (
          <Badge variant="destructive">Error</Badge>
        )}

        {/* Toggle incluir/excluir */}
        {(isReady || isPublished) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggleIncluded}
            className={cn(
              "h-7 w-7 p-0",
              variation.included
                ? "text-primary"
                : "text-muted-foreground"
            )}
            title={variation.included ? "Excluir de la publicación" : "Incluir en la publicación"}
          >
            {variation.included ? (
              <Check className="h-4 w-4" />
            ) : (
              <X className="h-4 w-4" />
            )}
          </Button>
        )}

        {/* Expandir/colapsar video */}
        {isReady && variation.preview_url && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setVideoExpanded((prev) => !prev)}
            className="h-7 w-7 p-0 text-muted-foreground"
          >
            {videoExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>

      {/* Error message */}
      {isFailed && variation.error && (
        <p className="px-4 pb-3 text-xs text-destructive">
          {variation.error}
        </p>
      )}

      {/* Preview de video */}
      {isReady && videoExpanded && variation.preview_url && (
        <div className="px-4 pb-4">
          <video
            src={variation.preview_url}
            controls
            playsInline
            className="w-full max-h-[400px] rounded-md bg-black object-contain"
          >
            Tu navegador no soporta el tag de video.
          </video>
        </div>
      )}

      {/* Editor de descripción y hashtags */}
      {isReady && variation.included && (
        <div className="border-t px-4 pb-4 pt-3 space-y-2">
          <div>
            <label className="text-xs font-medium text-muted-foreground">
              Descripción / Caption
            </label>
            <Textarea
              value={localDescription}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setLocalDescription(e.target.value)}
              rows={3}
              placeholder="Caption para esta variante…"
              className="mt-1 resize-none text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">
              Hashtags (separados por espacio)
            </label>
            <Textarea
              value={localHashtags}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setLocalHashtags(e.target.value)}
              rows={2}
              placeholder="#emprendimiento #negocio #marketing"
              className="mt-1 resize-none text-sm font-mono"
            />
          </div>

          {isDirty && (
            <Button
              size="sm"
              onClick={handleSave}
              disabled={saving}
              className="gap-1"
            >
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
              {saving ? "Guardando…" : "Guardar cambios"}
            </Button>
          )}
        </div>
      )}

      {/* Publicado en */}
      {isPublished && variation.published_at && (
        <div className="border-t px-4 py-2">
          <p className="text-xs text-muted-foreground" suppressHydrationWarning>
            Publicado el{" "}
            <span suppressHydrationWarning>
              {new Date(variation.published_at).toLocaleDateString("es-AR", {
                day: "numeric",
                month: "long",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
            {variation.zernio_post_id && (
              <span className="ml-2 text-muted-foreground/70">
                · ID: {variation.zernio_post_id}
              </span>
            )}
          </p>
        </div>
      )}
    </div>
  );
}
