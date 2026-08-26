"use client";

import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { X, History, Copy, Check, BookOpen, Loader2, Download } from "lucide-react";
import { cn } from "@ai-coo/ui";
import {
  exportCanvasAsDocxAction,
  saveCanvasToKnowledgeBaseAction,
} from "@/app/agent/canvas-actions";

interface CanvasVersion {
  id: string;
  content: string;
  timestamp: string;
}

interface CanvasPanelProps {
  versions: CanvasVersion[];
  isLoading?: boolean;
  onClose: () => void;
}

const proseClass =
  "prose prose-sm dark:prose-invert max-w-none prose-headings:text-foreground prose-headings:font-semibold prose-p:text-foreground/90 prose-p:my-2 prose-li:text-foreground/90 prose-strong:text-foreground prose-pre:my-2 prose-code:text-foreground prose-a:text-violet-600 dark:prose-a:text-violet-400";

function downloadBlob(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function extractFilename(content: string): string {
  const heading = content.match(/^#{1,2} (.+)$/m);
  const base = heading?.[1]?.trim() || "documento";
  return base.replace(/[^\w\s-áéíóúñÁÉÍÓÚÑ]/g, "").trim() || "documento";
}

export function CanvasPanel({ versions, isLoading = false, onClose }: CanvasPanelProps) {
  const [activeIdx, setActiveIdx] = useState(Math.max(versions.length - 1, 0));
  const [showHistory, setShowHistory] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">(
    "idle"
  );
  const [downloadState, setDownloadState] = useState<"idle" | "downloading">("idle");

  useEffect(() => {
    setActiveIdx(Math.max(versions.length - 1, 0));
  }, [versions.length]);

  const active = versions[activeIdx] ?? versions[versions.length - 1];

  const handleSaveToKnowledge = async () => {
    if (!active || saveState === "saving") return;
    setSaveState("saving");
    const result = await saveCanvasToKnowledgeBaseAction({ content: active.content });
    setSaveState(result.ok ? "saved" : "error");
    if (result.ok) setTimeout(() => setSaveState("idle"), 3000);
  };

  const handleCopy = async () => {
    if (!active) return;
    await navigator.clipboard.writeText(active.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = async () => {
    if (!active || downloadState === "downloading") return;
    setDownloadState("downloading");

    try {
      const docxResult = await exportCanvasAsDocxAction(active.content);
      if (docxResult.ok && docxResult.base64 && docxResult.filename) {
        const bytes = Uint8Array.from(atob(docxResult.base64), (c) => c.charCodeAt(0));
        downloadBlob(
          docxResult.filename,
          new Blob([bytes], {
            type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          })
        );
        return;
      }

      const filename = `${extractFilename(active.content)}.md`;
      downloadBlob(
        filename,
        new Blob([active.content], { type: "text/markdown;charset=utf-8" })
      );
    } finally {
      setDownloadState("idle");
    }
  };

  return (
    <div className="flex h-full flex-col border-l border-border bg-background">
      <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">Canvas</span>
          {versions.length > 1 && (
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
              v{activeIdx + 1}/{versions.length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {versions.length > 1 && (
            <button
              type="button"
              onClick={() => setShowHistory((v) => !v)}
              className={cn(
                "rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                showHistory && "bg-muted text-foreground"
              )}
              title="Historial de versiones"
            >
              <History className="h-4 w-4" />
            </button>
          )}
          <button
            type="button"
            onClick={handleCopy}
            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            title="Copiar contenido"
          >
            {copied ? (
              <Check className="h-4 w-4 text-emerald-400" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </button>
          <button
            type="button"
            onClick={() => void handleDownload()}
            disabled={!active || downloadState === "downloading" || isLoading}
            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
            title="Descargar documento"
          >
            {downloadState === "downloading" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
          </button>
          <button
            type="button"
            onClick={() => void handleSaveToKnowledge()}
            disabled={!active || saveState === "saving" || saveState === "saved" || isLoading}
            className={cn(
              "rounded-lg p-1.5 transition-colors",
              saveState === "saved"
                ? "text-emerald-400"
                : saveState === "error"
                  ? "text-red-400 hover:bg-muted"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
            title={
              saveState === "saving"
                ? "Guardando..."
                : saveState === "saved"
                  ? "Guardado en Base de Conocimiento"
                  : saveState === "error"
                    ? "Error al guardar — intentá de nuevo"
                    : "Guardar en Base de Conocimiento"
            }
          >
            {saveState === "saving" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : saveState === "saved" ? (
              <Check className="h-4 w-4 text-emerald-400" />
            ) : (
              <BookOpen className="h-4 w-4" />
            )}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            title="Cerrar canvas"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {showHistory && (
        <div className="shrink-0 border-b border-border bg-muted/40 px-3 py-2">
          <p className="mb-1.5 text-xs font-medium text-muted-foreground">Versiones</p>
          <div className="flex flex-col gap-1">
            {versions.map((v, i) => (
              <button
                key={v.id}
                type="button"
                onClick={() => {
                  setActiveIdx(i);
                  setShowHistory(false);
                }}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs transition-colors hover:bg-muted",
                  i === activeIdx
                    ? "bg-muted text-foreground font-medium"
                    : "text-muted-foreground"
                )}
              >
                <span className="shrink-0 rounded bg-muted-foreground/20 px-1 text-[10px]">
                  v{i + 1}
                </span>
                <span>{new Date(v.timestamp).toLocaleTimeString()}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-6 py-4">
        {isLoading && !active ? (
          <div className="flex h-full items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Generando documento…
          </div>
        ) : active ? (
          <div className={proseClass}>
            <ReactMarkdown>{active.content}</ReactMarkdown>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Sin contenido</p>
        )}
      </div>
    </div>
  );
}
