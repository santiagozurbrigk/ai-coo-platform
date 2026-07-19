"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  FileSpreadsheet,
  Loader2,
  RotateCcw,
  Sparkles,
  Table,
  Trash2,
  Upload,
} from "lucide-react";
import { Badge, Button } from "@ai-coo/ui";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/providers/toast-provider";
import {
  analyzeImportFileAction,
  suggestColumnMappingAction,
  executeImportAction,
  undoImportAction,
  listImportBatchesAction,
} from "@/app/operations/import-actions";
import type {
  ColumnMapping,
  FileAnalysis,
  ImportBatch,
  ImportResult,
} from "@/types/import";
import { CLOSING_FIELDS } from "@/types/import";

type Step = "upload" | "sheets" | "mapping" | "result";
type UploadStatus = "idle" | "uploading" | "analyzing" | "done" | "error";

const MODULE_LABELS: Record<string, string> = {
  closing: "Closing / Ventas",
  finance: "Finanzas",
  content: "Contenido",
};

export function ImportWizard({ pastBatches }: { pastBatches: ImportBatch[] }) {
  const router = useRouter();
  const { push: toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();

  const [step, setStep] = useState<Step>("upload");
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>("idle");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [storagePath, setStoragePath] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<FileAnalysis | null>(null);
  const [selectedSheets, setSelectedSheets] = useState<string[]>([]);
  const [mapping, setMapping] = useState<ColumnMapping>({});
  const [result, setResult] = useState<ImportResult | null>(null);
  const [batches, setBatches] = useState<ImportBatch[]>(pastBatches);

  // ─── Step 1: Upload to storage, then analyze ──────────────────────────────

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      setUploadStatus("idle");
      setStoragePath(null);
    }
  }

  async function uploadAndAnalyze() {
    if (!file) return;

    const MAX_MB = 50;
    if (file.size > MAX_MB * 1024 * 1024) {
      toast({ title: "Archivo muy grande", description: `El máximo es ${MAX_MB} MB.` });
      return;
    }

    try {
      // 1. Upload to Supabase Storage from the browser (bypasses Vercel 4.5MB limit)
      setUploadStatus("uploading");
      setUploadProgress(0);

      const supabase = createClient();
      const path = `imports/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;

      const { error: uploadErr } = await supabase.storage
        .from("import-files")
        .upload(path, file, { upsert: false });

      if (uploadErr) {
        setUploadStatus("error");
        toast({ title: "Error al subir el archivo", description: uploadErr.message });
        return;
      }

      setUploadProgress(100);
      setStoragePath(path);
      setUploadStatus("analyzing");

      // 2. Server action reads from storage and analyzes
      startTransition(async () => {
        const res = await analyzeImportFileAction(path, file.name);
        if (!res.success) {
          setUploadStatus("error");
          toast({ title: "Error al analizar", description: res.error });
          return;
        }
        setUploadStatus("done");
        setAnalysis(res.data);
        setSelectedSheets(res.data.recommendedSheets);
        setStep("sheets");
      });
    } catch (err) {
      setUploadStatus("error");
      toast({ title: "Error inesperado", description: err instanceof Error ? err.message : "Intentá de nuevo." });
    }
  }

  // ─── Step 2: Sheet selection → get mapping ─────────────────────────────────

  function confirmSheets() {
    if (selectedSheets.length === 0) {
      toast({ title: "Seleccioná al menos una hoja" });
      return;
    }
    startTransition(async () => {
      if (!analysis) return;
      const firstSheet = analysis.sheets.find((s) => selectedSheets.includes(s.name));
      if (!firstSheet) return;
      const sampleRow = firstSheet.sampleRows[0] ?? {};
      const res = await suggestColumnMappingAction(
        firstSheet.headers,
        sampleRow,
        analysis.recommendedModule
      );
      if (res.success) setMapping(res.data);
      setStep("mapping");
    });
  }

  // ─── Step 3: Execute import ────────────────────────────────────────────────

  function executeImport() {
    if (!storagePath || !analysis || !file) return;
    startTransition(async () => {
      const res = await executeImportAction(
        storagePath,
        file.name,
        selectedSheets,
        mapping,
        analysis.recommendedModule
      );
      if (!res.success) {
        toast({ title: "Error al importar", description: res.error });
        return;
      }
      setResult(res.data);
      setStep("result");
      setBatches(await listImportBatchesAction());
    });
  }

  // ─── Undo ──────────────────────────────────────────────────────────────────

  function undoBatch(batchId: string) {
    if (!confirm("¿Deshacer esta importación? Se eliminarán todos los registros importados.")) return;
    startTransition(async () => {
      const res = await undoImportAction(batchId);
      if (res.success) {
        toast({ title: "Importación deshecha", variant: "success" });
        router.refresh();
        setBatches(await listImportBatchesAction());
      } else {
        toast({ title: "Error", description: res.error });
      }
    });
  }

  // ─── Reset ─────────────────────────────────────────────────────────────────

  function reset() {
    setStep("upload");
    setFile(null);
    setStoragePath(null);
    setAnalysis(null);
    setSelectedSheets([]);
    setMapping({});
    setResult(null);
    setUploadStatus("idle");
    setUploadProgress(0);
    if (fileRef.current) fileRef.current.value = "";
  }

  // ─── Render ────────────────────────────────────────────────────────────────

  const isAnalyzing = uploadStatus === "uploading" || uploadStatus === "analyzing" || pending;

  return (
    <div className="space-y-6">
      {/* Step indicator */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {(["upload", "sheets", "mapping", "result"] as Step[]).map((s, i) => {
          const labels: Record<Step, string> = {
            upload: "Subir archivo",
            sheets: "Seleccionar hojas",
            mapping: "Mapear columnas",
            result: "Resultado",
          };
          const active = step === s;
          const done =
            (s === "upload" && ["sheets", "mapping", "result"].includes(step)) ||
            (s === "sheets" && ["mapping", "result"].includes(step)) ||
            (s === "mapping" && step === "result");
          return (
            <span key={s} className="flex items-center gap-2">
              {i > 0 && <ChevronRight className="h-3.5 w-3.5 shrink-0" />}
              <span className={active ? "font-semibold text-foreground" : done ? "text-primary" : ""}>
                {done && <CheckCircle2 className="inline h-3.5 w-3.5 mr-1 text-primary" />}
                {labels[s]}
              </span>
            </span>
          );
        })}
      </div>

      {/* ── Step 1: Upload ─────────────────────────────────────────── */}
      {step === "upload" && (
        <div className="space-y-4">
          <div
            className={`flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-10 text-center transition-colors ${
              file
                ? "border-primary/40 bg-primary/5"
                : "border-border/60 bg-muted/20 hover:border-primary/30 cursor-pointer"
            }`}
            onClick={() => !file && fileRef.current?.click()}
          >
            <FileSpreadsheet className="h-10 w-10 text-muted-foreground" />
            <div>
              <p className="font-medium">
                {file ? file.name : "Arrastrá o hacé clic para subir"}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {file
                  ? `${(file.size / 1024 / 1024).toFixed(2)} MB · .${file.name.split(".").pop()?.toUpperCase()}`
                  : "Formatos: .xlsx, .xls, .xlsm, .csv — máx. 50 MB"}
              </p>
            </div>
            {file && (
              <button
                className="text-xs text-muted-foreground underline"
                onClick={(e) => {
                  e.stopPropagation();
                  setFile(null);
                  if (fileRef.current) fileRef.current.value = "";
                }}
              >
                Cambiar archivo
              </button>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept=".xlsx,.xls,.xlsm,.csv"
            className="hidden"
            onChange={handleFileChange}
          />

          {/* Upload progress */}
          {uploadStatus === "uploading" && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Subiendo archivo...</span>
                <span className="text-muted-foreground">{uploadProgress}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300 rounded-full"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {uploadStatus === "analyzing" && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Analizando hojas con IA...
            </div>
          )}

          <Button
            onClick={uploadAndAnalyze}
            disabled={!file || isAnalyzing}
            className="w-full sm:w-auto"
          >
            {isAnalyzing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-4 w-4" />
            )}
            {isAnalyzing ? "Procesando..." : "Analizar con IA"}
          </Button>
        </div>
      )}

      {/* ── Step 2: Sheet selection ────────────────────────────────── */}
      {step === "sheets" && analysis && (
        <div className="space-y-4">
          <div className="rounded-lg border border-border/60 bg-muted/10 p-4">
            <div className="flex items-start gap-2">
              <Sparkles className="h-4 w-4 mt-0.5 text-primary shrink-0" />
              <div>
                <p className="text-sm font-medium">Análisis de la IA</p>
                <p className="text-sm text-muted-foreground mt-0.5">{analysis.aiReasoning}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Módulo detectado:{" "}
                  <strong>{MODULE_LABELS[analysis.recommendedModule]}</strong>
                  {analysis.mergeStrategy === "concatenate" &&
                    " — las hojas seleccionadas se combinarán"}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">
              Hojas encontradas ({analysis.sheets.length}) — seleccioná las que contienen datos para importar
            </p>
            {analysis.sheets.map((sheet) => {
              const checked = selectedSheets.includes(sheet.name);
              return (
                <label
                  key={sheet.name}
                  className={`flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${
                    checked
                      ? "border-primary/50 bg-primary/5"
                      : "border-border/60 hover:border-border"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    className="mt-0.5"
                    onChange={(e) =>
                      setSelectedSheets((prev) =>
                        e.target.checked
                          ? [...prev, sheet.name]
                          : prev.filter((n) => n !== sheet.name)
                      )
                    }
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Table className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="font-medium text-sm">{sheet.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {sheet.detectedTypeLabel}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {sheet.totalRows} filas
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 truncate">
                      Columnas: {sheet.headers.slice(0, 6).join(", ")}
                      {sheet.headers.length > 6 ? ` +${sheet.headers.length - 6} más` : ""}
                    </p>
                    {sheet.sampleRows[0] && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Primera fila:{" "}
                        {Object.values(sheet.sampleRows[0])
                          .filter(Boolean)
                          .slice(0, 4)
                          .join(" · ")}
                      </p>
                    )}
                  </div>
                </label>
              );
            })}
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={reset} disabled={pending}>
              Volver
            </Button>
            <Button onClick={confirmSheets} disabled={selectedSheets.length === 0 || pending}>
              {pending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-4 w-4" />
              )}
              Sugerir mapeo de columnas
            </Button>
          </div>
        </div>
      )}

      {/* ── Step 3: Column mapping ────────────────────────────────── */}
      {step === "mapping" && analysis && (
        <div className="space-y-4">
          <div className="rounded-lg border border-border/60 bg-muted/10 p-4">
            <p className="text-sm font-medium">Mapeo de columnas</p>
            <p className="text-sm text-muted-foreground mt-0.5">
              La IA pre-mapeó las columnas. Revisá y corregí si hace falta. Los campos con{" "}
              <span className="text-destructive">*</span> son obligatorios.
            </p>
          </div>

          <ColumnMappingTable
            analysis={analysis}
            selectedSheets={selectedSheets}
            mapping={mapping}
            onChange={setMapping}
          />

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep("sheets")} disabled={pending}>
              Volver
            </Button>
            <Button onClick={executeImport} disabled={pending}>
              {pending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Upload className="mr-2 h-4 w-4" />
              )}
              Importar datos
            </Button>
          </div>
        </div>
      )}

      {/* ── Step 4: Result ───────────────────────────────────────── */}
      {step === "result" && result && (
        <div className="space-y-4">
          <div className="rounded-xl border border-green-200 bg-green-50 p-5 dark:border-green-900 dark:bg-green-950/30">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
              <p className="font-semibold text-green-800 dark:text-green-300">
                Importación completada
              </p>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                  {result.imported}
                </p>
                <p className="text-xs text-muted-foreground">Importados</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {result.skipped}
                </p>
                <p className="text-xs text-muted-foreground">Omitidos</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{result.imported + result.skipped}</p>
                <p className="text-xs text-muted-foreground">Total filas</p>
              </div>
            </div>
          </div>

          {result.skipReasons.length > 0 && (
            <div className="rounded-lg border border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-950/20 p-4 space-y-1.5">
              <div className="flex items-center gap-1.5 text-sm font-medium text-yellow-800 dark:text-yellow-300">
                <AlertCircle className="h-4 w-4" />
                Filas omitidas ({result.skipReasons.length})
              </div>
              <ul className="text-xs text-yellow-700 dark:text-yellow-400 space-y-0.5 max-h-40 overflow-y-auto">
                {result.skipReasons.slice(0, 50).map((r, i) => (
                  <li key={i}>· {r.reason}</li>
                ))}
                {result.skipReasons.length > 50 && (
                  <li>... y {result.skipReasons.length - 50} más</li>
                )}
              </ul>
            </div>
          )}

          <div className="flex gap-2">
            <Button variant="outline" onClick={reset}>
              Nueva importación
            </Button>
            <Button
              variant="ghost"
              className="text-destructive"
              onClick={() => undoBatch(result.batchId)}
              disabled={pending}
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Deshacer importación
            </Button>
          </div>
        </div>
      )}

      {/* ── Past imports ────────────────────────────────────────── */}
      {batches.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-border/40">
          <p className="text-sm font-medium text-muted-foreground">Importaciones anteriores</p>
          <div className="space-y-2">
            {batches.map((b) => (
              <div
                key={b.id}
                className="flex items-center justify-between rounded-lg border border-border/40 bg-muted/10 px-3 py-2"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <FileSpreadsheet className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{b.fileName}</p>
                    <p className="text-xs text-muted-foreground">
                      {MODULE_LABELS[b.module]} · {b.rowsImported} registros · {b.createdAt.slice(0, 10)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge
                    variant={
                      b.status === "completed"
                        ? "default"
                        : b.status === "undone"
                        ? "secondary"
                        : "outline"
                    }
                    className="text-xs"
                  >
                    {b.status === "completed"
                      ? "Completada"
                      : b.status === "undone"
                      ? "Deshecha"
                      : b.status}
                  </Badge>
                  {b.status === "completed" && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive"
                      title="Deshacer importación"
                      disabled={pending}
                      onClick={() => undoBatch(b.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Column mapping sub-component ─────────────────────────────────────────────

function ColumnMappingTable({
  analysis,
  selectedSheets,
  mapping,
  onChange,
}: {
  analysis: FileAnalysis;
  selectedSheets: string[];
  mapping: ColumnMapping;
  onChange: (m: ColumnMapping) => void;
}) {
  const firstSheet = analysis.sheets.find((s) => selectedSheets.includes(s.name));
  const allHeaders = firstSheet?.headers ?? [];
  const sampleRow = firstSheet?.sampleRows[0] ?? {};

  return (
    <div className="overflow-x-auto rounded-lg border border-border/60">
      <table className="w-full text-sm">
        <thead className="bg-muted/30">
          <tr>
            <th className="text-left px-3 py-2 font-medium">Campo OTC</th>
            <th className="text-left px-3 py-2 font-medium">Columna del archivo</th>
            <th className="text-left px-3 py-2 font-medium text-muted-foreground">Ejemplo</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/40">
          {CLOSING_FIELDS.map((field) => {
            const currentCol = mapping[field.key] ?? null;
            const sampleValue = currentCol ? sampleRow[currentCol] : "";
            return (
              <tr key={field.key} className="hover:bg-muted/10">
                <td className="px-3 py-2">
                  <span className="font-medium">{field.label}</span>
                  {field.required && <span className="ml-1 text-destructive">*</span>}
                  <p className="text-xs text-muted-foreground">{field.description}</p>
                </td>
                <td className="px-3 py-2">
                  <select
                    value={currentCol ?? ""}
                    onChange={(e) =>
                      onChange({ ...mapping, [field.key]: e.target.value || null })
                    }
                    className="w-full rounded-md border border-border/60 bg-background px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-primary/40"
                  >
                    <option value="">— Ignorar —</option>
                    {allHeaders.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-3 py-2 text-muted-foreground text-xs max-w-[200px] truncate">
                  {sampleValue || "—"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
