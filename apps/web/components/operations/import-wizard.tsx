"use client";

import { useCallback, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  FileSpreadsheet,
  Loader2,
  MousePointerClick,
  RotateCcw,
  Sparkles,
  Trash2,
  Upload,
} from "lucide-react";
import { Badge, Button } from "@ai-coo/ui";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/providers/toast-provider";
import {
  suggestColumnMappingAction,
  executeImportAction,
  undoImportAction,
  listImportBatchesAction,
} from "@/app/operations/import-actions";
import type { ColumnMapping, ImportBatch, ImportModule, ImportResult } from "@/types/import";
import { CLOSING_FIELDS, FINANCE_FIELDS } from "@/types/import";

// ─── Types ────────────────────────────────────────────────────────────────────

type Step = "upload" | "preview" | "mapping" | "result";

type ParsedSheet = {
  name: string;
  rows: string[][];   // up to PREVIEW_ROWS rows × PREVIEW_COLS cols
  totalRows: number;  // actual row count in the sheet
  totalCols: number;
};

const PREVIEW_ROWS = 30;
const PREVIEW_COLS = 20;

const MODULE_OPTIONS: { value: ImportModule; label: string; description: string }[] = [
  { value: "closing", label: "Ventas / Closing", description: "Llamadas, leads, cierres" },
  { value: "finance", label: "Finanzas / Pagos", description: "Pagos cobrados, gastos" },
];

const MODULE_LABELS: Record<ImportModule, string> = {
  closing: "Ventas / Closing",
  finance: "Finanzas / Pagos",
  content: "Contenido",
};

// ─── Client-side Excel parser ─────────────────────────────────────────────────

function cellVal(cell: { w?: string; v?: unknown; t?: string }): string {
  if (!cell) return "";
  if (cell.w) return cell.w.trim();
  return String(cell.v ?? "").trim();
}

async function parseFileInBrowser(file: File): Promise<ParsedSheet[]> {
  const XLSX = await import("xlsx");
  const buffer = await file.arrayBuffer();
  const wb = XLSX.read(buffer, { type: "array", cellDates: true, cellNF: true });

  return wb.SheetNames.map((name) => {
    const ws = wb.Sheets[name];
    if (!ws || !ws["!ref"]) return { name, rows: [], totalRows: 0, totalCols: 0 };

    const range = XLSX.utils.decode_range(ws["!ref"]);
    const totalRows = range.e.r - range.s.r + 1;
    const totalCols = range.e.c - range.s.c + 1;
    const rowCount = Math.min(PREVIEW_ROWS, totalRows);
    const colCount = Math.min(PREVIEW_COLS, totalCols);

    const rows: string[][] = [];
    for (let r = 0; r < rowCount; r++) {
      const row: string[] = [];
      for (let c = 0; c < colCount; c++) {
        const cell = ws[XLSX.utils.encode_cell({ r: range.s.r + r, c: range.s.c + c })];
        row.push(cell ? cellVal(cell as Parameters<typeof cellVal>[0]) : "");
      }
      rows.push(row);
    }
    return { name, rows, totalRows, totalCols };
  });
}

/** Find the row index with the most distinct non-empty values — best guess for header */
function guessHeaderRow(rows: string[][]): number {
  let best = 0;
  let bestScore = -1;
  for (let i = 0; i < Math.min(rows.length, 15); i++) {
    const distinct = new Set(rows[i].filter(Boolean));
    if (distinct.size > bestScore) { bestScore = distinct.size; best = i; }
    if (distinct.size >= 8) break; // good enough
  }
  return best;
}

// ─── Main wizard ──────────────────────────────────────────────────────────────

export function ImportWizard({ pastBatches }: { pastBatches: ImportBatch[] }) {
  const router = useRouter();
  const { push: toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();

  // Step state
  const [step, setStep] = useState<Step>("upload");

  // Step 1
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [storagePath, setStoragePath] = useState<string | null>(null);
  const [parsedSheets, setParsedSheets] = useState<ParsedSheet[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);

  // Step 2 (preview + header selection)
  const [activeSheet, setActiveSheet] = useState<string>("");
  const [selectedSheets, setSelectedSheets] = useState<string[]>([]);
  const [headerRowBySheet, setHeaderRowBySheet] = useState<Record<string, number>>({});
  const [module, setModule] = useState<ImportModule>("closing");

  // Step 3 (mapping)
  const [mappingHeaders, setMappingHeaders] = useState<string[]>([]);
  const [mappingSampleRow, setMappingSampleRow] = useState<Record<string, string>>({});
  const [mapping, setMapping] = useState<ColumnMapping>({});

  // Step 4 (result)
  const [result, setResult] = useState<ImportResult | null>(null);
  const [batches, setBatches] = useState<ImportBatch[]>(pastBatches);

  // ─── Step 1: Upload + client-side parse ────────────────────────────────────

  const handleFile = useCallback((f: File) => {
    setFile(f);
    setParseError(null);
    setParsedSheets([]);
  }, []);

  async function uploadAndParse() {
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) {
      toast({ title: "Archivo muy grande", description: "El máximo es 50 MB." });
      return;
    }

    try {
      setUploading(true);

      // Parse locally first (fast, no server needed)
      const sheets = await parseFileInBrowser(file);
      if (sheets.length === 0 || sheets.every((s) => s.rows.length === 0)) {
        setParseError("No se encontraron datos en el archivo.");
        setUploading(false);
        return;
      }

      // Upload to Supabase Storage (server will download it later for import)
      const supabase = createClient();
      const path = `imports/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
      const { error: uploadErr } = await supabase.storage
        .from("import-files")
        .upload(path, file, { upsert: false });

      if (uploadErr) {
        setParseError(`Error al subir el archivo: ${uploadErr.message}`);
        setUploading(false);
        return;
      }

      setStoragePath(path);
      setParsedSheets(sheets);

      // Auto-select first sheet and guess header rows
      const defaultSheet = sheets[0].name;
      const defaultSelected = sheets.map((s) => s.name);
      const defaultHeaders: Record<string, number> = {};
      for (const s of sheets) {
        defaultHeaders[s.name] = guessHeaderRow(s.rows);
      }

      setActiveSheet(defaultSheet);
      setSelectedSheets(defaultSelected);
      setHeaderRowBySheet(defaultHeaders);
      setUploading(false);
      setStep("preview");
    } catch (err) {
      setParseError(err instanceof Error ? err.message : "Error al procesar el archivo.");
      setUploading(false);
    }
  }

  // ─── Step 2 → 3: Get AI mapping suggestions ────────────────────────────────

  function confirmPreview() {
    if (selectedSheets.length === 0) {
      toast({ title: "Seleccioná al menos una hoja" });
      return;
    }

    // Build headers + sample row from the user's selected header row
    const firstSheetName = selectedSheets[0];
    const firstSheet = parsedSheets.find((s) => s.name === firstSheetName);
    if (!firstSheet) return;

    const hRow = headerRowBySheet[firstSheetName] ?? 0;
    const headers = firstSheet.rows[hRow] ?? [];
    const nonEmptyHeaders = headers.filter(Boolean);

    // First data row after the header that has at least one value
    let sampleRow: Record<string, string> = {};
    for (let r = hRow + 1; r < firstSheet.rows.length; r++) {
      const row = firstSheet.rows[r];
      if (row.some(Boolean)) {
        const obj: Record<string, string> = {};
        headers.forEach((h, i) => { if (h) obj[h] = row[i] ?? ""; });
        sampleRow = obj;
        break;
      }
    }

    setMappingHeaders(nonEmptyHeaders);
    setMappingSampleRow(sampleRow);

    startTransition(async () => {
      const res = await suggestColumnMappingAction(nonEmptyHeaders, sampleRow, module);
      if (res.success) setMapping(res.data);
      setStep("mapping");
    });
  }

  // ─── Step 3 → 4: Execute import ────────────────────────────────────────────

  function executeImport() {
    if (!storagePath || !file) return;
    startTransition(async () => {
      const res = await executeImportAction(
        storagePath,
        file.name,
        selectedSheets,
        mapping,
        module,
        headerRowBySheet
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
    setParsedSheets([]);
    setParseError(null);
    setActiveSheet("");
    setSelectedSheets([]);
    setHeaderRowBySheet({});
    setModule("closing");
    setMappingHeaders([]);
    setMappingSampleRow({});
    setMapping({});
    setResult(null);
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  }

  // ─── Render ────────────────────────────────────────────────────────────────

  const STEPS: { key: Step; label: string }[] = [
    { key: "upload", label: "Subir archivo" },
    { key: "preview", label: "Seleccionar datos" },
    { key: "mapping", label: "Mapear columnas" },
    { key: "result", label: "Resultado" },
  ];
  const stepIndex = STEPS.findIndex((s) => s.key === step);

  return (
    <div className="space-y-6">
      {/* Step indicator */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
        {STEPS.map((s, i) => {
          const active = step === s.key;
          const done = i < stepIndex;
          return (
            <span key={s.key} className="flex items-center gap-2">
              {i > 0 && <ChevronRight className="h-3.5 w-3.5 shrink-0 text-border" />}
              <span className={active ? "font-semibold text-foreground" : done ? "text-primary" : ""}>
                {done && <CheckCircle2 className="inline h-3.5 w-3.5 mr-1 text-primary" />}
                {s.label}
              </span>
            </span>
          );
        })}
      </div>

      {/* ── Step 1: Upload ──────────────────────────────────────────────────── */}
      {step === "upload" && (
        <div className="space-y-4">
          <div
            className={`flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-10 text-center transition-colors ${
              file
                ? "border-primary/40 bg-primary/5"
                : "border-border/60 bg-muted/20 hover:border-primary/30 cursor-pointer"
            }`}
            onClick={() => !file && fileRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const f = e.dataTransfer.files?.[0];
              if (f) handleFile(f);
            }}
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
                onClick={(e) => { e.stopPropagation(); setFile(null); if (fileRef.current) fileRef.current.value = ""; }}
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
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
          />

          {parseError && (
            <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {parseError}
            </div>
          )}

          <Button onClick={uploadAndParse} disabled={!file || uploading} className="w-full sm:w-auto">
            {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
            {uploading ? "Subiendo y leyendo archivo..." : "Continuar"}
          </Button>
        </div>
      )}

      {/* ── Step 2: Preview grid + header row selector ──────────────────────── */}
      {step === "preview" && parsedSheets.length > 0 && (
        <div className="space-y-4">
          {/* Instruction callout */}
          <div className="flex items-start gap-2.5 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3">
            <MousePointerClick className="h-4 w-4 mt-0.5 text-primary shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-foreground">Hacé clic en la fila que son los encabezados de columna</p>
              <p className="text-muted-foreground mt-0.5">
                Las filas de arriba se ignorarán. Las de abajo se importarán como datos.
              </p>
            </div>
          </div>

          {/* Module + sheet selector row */}
          <div className="flex flex-wrap gap-4 items-start">
            {/* Module picker */}
            <div className="space-y-1.5 min-w-[200px]">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Tipo de datos
              </p>
              <div className="flex gap-2">
                {MODULE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setModule(opt.value)}
                    className={`rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                      module === opt.value
                        ? "border-primary bg-primary/5 text-foreground"
                        : "border-border/60 text-muted-foreground hover:border-border"
                    }`}
                  >
                    <p className="font-medium">{opt.label}</p>
                    <p className="text-xs text-muted-foreground">{opt.description}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Sheet tabs */}
          {parsedSheets.length > 1 && (
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Hojas del archivo — seleccioná las que querés importar
              </p>
              <div className="flex flex-wrap gap-1.5">
                {parsedSheets.map((s) => {
                  const isActive = activeSheet === s.name;
                  const isSelected = selectedSheets.includes(s.name);
                  return (
                    <button
                      key={s.name}
                      onClick={() => setActiveSheet(s.name)}
                      className={`flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs transition-colors ${
                        isActive
                          ? "border-primary bg-primary/10 text-foreground font-medium"
                          : isSelected
                          ? "border-primary/30 bg-primary/5 text-foreground"
                          : "border-border/50 text-muted-foreground"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) =>
                          setSelectedSheets((prev) =>
                            e.target.checked ? [...prev, s.name] : prev.filter((n) => n !== s.name)
                          )
                        }
                        className="h-3 w-3 accent-primary"
                      />
                      {s.name}
                      <span className="text-muted-foreground">({s.totalRows})</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Data grid */}
          {(() => {
            const sheet = parsedSheets.find((s) => s.name === activeSheet);
            if (!sheet || sheet.rows.length === 0) return (
              <p className="text-sm text-muted-foreground">Esta hoja está vacía.</p>
            );
            const hRow = headerRowBySheet[activeSheet] ?? 0;
            return (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    Vista previa: <strong>{sheet.name}</strong> · {sheet.totalRows} filas · {sheet.totalCols} columnas
                    {sheet.totalCols > PREVIEW_COLS && ` (mostrando ${PREVIEW_COLS})`}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Fila seleccionada como encabezado:{" "}
                    <strong className="text-primary">fila {hRow + 1}</strong>
                  </p>
                </div>
                <div className="overflow-auto rounded-lg border border-border/60 max-h-[420px]">
                  <table className="text-xs border-collapse min-w-full">
                    <tbody>
                      {sheet.rows.map((row, ri) => {
                        const isHeader = ri === hRow;
                        const isAbove = ri < hRow;
                        return (
                          <tr
                            key={ri}
                            onClick={() => {
                              setHeaderRowBySheet((prev) => ({ ...prev, [activeSheet]: ri }));
                            }}
                            className={`cursor-pointer border-b border-border/30 transition-colors ${
                              isHeader
                                ? "bg-primary/15 hover:bg-primary/20"
                                : isAbove
                                ? "bg-muted/40 text-muted-foreground hover:bg-muted/60"
                                : "hover:bg-muted/20"
                            }`}
                          >
                            {/* Row number + indicator */}
                            <td className={`sticky left-0 z-10 w-10 px-2 py-1.5 text-center font-mono select-none border-r border-border/30 ${
                              isHeader
                                ? "bg-primary text-primary-foreground font-bold"
                                : isAbove
                                ? "bg-muted/60 text-muted-foreground"
                                : "bg-muted/20 text-muted-foreground"
                            }`}>
                              {ri + 1}
                            </td>
                            {row.map((cell, ci) => (
                              <td
                                key={ci}
                                className={`max-w-[150px] truncate px-2 py-1.5 border-r border-border/20 ${
                                  isHeader ? "font-semibold text-foreground" : ""
                                }`}
                                title={cell}
                              >
                                {cell || <span className="text-border">·</span>}
                              </td>
                            ))}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {sheet.totalRows > PREVIEW_ROWS && (
                  <p className="text-xs text-muted-foreground">
                    Mostrando primeras {PREVIEW_ROWS} de {sheet.totalRows} filas.
                    Se importarán todas al ejecutar.
                  </p>
                )}
              </div>
            );
          })()}

          <div className="flex gap-2">
            <Button variant="outline" onClick={reset} disabled={pending}>
              Volver
            </Button>
            <Button
              onClick={confirmPreview}
              disabled={selectedSheets.length === 0 || pending}
            >
              {pending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-4 w-4" />
              )}
              {pending ? "Generando mapeo..." : `Continuar con ${selectedSheets.length} hoja${selectedSheets.length !== 1 ? "s" : ""}`}
            </Button>
          </div>
        </div>
      )}

      {/* ── Step 3: Column mapping ───────────────────────────────────────────── */}
      {step === "mapping" && (
        <div className="space-y-4">
          <div className="rounded-lg border border-border/60 bg-muted/10 p-4">
            <p className="text-sm font-medium">Mapeo de columnas — {MODULE_LABELS[module]}</p>
            <p className="text-sm text-muted-foreground mt-0.5">
              La IA pre-mapeó las columnas. Revisá y corregí si hace falta.{" "}
              Los campos con <span className="text-destructive">*</span> son obligatorios.
            </p>
          </div>

          <ColumnMappingTable
            module={module}
            headers={mappingHeaders}
            sampleRow={mappingSampleRow}
            mapping={mapping}
            onChange={setMapping}
          />

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep("preview")} disabled={pending}>
              Volver
            </Button>
            <Button onClick={executeImport} disabled={pending}>
              {pending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Upload className="mr-2 h-4 w-4" />
              )}
              {pending ? "Importando..." : "Importar datos"}
            </Button>
          </div>
        </div>
      )}

      {/* ── Step 4: Result ───────────────────────────────────────────────────── */}
      {step === "result" && result && (
        <div className="space-y-4">
          <div className="rounded-xl border border-green-200 bg-green-50 p-5 dark:border-green-900 dark:bg-green-950/30">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
              <p className="font-semibold text-green-800 dark:text-green-300">Importación completada</p>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-700 dark:text-green-300">{result.imported}</p>
                <p className="text-xs text-muted-foreground">Importados</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{result.skipped}</p>
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

      {/* ── Past imports ─────────────────────────────────────────────────────── */}
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
                    variant={b.status === "completed" ? "default" : b.status === "undone" ? "secondary" : "outline"}
                    className="text-xs"
                  >
                    {b.status === "completed" ? "Completada" : b.status === "undone" ? "Deshecha" : b.status}
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
  module,
  headers,
  sampleRow,
  mapping,
  onChange,
}: {
  module: ImportModule;
  headers: string[];
  sampleRow: Record<string, string>;
  mapping: ColumnMapping;
  onChange: (m: ColumnMapping) => void;
}) {
  const fields = module === "finance" ? FINANCE_FIELDS : CLOSING_FIELDS;

  return (
    <div className="overflow-x-auto rounded-lg border border-border/60">
      <table className="w-full text-sm">
        <thead className="bg-muted/30">
          <tr>
            <th className="text-left px-3 py-2 font-medium w-[220px]">Campo OTC</th>
            <th className="text-left px-3 py-2 font-medium">Columna del archivo</th>
            <th className="text-left px-3 py-2 font-medium text-muted-foreground w-[180px]">Ejemplo</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/40">
          {fields.map((field) => {
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
                    onChange={(e) => onChange({ ...mapping, [field.key]: e.target.value || null })}
                    className="w-full rounded-md border border-border/60 bg-background px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-primary/40"
                  >
                    <option value="">— Ignorar —</option>
                    {headers.map((h) => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </td>
                <td className="px-3 py-2 text-muted-foreground text-xs max-w-[180px] truncate" title={sampleValue}>
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
