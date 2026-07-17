"use client";

import { useRef, useState, useTransition, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Upload, Layout, CheckCircle2, HardDrive, X } from "lucide-react";
import { Button, GlassPanel, cn } from "@ai-coo/ui";
import { paths } from "@/routes";
import {
  createAiBrainDocumentAction,
  prepareAiBrainFileUploadAction,
  importDriveFileForBrainAction,
} from "@/app/super-admin/actions";
import { listDriveFilesForSuperAdminSafeAction } from "@/app/super-admin/drive-actions";
import {
  AI_BRAIN_ACCEPT,
  AI_BRAIN_FORMATS_LABEL,
  isAllowedBrainFile,
} from "@/lib/ai-brain/file-types";
import type { BrainCategory, BrainContentType } from "@/types/ai-brain";
import { DriveFilePicker } from "@/components/marketing/drive-file-picker";
import { useToast } from "@/providers/toast-provider";

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

type FileSource = "local" | "drive";
type DriveSelection = { id: string; name: string; mimeType: string };

export function BrainAddForm() {
  const router = useRouter();
  const { push: pushToast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [contentType, setContentType] = useState<BrainContentType>("document");
  const [fileSource, setFileSource] = useState<FileSource>("local");
  const [dragOver, setDragOver] = useState(false);

  // Multi-file state
  const [localFiles, setLocalFiles] = useState<File[]>([]);
  const [driveFiles, setDriveFiles] = useState<DriveSelection[]>([]);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<BrainCategory>("general");
  const [tags, setTags] = useState("");
  const [description, setDescription] = useState("");
  const [coverage, setCoverage] = useState<string[]>([]);
  const [miroUrl, setMiroUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const showDropzone = contentType !== "miro";
  const activeFiles = fileSource === "local" ? localFiles : driveFiles;
  const multipleFiles = activeFiles.length > 1;

  function addLocalFiles(incoming: FileList | File[]) {
    const valid: File[] = [];
    const errors: string[] = [];
    for (const f of Array.from(incoming)) {
      const check = isAllowedBrainFile(f.name, f.type, f.size);
      if (!check.ok) errors.push(`${f.name}: ${check.error}`);
      else valid.push(f);
    }
    if (errors.length) setError(errors.join(" · "));
    else setError(null);
    setLocalFiles((prev) => {
      const existingNames = new Set(prev.map((f) => f.name));
      return [...prev, ...valid.filter((f) => !existingNames.has(f.name))];
    });
    if (valid.length === 1 && !title) {
      setTitle(valid[0].name.replace(/\.[^.]+$/, ""));
    }
  }

  function removeLocalFile(name: string) {
    setLocalFiles((prev) => prev.filter((f) => f.name !== name));
  }

  function removeDriveFile(id: string) {
    setDriveFiles((prev) => prev.filter((f) => f.id !== id));
  }

  function toggleCoverage(id: string) {
    setCoverage((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  async function uploadOneLocalFile(
    file: File,
    itemTitle: string
  ): Promise<{ ok: boolean; id?: string; error?: string }> {
    const prep = await prepareAiBrainFileUploadAction({
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
    });
    if (!prep.success) return { ok: false, error: prep.error };

    const uploadRes = await fetch(prep.data.signedUrl, {
      method: "PUT",
      headers: { "Content-Type": prep.data.contentType },
      body: file,
    });
    if (!uploadRes.ok) {
      return { ok: false, error: `Error al subir "${file.name}" (${uploadRes.status})` };
    }

    const res = await createAiBrainDocumentAction({
      title: itemTitle,
      contentType,
      category,
      description,
      tags,
      coverageAreas: coverage.join(","),
      storagePath: prep.data.storagePath,
      fileName: file.name,
      fileSizeBytes: file.size,
      fileMimeType: prep.data.contentType,
    });
    if (!res.success) return { ok: false, error: res.error };
    return { ok: true, id: res.data.id };
  }

  async function uploadOneDriveFile(
    driveFile: DriveSelection,
    itemTitle: string
  ): Promise<{ ok: boolean; id?: string; error?: string }> {
    const imported = await importDriveFileForBrainAction({
      fileId: driveFile.id,
      fileName: driveFile.name,
      mimeType: driveFile.mimeType,
    });
    if (!imported.success) return { ok: false, error: imported.error };

    const res = await createAiBrainDocumentAction({
      title: itemTitle,
      contentType,
      category,
      description,
      tags,
      coverageAreas: coverage.join(","),
      storagePath: imported.data.storagePath,
      fileName: imported.data.fileName,
      fileSizeBytes: imported.data.fileSizeBytes,
      fileMimeType: imported.data.mimeType,
    });
    if (!res.success) return { ok: false, error: res.error };
    return { ok: true, id: res.data.id };
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setProgress(null);

    startTransition(async () => {
      // ── Miro single URL ───────────────────────────────────────────────────
      if (!showDropzone) {
        const res = await createAiBrainDocumentAction({
          title,
          contentType,
          category,
          description,
          tags,
          coverageAreas: coverage.join(","),
          miroUrl: miroUrl.trim() || undefined,
        });
        if (!res.success) {
          setError(res.error);
          pushToast({ title: "Error", description: res.error });
          return;
        }
        router.push(paths.superAdmin.aiBrain.document(res.data.id));
        return;
      }

      // ── Multi-file upload ─────────────────────────────────────────────────
      const filesToProcess = fileSource === "local" ? localFiles : driveFiles;

      if (filesToProcess.length === 0) {
        setError("Seleccioná al menos un archivo.");
        return;
      }

      const errors: string[] = [];
      let lastId: string | undefined;

      for (let i = 0; i < filesToProcess.length; i++) {
        const item = filesToProcess[i];
        const itemTitle =
          filesToProcess.length === 1 && title
            ? title
            : item.name.replace(/\.[^.]+$/, "");

        setProgress(`Subiendo ${i + 1} de ${filesToProcess.length}: ${item.name}…`);

        let result: { ok: boolean; id?: string; error?: string };
        if (fileSource === "local") {
          result = await uploadOneLocalFile(item as File, itemTitle);
        } else {
          result = await uploadOneDriveFile(item as DriveSelection, itemTitle);
        }

        if (!result.ok) errors.push(result.error ?? item.name);
        else lastId = result.id;
      }

      setProgress(null);

      if (errors.length === filesToProcess.length) {
        const msg = `Error al subir archivos: ${errors[0]}`;
        setError(msg);
        pushToast({ title: "Error al subir", description: errors[0] });
        return;
      }
      if (errors.length) {
        const msg = `${errors.length} archivo(s) no se pudieron subir. El resto se procesó correctamente.`;
        setError(msg);
        pushToast({ title: "Subida parcial", description: msg });
        // still redirect — partial success
      }

      if (filesToProcess.length === 1 && lastId) {
        router.push(paths.superAdmin.aiBrain.document(lastId));
      } else {
        router.push(paths.superAdmin.aiBrain.library);
      }
    });
  }

  return (
    <form className="mx-auto max-w-2xl space-y-8" onSubmit={onSubmit}>
      <GlassPanel className="p-4">
        <p className="text-sm text-muted-foreground">
          El contenido se aplica a{" "}
          <strong className="text-foreground">todas las organizaciones</strong>{" "}
          como capa global. Estado inicial:{" "}
          <strong className="text-foreground">pending_indexing</strong>.
        </p>
      </GlassPanel>

      {error && (
        <p className="text-sm text-destructive" role="alert">{error}</p>
      )}
      {progress && (
        <p className="text-sm text-muted-foreground" role="status">{progress}</p>
      )}

      {/* Content type */}
      <div className="space-y-3">
        <label className="text-sm font-medium">Tipo de contenido</label>
        <div className="flex flex-wrap gap-2">
          {CONTENT_TYPES.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => {
                setContentType(key);
                setLocalFiles([]);
                setDriveFiles([]);
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
        <div className="space-y-3">
          {/* Source selector */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => { setFileSource("local"); setDriveFiles([]); }}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                fileSource === "local"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              )}
            >
              <Upload className="h-3.5 w-3.5" />
              Desde mi PC
            </button>
            <button
              type="button"
              onClick={() => { setFileSource("drive"); setLocalFiles([]); }}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                fileSource === "drive"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              )}
            >
              <HardDrive className="h-3.5 w-3.5" />
              Desde Google Drive
            </button>
          </div>

          {/* Local dropzone */}
          {fileSource === "local" && (
            <div className="space-y-2">
              <div
                className={cn(
                  "flex min-h-[140px] flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition-colors cursor-pointer",
                  dragOver ? "border-primary bg-primary/5" : "border-border/60 bg-muted/10",
                  pending && "pointer-events-none opacity-70"
                )}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  if (e.dataTransfer.files.length) addLocalFiles(e.dataTransfer.files);
                }}
                onClick={() => fileRef.current?.click()}
                role="button"
                tabIndex={0}
              >
                <input
                  ref={fileRef}
                  type="file"
                  multiple
                  className="hidden"
                  accept={AI_BRAIN_ACCEPT}
                  onChange={(e) => {
                    if (e.target.files?.length) addLocalFiles(e.target.files);
                    e.target.value = "";
                  }}
                />
                <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
                <p className="font-medium text-sm">Arrastrá archivos aquí o hacé clic</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {AI_BRAIN_FORMATS_LABEL} · Podés seleccionar varios a la vez
                </p>
              </div>

              {localFiles.length > 0 && (
                <ul className="space-y-1">
                  {localFiles.map((f) => (
                    <li
                      key={f.name}
                      className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm"
                    >
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                      <span className="flex-1 truncate font-medium">{f.name}</span>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {(f.size / 1024).toFixed(1)} KB
                      </span>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); removeLocalFile(f.name); }}
                        className="shrink-0 text-muted-foreground hover:text-foreground"
                        aria-label="Quitar archivo"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Drive multi-picker */}
          {fileSource === "drive" && (
            driveFiles.length > 0 ? (
              <div className="space-y-2">
                <ul className="space-y-1">
                  {driveFiles.map((f) => (
                    <li
                      key={f.id}
                      className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm"
                    >
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                      <span className="flex-1 truncate font-medium">{f.name}</span>
                      <button
                        type="button"
                        onClick={() => removeDriveFile(f.id)}
                        className="shrink-0 text-muted-foreground hover:text-foreground"
                        aria-label="Quitar archivo"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  className="text-xs text-muted-foreground underline-offset-2 hover:underline hover:text-foreground"
                  onClick={() => setDriveFiles([])}
                >
                  Cambiar selección
                </button>
              </div>
            ) : (
              <DriveFilePicker
                multiSelect
                listAction={listDriveFilesForSuperAdminSafeAction}
                connectUrl="/api/integrations/super-admin-google/oauth/start"
                reconnectUrl="/api/integrations/super-admin-google/oauth/start"
                onSelect={(f) => {
                  setDriveFiles([{ id: f.id, name: f.name, mimeType: f.mimeType }]);
                  if (!title) setTitle(f.name.replace(/\.[^.]+$/, ""));
                }}
                onSelectMultiple={(files) => {
                  setDriveFiles(files.map((f) => ({ id: f.id, name: f.name, mimeType: f.mimeType })));
                  if (!title && files.length === 1) {
                    setTitle(files[0].name.replace(/\.[^.]+$/, ""));
                  }
                }}
              />
            )
          )}
        </div>
      )}

      {/* Metadata */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <label htmlFor="brain-title" className="text-sm font-medium">
            {multipleFiles ? (
              <>
                Título{" "}
                <span className="text-xs font-normal text-muted-foreground">
                  (opcional en carga múltiple — se usa el nombre de cada archivo)
                </span>
              </>
            ) : (
              <>Título <span className="text-destructive">*</span></>
            )}
          </label>
          <input
            id="brain-title"
            required={!multipleFiles}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={
              multipleFiles
                ? "Dejar vacío para usar el nombre de cada archivo"
                : "Ej. High Ticket Sales Methodology v3"
            }
            className="h-9 w-full rounded-lg border border-border/60 bg-muted/20 px-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="brain-category" className="text-sm font-medium">Categoría</label>
          <select
            id="brain-category"
            value={category}
            onChange={(e) => setCategory(e.target.value as BrainCategory)}
            className="h-9 w-full rounded-lg border border-border/60 bg-muted/20 px-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
          >
            {CATEGORIES.map(({ key, label }) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label htmlFor="brain-tags" className="text-sm font-medium">Etiquetas (opcional)</label>
          <input
            id="brain-tags"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="ventas, setter, framework"
            className="h-9 w-full rounded-lg border border-border/60 bg-muted/20 px-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <label htmlFor="brain-desc" className="text-sm font-medium">Descripción (opcional)</label>
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
        <p className="text-xs text-muted-foreground">
          El contenido del tablero se extrae vía API de Miro (requiere{" "}
          <code className="text-xs">MIRO_ACCESS_TOKEN</code>).
        </p>
      </GlassPanel>

      <div className="flex flex-wrap gap-3">
        <Button type="submit" size="lg" disabled={pending}>
          {pending
            ? (progress ?? "Subiendo…")
            : activeFiles.length > 1
              ? `Agregar ${activeFiles.length} documentos al Brain`
              : "Agregar al Brain"}
        </Button>
        <Button type="button" variant="ghost" asChild>
          <Link href={paths.superAdmin.aiBrain.library}>Cancelar</Link>
        </Button>
      </div>
    </form>
  );
}
