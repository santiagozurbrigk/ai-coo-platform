"use client";

import { useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Upload, Layout, CheckCircle2 } from "lucide-react";
import { Button, GlassPanel, cn } from "@ai-coo/ui";
import { paths } from "@/routes";
import {
  createAiBrainDocumentAction,
  prepareAiBrainFileUploadAction,
} from "@/app/super-admin/actions";
import {
  AI_BRAIN_ACCEPT,
  AI_BRAIN_FORMATS_LABEL,
  isAllowedBrainFile,
} from "@/lib/ai-brain/file-types";
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
  { key: "financial", label: "Planificación financiera" },
  { key: "general", label: "General" },
];

const COVERAGE_OPTIONS = [
  "sales_methodology",
  "operational_systems",
  "sop_frameworks",
  "team_management",
  "onboarding",
  "content_strategy",
  "financial_planning",
];

export function BrainAddForm() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [contentType, setContentType] = useState<BrainContentType>("document");
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<BrainCategory>("general");
  const [tags, setTags] = useState("");
  const [description, setDescription] = useState("");
  const [coverage, setCoverage] = useState<string[]>([]);
  const [miroUrl, setMiroUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const showDropzone = contentType !== "miro";

  function onFileSelected(f: File | null) {
    if (!f) {
      setFile(null);
      return;
    }
    const check = isAllowedBrainFile(f.name, f.type, f.size);
    if (!check.ok) {
      setError(check.error);
      setFile(null);
      return;
    }
    setError(null);
    setFile(f);
  }

  function toggleCoverage(id: string) {
    setCoverage((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      let storagePath: string | undefined;
      let fileMimeType: string | undefined;

      if (file && file.size > 0) {
        const prep = await prepareAiBrainFileUploadAction({
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
        });
        if (!prep.success) {
          setError(prep.error);
          return;
        }

        const uploadRes = await fetch(prep.data.signedUrl, {
          method: "PUT",
          headers: { "Content-Type": prep.data.contentType },
          body: file,
        });

        if (!uploadRes.ok) {
          setError(
            `Error al subir el archivo (${uploadRes.status}). Revisá el bucket en Supabase Storage.`
          );
          return;
        }

        storagePath = prep.data.storagePath;
        fileMimeType = prep.data.contentType;
      }

      const res = await createAiBrainDocumentAction({
        title,
        contentType,
        category,
        description,
        tags,
        coverageAreas: coverage.join(","),
        miroUrl: miroUrl.trim() || undefined,
        storagePath,
        fileName: file?.name,
        fileSizeBytes: file?.size,
        fileMimeType,
      });

      if (!res.success) {
        setError(res.error);
        return;
      }
      router.push(paths.superAdmin.aiBrain.document(res.data.id));
    });
  }

  return (
    <form
      className="mx-auto max-w-2xl space-y-8"
      onSubmit={onSubmit}
    >
      <GlassPanel className="p-4">
        <p className="text-sm text-muted-foreground">
          El contenido se aplica a{" "}
          <strong className="text-foreground">todas las organizaciones</strong>{" "}
          como capa global. Estado inicial:{" "}
          <strong className="text-foreground">pending_indexing</strong>.
        </p>
      </GlassPanel>

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      <div className="space-y-3">
        <label className="text-sm font-medium">Tipo de contenido</label>
        <div className="flex flex-wrap gap-2">
          {CONTENT_TYPES.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => {
                setContentType(key);
                setFile(null);
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
            pending && "pointer-events-none opacity-70"
          )}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            const f = e.dataTransfer.files[0];
            if (f) onFileSelected(f);
          }}
          onClick={() => fileRef.current?.click()}
          role="button"
          tabIndex={0}
        >
          <input
            ref={fileRef}
            type="file"
            className="hidden"
            accept={AI_BRAIN_ACCEPT}
            onChange={(e) => onFileSelected(e.target.files?.[0] ?? null)}
          />
          {file ? (
            <>
              <CheckCircle2 className="mb-3 h-10 w-10 text-emerald-500" />
              <p className="font-medium">{file.name}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {(file.size / 1024).toFixed(1)} KB
              </p>
            </>
          ) : (
            <>
              <Upload className="mb-3 h-10 w-10 text-muted-foreground" />
              <p className="font-medium">Arrastra archivos aquí</p>
              <p className="mt-2 text-sm text-muted-foreground">
                {AI_BRAIN_FORMATS_LABEL}
              </p>
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
            value={title}
            onChange={(e) => setTitle(e.target.value)}
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
            value={category}
            onChange={(e) => setCategory(e.target.value as BrainCategory)}
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
            value={tags}
            onChange={(e) => setTags(e.target.value)}
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
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Qué aporta este contenido al cerebro global…"
            className="w-full rounded-lg border border-border/60 bg-muted/20 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <span className="text-sm font-medium">Áreas de cobertura</span>
          <div className="flex flex-wrap gap-2">
            {COVERAGE_OPTIONS.map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => toggleCoverage(id)}
                className={cn(
                  "rounded-md px-2 py-1 text-xs",
                  coverage.includes(id)
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {id.replace(/_/g, " ")}
              </button>
            ))}
          </div>
        </div>
      </div>

      <GlassPanel className="space-y-4 p-5">
        <div className="flex items-center gap-2">
          <Layout className="h-5 w-5 text-primary" />
          <h3 className="font-medium">Miro Board</h3>
        </div>
        <input
          value={miroUrl}
          onChange={(e) => setMiroUrl(e.target.value)}
          placeholder="https://miro.com/app/board/…"
          className="h-9 w-full rounded-lg border border-border/60 bg-muted/20 px-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
        />
      </GlassPanel>

      <div className="flex flex-wrap gap-3">
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? "Subiendo…" : "Agregar al Brain"}
        </Button>
        <Button type="button" variant="ghost" asChild>
          <Link href={paths.superAdmin.aiBrain.library}>Cancelar</Link>
        </Button>
      </div>
    </form>
  );
}
