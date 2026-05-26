"use client";

import { useState } from "react";
import Link from "next/link";
import { Upload, Layout, CheckCircle2 } from "lucide-react";
import { Button, GlassPanel, cn } from "@ai-coo/ui";
import { paths } from "@/routes";
import type { BrainCategory, BrainContentType } from "@/types/ai-brain";

const CONTENT_TYPES: { key: BrainContentType; label: string }[] = [
  { key: "document", label: "Documento" },
  { key: "image", label: "Imagen" },
  { key: "transcript", label: "Transcripción" },
  { key: "miro", label: "Miro Board" },
  { key: "playbook", label: "Playbook" },
  { key: "framework", label: "Framework" },
];

const CATEGORIES: { key: BrainCategory; label: string }[] = [
  { key: "sales_methodology", label: "Metodología de ventas" },
  { key: "operational_systems", label: "Sistemas operativos" },
  { key: "sop_frameworks", label: "Frameworks de SOP" },
  { key: "team_management", label: "Gestión de equipo" },
  { key: "onboarding", label: "Onboarding" },
  { key: "content_strategy", label: "Estrategia de contenido" },
  { key: "financial", label: "Financiero" },
  { key: "general", label: "General" },
];

export function BrainAddForm() {
  const [contentType, setContentType] = useState<BrainContentType>("document");
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadDone, setUploadDone] = useState(false);
  const [miroUrl, setMiroUrl] = useState("");
  const [miroConnected, setMiroConnected] = useState(false);

  const simulateUpload = () => {
    setUploading(true);
    setUploadDone(false);
    setTimeout(() => {
      setUploading(false);
      setUploadDone(true);
    }, 1800);
  };

  const showDropzone = contentType !== "miro";

  return (
    <form
      className="mx-auto max-w-2xl space-y-8"
      onSubmit={(e) => {
        e.preventDefault();
      }}
    >
      <GlassPanel className="p-4">
        <p className="text-sm text-muted-foreground">
          El contenido se aplica a <strong className="text-foreground">todas las organizaciones</strong>{" "}
          como capa global de conocimiento (Fase 0: sin subida real).
        </p>
      </GlassPanel>

      <div className="space-y-3">
        <label className="text-sm font-medium">Tipo de contenido</label>
        <div className="flex flex-wrap gap-2">
          {CONTENT_TYPES.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => {
                setContentType(key);
                setUploadDone(false);
              }}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                contentType === key
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {showDropzone && (
        <div
          className={cn(
            "flex min-h-[200px] flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition-colors",
            dragOver
              ? "border-primary bg-primary/5"
              : "border-border/60 bg-muted/10",
            uploading && "pointer-events-none opacity-70"
          )}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            simulateUpload();
          }}
        >
          {uploadDone ? (
            <>
              <CheckCircle2 className="mb-3 h-10 w-10 text-emerald-500" />
              <p className="font-medium">Archivo listo (mock)</p>
              <p className="mt-1 text-sm text-muted-foreground">
                methodology-draft.pdf · 2.1 MB
              </p>
            </>
          ) : uploading ? (
            <>
              <div className="mb-3 h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <p className="font-medium">Subiendo… 67%</p>
              <div className="mt-3 h-1.5 w-48 overflow-hidden rounded-full bg-muted">
                <div className="h-full w-2/3 rounded-full bg-primary animate-pulse" />
              </div>
            </>
          ) : (
            <>
              <Upload className="mb-3 h-10 w-10 text-muted-foreground" />
              <p className="font-medium">Arrastra archivos aquí</p>
              <p className="mt-2 text-sm text-muted-foreground">
                .txt, .md, .docx, .pdf · .png, .jpg
              </p>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="mt-4"
                onClick={simulateUpload}
              >
                Simular subida
              </Button>
            </>
          )}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <label htmlFor="brain-title" className="text-sm font-medium">
            Título <span className="text-destructive">*</span>
          </label>
          <input
            id="brain-title"
            required
            placeholder="Ej. High Ticket Sales Methodology v3"
            className="h-9 w-full rounded-lg border border-border/60 bg-muted/20 px-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="brain-category" className="text-sm font-medium">
            Categoría
          </label>
          <select
            id="brain-category"
            className="h-9 w-full rounded-lg border border-border/60 bg-muted/20 px-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
          >
            {CATEGORIES.map(({ key, label }) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label htmlFor="brain-tags" className="text-sm font-medium">
            Etiquetas (opcional)
          </label>
          <input
            id="brain-tags"
            placeholder="ventas, setter, framework"
            className="h-9 w-full rounded-lg border border-border/60 bg-muted/20 px-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <label htmlFor="brain-desc" className="text-sm font-medium">
            Descripción (opcional)
          </label>
          <textarea
            id="brain-desc"
            rows={3}
            placeholder="Qué aporta este contenido al cerebro global…"
            className="w-full rounded-lg border border-border/60 bg-muted/20 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
      </div>

      <GlassPanel className="space-y-4 p-5">
        <div className="flex items-center gap-2">
          <Layout className="h-5 w-5 text-primary" />
          <h3 className="font-medium">Conexión Miro Board</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Pega la URL o ID del board (integración mock en Fase 0).
        </p>
        <input
          value={miroUrl}
          onChange={(e) => setMiroUrl(e.target.value)}
          placeholder="https://miro.com/app/board/…"
          className="h-9 w-full rounded-lg border border-border/60 bg-muted/20 px-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
        />
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={!miroUrl.trim()}
          onClick={() => setMiroConnected(true)}
        >
          {miroConnected ? "Board conectado ✓" : "Conectar board"}
        </Button>
      </GlassPanel>

      <div className="flex flex-wrap gap-3">
        <Button type="submit" size="lg">
          Añadir al cerebro
        </Button>
        <Button type="button" variant="ghost" asChild>
          <Link href={paths.superAdmin.aiBrain.library}>Cancelar</Link>
        </Button>
      </div>
    </form>
  );
}
