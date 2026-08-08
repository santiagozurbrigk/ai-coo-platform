"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Archive, ExternalLink, RefreshCw, Trash2 } from "lucide-react";
import { Badge, Button, GlassPanel, Text } from "@ai-coo/ui";
import { Panel } from "@/components/shared/panel";
import { paths } from "@/routes";
import {
  archiveAiBrainDocumentAction,
  deleteAiBrainDocumentAction,
  getAiBrainSignedUrlAction,
  processAiBrainDocumentAction,
} from "@/app/super-admin/actions";
import type { BrainDocument } from "@/types/ai-brain";
import { BrainStatusBadge } from "./brain-status-badge";
import { BrainTypeIcon } from "./brain-type-icon";

export function BrainDocumentViewer({
  document: doc,
  fileUrl,
  fileName,
  sourceUrl,
  imagePreviewUrl,
  contentText,
}: {
  document: BrainDocument;
  fileUrl?: string | null;
  fileName?: string | null;
  sourceUrl?: string | null;
  imagePreviewUrl?: string | null;
  contentText?: string | null;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [indexMsg, setIndexMsg] = useState<string | null>(null);

  const isImage = doc.type === "image";
  const isMiro = doc.type === "miro";
  const miroLink = sourceUrl ?? doc.previewText;
  const canProcess = doc.type !== "image" && (!!fileUrl || isMiro);

  function runArchive() {
    startTransition(async () => {
      const res = await archiveAiBrainDocumentAction(doc.id);
      if (!res.success) setError(res.error);
      else router.refresh();
    });
  }

  function runDelete() {
    if (!confirm("¿Eliminar este documento permanentemente?")) return;
    startTransition(async () => {
      const res = await deleteAiBrainDocumentAction(doc.id);
      if (!res.success) setError(res.error);
      else router.push(paths.superAdmin.aiBrain.library);
    });
  }

  async function downloadFile() {
    if (!fileUrl) return;
    const res = await getAiBrainSignedUrlAction(fileUrl);
    if (res.success) window.open(res.data.url, "_blank");
    else setError(res.error);
  }

  function runProcess() {
    setError(null);
    setIndexMsg(null);
    startTransition(async () => {
      const res = await processAiBrainDocumentAction(doc.id);
      if (!res.success) {
        setError(res.error);
      } else {
        setIndexMsg(
          `Indexado correctamente — ${res.data.charCount.toLocaleString("es-AR")} caracteres extraídos.`
        );
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">{doc.title}</h1>
          <div className="flex flex-wrap items-center gap-2">
            <BrainTypeIcon type={doc.type} showLabel />
            <BrainStatusBadge status={doc.status} />
            <Text muted className="text-sm">
              {doc.uploadDate} · {doc.uploadedBy}
            </Text>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            size="sm"
            disabled={pending}
            onClick={runArchive}
          >
            <Archive className="mr-1.5 h-4 w-4" />
            Archivar
          </Button>
          <Button
            variant="destructive"
            size="sm"
            disabled={pending}
            onClick={runDelete}
          >
            <Trash2 className="mr-1.5 h-4 w-4" />
            Eliminar
          </Button>
        </div>
      </div>

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
      {indexMsg && (
        <p className="text-sm text-emerald-500" role="status">
          {indexMsg}
        </p>
      )}

      <GlassPanel className="min-h-[220px] p-6" glow>
        {isImage && imagePreviewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imagePreviewUrl}
            alt={doc.title}
            className="max-h-96 rounded-lg border border-border/50 object-contain"
          />
        ) : isMiro && miroLink ? (
          <Button asChild variant="secondary">
            <a href={miroLink} target="_blank" rel="noopener noreferrer">
              Abrir en Miro
              <ExternalLink className="ml-2 h-4 w-4" />
            </a>
          </Button>
        ) : fileName ? (
          <div className="space-y-3">
            <p className="text-sm">
              <strong>{fileName}</strong> · {doc.size}
            </p>
            {fileUrl && (
              <Button type="button" size="sm" onClick={downloadFile}>
                Descargar
              </Button>
            )}
          </div>
        ) : (
          <Text muted>Sin archivo adjunto</Text>
        )}
      </GlassPanel>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Metadata">
          {doc.description && (
            <p className="text-sm text-muted-foreground mb-3">{doc.description}</p>
          )}
          {doc.tags && doc.tags.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {doc.tags.map((t) => (
                <Badge key={t} variant="secondary">
                  {t}
                </Badge>
              ))}
            </div>
          )}
          <ul className="flex flex-wrap gap-2">
            {doc.coverageAreas.map((area) => (
              <Badge key={area} variant="outline">
                {area}
              </Badge>
            ))}
          </ul>
        </Panel>

        <Panel title="Indexación">
          <div className="space-y-3">
            {contentText ? (
              <>
                <p className="text-xs text-muted-foreground line-clamp-4 font-mono leading-relaxed">
                  {contentText.slice(0, 400)}
                  {contentText.length > 400 ? "…" : ""}
                </p>
                <p className="text-xs text-muted-foreground">
                  {contentText.length.toLocaleString("es-AR")} caracteres indexados · disponible en el agente de IA
                </p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                El contenido aún no fue procesado. Hacé clic en <strong>Procesar</strong> para extraer el texto e incorporarlo al cerebro global.
              </p>
            )}
            {canProcess && (
              <Button
                type="button"
                size="sm"
                variant={contentText ? "secondary" : "default"}
                disabled={pending}
                onClick={runProcess}
              >
                <RefreshCw className="mr-1.5 h-4 w-4" />
                {pending ? "Procesando…" : contentText ? "Re-procesar" : "Procesar e indexar"}
              </Button>
            )}
          </div>
        </Panel>
      </div>

      <Button asChild variant="outline" size="sm">
        <Link href={paths.superAdmin.aiBrain.library}>← Biblioteca</Link>
      </Button>
    </div>
  );
}
