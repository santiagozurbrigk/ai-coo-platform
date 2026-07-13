"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Input,
  cn,
} from "@ai-coo/ui";
import { CheckCircle2, FileSpreadsheet, FileText, Plus, Search, Upload } from "lucide-react";
import type { ContextDocument, DocumentCategory, FathomKnowledgeCall } from "@/types/business-context";
import {
  createDocumentFromFileAction,
  createTextNoteAction,
  getGoogleDocsListAction,
  getGoogleSheetsListAction,
  importGoogleDocAction,
  importGoogleSheetAction,
  previewGoogleDriveFileAction,
  prepareDocumentFileUploadAction,
  type GoogleDriveListItem,
} from "@/app/business-context/actions";
import {
  BUSINESS_CONTEXT_ACCEPT,
  BUSINESS_CONTEXT_FORMATS_LABEL,
  isAllowedDocumentFile,
} from "@/lib/business-context/file-types";
import { DOCUMENT_CATEGORIES, DOCUMENT_CATEGORY_LABELS } from "@/lib/business-context/constants";
import { useBusinessContextDocumentsRealtime } from "@/lib/business-context/use-documents-realtime";
import { useToast } from "@/providers/toast-provider";
import { EmptyState } from "@/components/shared/empty-state";
import { paths } from "@/routes";
import Link from "next/link";
import { DocumentGrid } from "./document-grid";

type AddStep = "pick" | "pdf" | "note" | "google-docs" | "google-sheets";

export function KnowledgeBasePage({
  documents: initial,
  contextCalls = [],
  clientMeetingCalls = [],
  googleConnected = false,
}: {
  documents: ContextDocument[];
  contextCalls?: FathomKnowledgeCall[];
  clientMeetingCalls?: FathomKnowledgeCall[];
  googleConnected?: boolean;
}) {
  const [documents, setDocuments] = useState(initial);
  const [addOpen, setAddOpen] = useState(false);
  const [step, setStep] = useState<AddStep>("pick");

  useEffect(() => {
    setDocuments(initial);
  }, [initial]);

  useBusinessContextDocumentsRealtime(setDocuments);

  const closeAdd = () => {
    setAddOpen(false);
    setStep("pick");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 rounded-xl border border-border/50 bg-muted/20 px-4 py-3">
        <p className="text-sm text-muted-foreground">
          Subí PDFs, notas o importá desde Google Docs y Sheets — se indexan automáticamente para la IA.
        </p>
        <Button size="sm" className="gap-1.5 shrink-0" onClick={() => setAddOpen(true)}>
          <Plus className="h-4 w-4" />
          Agregar documento
        </Button>
      </div>

      <DocumentGrid
        documents={documents}
        contextCalls={contextCalls}
        clientMeetingCalls={clientMeetingCalls}
      />

      <Dialog open={addOpen} onOpenChange={(o) => !o && closeAdd()}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {step === "pick"
                ? "¿Qué querés agregar?"
                : step === "pdf"
                  ? "Subir PDF"
                  : step === "note"
                    ? "Escribir nota"
                    : step === "google-docs"
                      ? "Importar de Google Docs"
                      : "Importar de Google Sheets"}
            </DialogTitle>
            <DialogDescription className="sr-only">
              {step === "pick"
                ? "Elegí el tipo de documento a agregar a la base de conocimiento."
                : step === "pdf"
                  ? "Subí un archivo PDF para indexarlo en la base de conocimiento."
                  : step === "note"
                    ? "Escribí una nota de texto directamente."
                    : step === "google-docs"
                      ? "Seleccioná un Google Doc de tu cuenta para importarlo."
                      : "Seleccioná una Google Sheet de tu cuenta para importarla."}
            </DialogDescription>
          </DialogHeader>

          {step === "pick" && (
            <div className="grid grid-cols-2 gap-3 py-2">
              <button
                type="button"
                onClick={() => setStep("pdf")}
                className="flex flex-col items-center gap-2 rounded-xl border border-border p-4 hover:bg-muted/40 transition-colors"
              >
                <Upload className="h-6 w-6 text-primary" />
                <span className="text-sm font-medium">Subir PDF</span>
                <span className="text-[11px] text-muted-foreground text-center">
                  {BUSINESS_CONTEXT_FORMATS_LABEL}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setStep("note")}
                className="flex flex-col items-center gap-2 rounded-xl border border-border p-4 hover:bg-muted/40 transition-colors"
              >
                <FileText className="h-6 w-6 text-primary" />
                <span className="text-sm font-medium">Escribir nota</span>
                <span className="text-[11px] text-muted-foreground text-center">
                  Texto directo, sin archivo
                </span>
              </button>
              <button
                type="button"
                onClick={() => setStep("google-docs")}
                className="flex flex-col items-center gap-2 rounded-xl border border-border p-4 hover:bg-muted/40 transition-colors"
              >
                <FileText className="h-6 w-6 text-[#4285F4]" />
                <span className="text-sm font-medium">Google Docs</span>
                <span className="text-[11px] text-muted-foreground text-center">
                  Importar un Doc de tu cuenta
                </span>
              </button>
              <button
                type="button"
                onClick={() => setStep("google-sheets")}
                className="flex flex-col items-center gap-2 rounded-xl border border-border p-4 hover:bg-muted/40 transition-colors"
              >
                <FileSpreadsheet className="h-6 w-6 text-[#0F9D58]" />
                <span className="text-sm font-medium">Google Sheets</span>
                <span className="text-[11px] text-muted-foreground text-center">
                  Importar una Sheet como CSV
                </span>
              </button>
            </div>
          )}

          {step === "pdf" && (
            <UploadPdfFlow onBack={() => setStep("pick")} onDone={closeAdd} />
          )}

          {step === "note" && (
            <WriteNoteFlow onBack={() => setStep("pick")} onDone={closeAdd} />
          )}

          {step === "google-docs" && (
            <GoogleImportFlow
              kind="doc"
              googleConnected={googleConnected}
              onBack={() => setStep("pick")}
              onDone={closeAdd}
            />
          )}

          {step === "google-sheets" && (
            <GoogleImportFlow
              kind="sheet"
              googleConnected={googleConnected}
              onBack={() => setStep("pick")}
              onDone={closeAdd}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CategorySelect({
  value,
  onChange,
}: {
  value: DocumentCategory;
  onChange: (v: DocumentCategory) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as DocumentCategory)}
      className="h-9 w-full rounded-lg border border-border/60 bg-muted/20 px-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
    >
      {DOCUMENT_CATEGORIES.map((cat) => (
        <option key={cat} value={cat}>
          {DOCUMENT_CATEGORY_LABELS[cat]}
        </option>
      ))}
    </select>
  );
}

function WriteNoteFlow({
  onBack,
  onDone,
}: {
  onBack: () => void;
  onDone: () => void;
}) {
  const router = useRouter();
  const { push } = useToast();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<DocumentCategory>("operations");
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await createTextNoteAction({ title, category, content });
      if (!res.success) {
        setError(res.error);
        return;
      }
      push({
        title: "Nota guardada",
        description: "Se está indexando en la base de conocimiento de la IA.",
        variant: "success",
      });
      router.refresh();
      onDone();
    });
  }

  return (
    <form className="space-y-4 py-2" onSubmit={onSubmit}>
      <button type="button" className="text-sm text-primary" onClick={onBack}>
        ← Volver
      </button>

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      <div className="space-y-2">
        <label htmlFor="note-title" className="text-sm font-medium">
          Título
        </label>
        <input
          id="note-title"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ej. Framework de onboarding Q3"
          className="h-9 w-full rounded-lg border border-border/60 bg-muted/20 px-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Categoría</label>
        <CategorySelect value={category} onChange={setCategory} />
      </div>

      <div className="space-y-2">
        <label htmlFor="note-content" className="text-sm font-medium">
          Contenido
        </label>
        <textarea
          id="note-content"
          required
          rows={8}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Escribí el contenido que querés que la IA conozca…"
          className="w-full rounded-lg border border-border/60 bg-muted/20 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Guardando e indexando…" : "Guardar e indexar"}
      </Button>
    </form>
  );
}

function UploadPdfFlow({
  onBack,
  onDone,
}: {
  onBack: () => void;
  onDone: () => void;
}) {
  const router = useRouter();
  const { push } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<DocumentCategory>("operations");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onFileSelected(f: File | null) {
    if (!f) {
      setFile(null);
      return;
    }
    const check = isAllowedDocumentFile(f.name, f.type, f.size);
    if (!check.ok) {
      setError(check.error);
      setFile(null);
      return;
    }
    setError(null);
    setFile(f);
    if (!title.trim()) {
      const base = f.name.replace(/\.[^.]+$/, "");
      setTitle(base);
    }
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      setError("Seleccioná un archivo.");
      return;
    }
    setError(null);

    startTransition(async () => {
      const prep = await prepareDocumentFileUploadAction({
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

      const res = await createDocumentFromFileAction({
        title,
        category,
        storagePath: prep.data.storagePath,
        fileName: file.name,
        mimeType: prep.data.contentType,
      });

      if (!res.success) {
        setError(res.error);
        return;
      }

      push({
        title: "Documento subido",
        description: "Se está extrayendo el texto e indexando para la IA.",
        variant: "success",
      });
      router.refresh();
      onDone();
    });
  }

  return (
    <form className="space-y-4 py-2" onSubmit={onSubmit}>
      <button type="button" className="text-sm text-primary" onClick={onBack}>
        ← Volver
      </button>

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      <div
        className={cn(
          "flex min-h-[140px] flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition-colors cursor-pointer",
          dragOver ? "border-primary bg-primary/5" : "border-border/60 bg-muted/10",
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
          onFileSelected(e.dataTransfer.files[0] ?? null);
        }}
        onClick={() => fileRef.current?.click()}
        role="button"
        tabIndex={0}
      >
        <input
          ref={fileRef}
          type="file"
          className="hidden"
          accept={BUSINESS_CONTEXT_ACCEPT}
          onChange={(e) => onFileSelected(e.target.files?.[0] ?? null)}
        />
        {file ? (
          <>
            <CheckCircle2 className="mb-2 h-8 w-8 text-emerald-500" />
            <p className="font-medium text-sm">{file.name}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {(file.size / 1024).toFixed(1)} KB
            </p>
          </>
        ) : (
          <>
            <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
            <p className="font-medium text-sm">Arrastrá o elegí un archivo</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {BUSINESS_CONTEXT_FORMATS_LABEL}
            </p>
          </>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="pdf-title" className="text-sm font-medium">
          Título
        </label>
        <input
          id="pdf-title"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="h-9 w-full rounded-lg border border-border/60 bg-muted/20 px-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Categoría</label>
        <CategorySelect value={category} onChange={setCategory} />
      </div>

      <Button type="submit" className="w-full" disabled={pending || !file}>
        {pending ? "Subiendo e indexando…" : "Subir e indexar"}
      </Button>
    </form>
  );
}

function GoogleImportFlow({
  kind,
  googleConnected,
  onBack,
  onDone,
}: {
  kind: "doc" | "sheet";
  googleConnected: boolean;
  onBack: () => void;
  onDone: () => void;
}) {
  const router = useRouter();
  const { push } = useToast();
  const [files, setFiles] = useState<GoogleDriveListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [contentPreview, setContentPreview] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [category, setCategory] = useState<DocumentCategory>("operations");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const label = kind === "doc" ? "Google Docs" : "Google Sheets";

  const filteredFiles = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return files;
    return files.filter((file) => {
      const name = file.name.toLowerCase();
      const description = file.description?.toLowerCase() ?? "";
      return name.includes(q) || description.includes(q);
    });
  }, [files, searchQuery]);

  const selectedFile = useMemo(
    () => files.find((file) => file.id === selectedId) ?? null,
    [files, selectedId]
  );

  useEffect(() => {
    if (!googleConnected) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    const load = kind === "doc" ? getGoogleDocsListAction : getGoogleSheetsListAction;

    void load()
      .then((items) => {
        if (!cancelled) setFiles(items);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : `No se pudo listar ${label}`);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [googleConnected, kind, label]);

  useEffect(() => {
    if (!selectedId) {
      setContentPreview(null);
      setPreviewLoading(false);
      return;
    }

    let cancelled = false;
    setPreviewLoading(true);
    setContentPreview(null);

    void previewGoogleDriveFileAction({ googleFileId: selectedId, kind })
      .then(({ preview }) => {
        if (!cancelled) setContentPreview(preview);
      })
      .catch(() => {
        if (!cancelled) setContentPreview(null);
      })
      .finally(() => {
        if (!cancelled) setPreviewLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedId, kind]);

  function onImport() {
    if (!selectedId) {
      setError(`Seleccioná un archivo de ${label}.`);
      return;
    }
    setError(null);

    startTransition(async () => {
      const action =
        kind === "doc" ? importGoogleDocAction : importGoogleSheetAction;
      const res = await action({ googleFileId: selectedId, category });
      if (!res.success) {
        setError(res.error);
        return;
      }
      push({
        title: "Importado",
        description: `Se está indexando el ${kind === "doc" ? "Doc" : "Sheet"} en la base de conocimiento.`,
        variant: "success",
      });
      router.refresh();
      onDone();
    });
  }

  if (!googleConnected) {
    return (
      <div className="space-y-4 py-2">
        <button type="button" className="text-sm text-primary" onClick={onBack}>
          ← Volver
        </button>
        <EmptyState
          variant="inline"
          title={`Conectá Google para importar ${label}`}
          description="Tu cuenta de Google (Forms/YouTube) ya incluye acceso de lectura a Drive. Conectala desde Integraciones."
          action={
            <Button asChild size="sm">
              <Link href={paths.platform.integrations}>Ir a Integraciones</Link>
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-4 py-2">
      <button type="button" className="text-sm text-primary" onClick={onBack}>
        ← Volver
      </button>

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      {loading ? (
        <p className="text-sm text-muted-foreground">Cargando archivos de {label}…</p>
      ) : files.length === 0 ? (
        <EmptyState
          variant="inline"
          title={`No hay ${label} en tu cuenta`}
          description={`No encontramos archivos de ${label} en el Drive conectado.`}
        />
      ) : (
        <>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={`Buscar por nombre${kind === "doc" ? " o descripción" : ""}…`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {filteredFiles.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border/60 py-8 text-center text-sm text-muted-foreground">
              Ningún archivo coincide con &quot;{searchQuery.trim()}&quot;.
            </p>
          ) : (
            <ul className="max-h-64 space-y-1 overflow-y-auto rounded-lg border border-border/60 p-1">
              {filteredFiles.map((file) => (
                <li key={file.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(file.id)}
                    className={cn(
                      "flex w-full gap-3 rounded-md px-2 py-2 text-left text-sm transition-colors",
                      selectedId === file.id
                        ? "bg-primary/10 text-foreground"
                        : "hover:bg-muted/40 text-muted-foreground"
                    )}
                  >
                    <GoogleDriveFileThumb fileId={file.id} kind={kind} hasThumbnail={Boolean(file.thumbnailLink)} />
                    <span className="min-w-0 flex-1">
                      <span className="font-medium text-foreground">{file.name}</span>
                      {file.description?.trim() ? (
                        <span className="mt-1 line-clamp-2 block text-[11px] text-muted-foreground">
                          {file.description.trim()}
                        </span>
                      ) : null}
                      {file.modifiedTime ? (
                        <span className="mt-0.5 block text-[11px] text-muted-foreground/80">
                          Modificado{" "}
                          {new Date(file.modifiedTime).toLocaleDateString("es", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      ) : null}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {selectedFile ? (
            <div className="rounded-lg border border-border/60 bg-muted/10 p-3 space-y-2">
              <div className="flex gap-3">
                <GoogleDriveFileThumb fileId={selectedFile.id} kind={kind} large hasThumbnail={Boolean(selectedFile.thumbnailLink)} />
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="text-xs font-medium text-foreground">Vista previa</p>
                  <p className="text-[11px] font-medium text-foreground truncate">
                    {selectedFile.name}
                  </p>
                  {previewLoading ? (
                    <p className="text-[11px] text-muted-foreground">Cargando contenido…</p>
                  ) : contentPreview ? (
                    <p className="text-[11px] leading-relaxed text-muted-foreground line-clamp-4">
                      {contentPreview}
                    </p>
                  ) : selectedFile.description?.trim() ? (
                    <p className="text-[11px] leading-relaxed text-muted-foreground line-clamp-3">
                      {selectedFile.description.trim()}
                    </p>
                  ) : (
                    <p className="text-[11px] text-muted-foreground">
                      Sin texto exportable visible.
                    </p>
                  )}
                </div>
              </div>
            </div>
          ) : null}
        </>
      )}

      <div className="space-y-2">
        <label className="text-sm font-medium">Categoría</label>
        <CategorySelect value={category} onChange={setCategory} />
      </div>

      <Button
        type="button"
        className="w-full"
        disabled={pending || !selectedId || loading}
        onClick={onImport}
      >
        {pending ? "Importando e indexando…" : "Importar e indexar"}
      </Button>
    </div>
  );
}

function GoogleDriveFileThumb({
  fileId,
  kind,
  large = false,
  hasThumbnail = true,
}: {
  fileId: string;
  kind: "doc" | "sheet";
  large?: boolean;
  hasThumbnail?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const Icon = kind === "doc" ? FileText : FileSpreadsheet;
  const iconColor = kind === "doc" ? "text-[#4285F4]" : "text-[#0F9D58]";
  const sizeClass = large ? "h-[90px] w-[120px]" : "h-[68px] w-[90px]";
  const iconSize = large ? "h-8 w-8" : "h-6 w-6";

  // Don't fire the request if Drive didn't return a thumbnailLink for this file
  // (e.g. new/empty Sheets). Render the icon fallback directly to avoid 404s.
  if (!hasThumbnail || failed) {
    return (
      <div
        className={cn(
          "flex shrink-0 items-center justify-center rounded-md border border-border/40 bg-muted/30",
          sizeClass
        )}
        aria-hidden
      >
        <Icon className={cn(iconSize, iconColor)} />
      </div>
    );
  }

  return (
    <img
      src={`/api/integrations/google/thumbnail?fileId=${encodeURIComponent(fileId)}`}
      alt=""
      width={large ? 120 : 90}
      height={large ? 90 : 68}
      className={cn(
        "shrink-0 rounded-md border border-border/40 object-cover bg-muted/20",
        sizeClass
      )}
      onError={() => setFailed(true)}
    />
  );
}
