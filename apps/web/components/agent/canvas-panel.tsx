"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { X, History, Copy, Check, BookOpen, Loader2 } from "lucide-react";
import { cn } from "@ai-coo/ui";
import { saveCanvasToKnowledgeBaseAction } from "@/app/agent/actions";

interface CanvasVersion {
  id: string;
  content: string;
  timestamp: string;
}

interface CanvasPanelProps {
  versions: CanvasVersion[];
  onClose: () => void;
}

const proseClass =
  "prose prose-sm dark:prose-invert max-w-none prose-headings:text-foreground prose-headings:font-semibold prose-p:text-foreground/90 prose-p:my-2 prose-li:text-foreground/90 prose-strong:text-foreground prose-pre:my-2 prose-code:text-foreground prose-a:text-violet-600 dark:prose-a:text-violet-400";

export function CanvasPanel({ versions, onClose }: CanvasPanelProps) {
  const [activeIdx, setActiveIdx] = useState(versions.length - 1);
  const [showHistory, setShowHistory] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">(
    "idle"
  );

  const active = versions[activeIdx];

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

  return (
    <div className="flex h-full flex-col border-l border-border bg-background">
      {/* Header */}
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
            onClick={() => void handleSaveToKnowledge()}
            disabled={saveState === "saving" || saveState === "saved"}
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

      {/* Version history sidebar */}
      {showHistory && (
        <div className="shrink-0 border-b border-border bg-muted/40 px-3 py-2">
          <p className="mb-1.5 text-xs font-medium text-muted-foreground">
            Versiones
          </p>
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

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {active ? (
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
