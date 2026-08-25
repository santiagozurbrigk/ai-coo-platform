"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  Badge,
} from "@ai-coo/ui";
import { useToast } from "@/providers/toast-provider";
import { previewGHLContactsAction, importGHLContactsAction } from "@/app/ghl/import-actions";
import {
  importClientsFromExcelAction,
  importClosingCallsFromExcelAction,
  importSalesMetricsFromExcelAction,
  importFinanceMetricsFromExcelAction,
  importSalesMetricsTransposedAction,
  importFinanceMetricsTransposedAction,
  getExcelPreviewAction,
  type ExcelImportResult,
  type ExcelPreview,
  type SalesMetricsColumnMapping,
  type FinanceMetricsColumnMapping,
} from "@/app/clients/import-actions";
import type { ColumnMapping } from "@/lib/clients/excel-parser";
import type { ClosingColumnMapping } from "@/lib/closing/excel-parser";
import {
  ExcelColumnMapper,
  isMappingValid,
  type ExcelColumnMapperValue,
} from "@/components/integrations/excel-column-mapper";
import { Upload, Database, FileSpreadsheet, CheckCircle, Loader2, ChevronRight, ChevronLeft, Users, Phone, TrendingUp, DollarSign } from "lucide-react";

// ─── Tipos ────────────────────────────────────────────────────────────────────

type Origin = "ghl" | "excel" | null;
type WhatToImport = "clients" | "closing" | "salesMetrics" | "financeMetrics";
type Step = "origin" | "what" | "mapper" | "confirm";

type GHLPreview = {
  total: number;
  preview: Array<{ name: string; email: string | null; phone: string | null }>;
};

type ExcelFile = {
  name: string;
  base64: string;
};

type ImportSummary = {
  clientsResult?:      ExcelImportResult & { source: "ghl" | "excel" };
  closingResult?:      ExcelImportResult;
  salesMetricsResult?: ExcelImportResult;
  financeMetricsResult?: ExcelImportResult;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // data:application/...;base64,<data>
      const b64 = result.split(",")[1];
      resolve(b64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ─── Detección de formato transpuesto (client-side) ──────────────────────────

const MONTH_TOKENS = new Set([
  "enero","febrero","marzo","abril","mayo","junio",
  "julio","agosto","septiembre","octubre","noviembre","diciembre",
  "january","february","march","april","may","june",
  "july","august","september","october","november","december",
  "ene","feb","mar","abr","jun","jul","ago","sep","oct","nov","dic",
  "jan","aug",
]);

function looksLikeMonthHeader(s: string): boolean {
  // Acepta "Marzo", "Marzo 2025", "03/2025", "2025-03"
  const lower = s.toLowerCase().trim();
  if (/^\d{1,2}[\/\-]\d{4}$/.test(lower) || /^\d{4}[\/\-]\d{1,2}$/.test(lower)) return true;
  return lower.split(/[\s\-_,]+/).some((p) => MONTH_TOKENS.has(p));
}

function isTransposedMetricsFormat(headers: string[]): boolean {
  return headers.filter((h) => looksLikeMonthHeader(h)).length >= 2;
}

// ─── Paso 1 — Origen ─────────────────────────────────────────────────────────

function StepOrigin({
  ghlConnected,
  selected,
  onSelect,
}: {
  ghlConnected: boolean;
  selected: Origin;
  onSelect: (o: Origin) => void;
}) {
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        ¿Desde dónde vienen tus datos?
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <OriginCard
          icon={<Database className="h-5 w-5" />}
          title="GoHighLevel"
          description={ghlConnected ? "Importar desde tu cuenta GHL conectada" : "Conectá GHL primero en integraciones"}
          disabled={!ghlConnected}
          selected={selected === "ghl"}
          onClick={() => onSelect("ghl")}
        />
        <OriginCard
          icon={<FileSpreadsheet className="h-5 w-5" />}
          title="Excel / CSV"
          description="Subí un archivo .xlsx con tus datos"
          selected={selected === "excel"}
          onClick={() => onSelect("excel")}
        />
      </div>
    </div>
  );
}

function OriginCard({
  icon, title, description, selected, disabled, onClick,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  selected: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`w-full rounded-lg border p-4 text-left transition-colors disabled:opacity-40 disabled:cursor-not-allowed
        ${selected ? "border-primary bg-primary/5" : "border-border hover:bg-muted"}`}
    >
      <div className={`mb-2 ${selected ? "text-primary" : "text-muted-foreground"}`}>{icon}</div>
      <p className="text-sm font-medium">{title}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
    </button>
  );
}

// ─── Paso 2 — Qué importar ────────────────────────────────────────────────────

// ─── Sub-componente: fila de archivo por tipo ─────────────────────────────────

function FileRow({
  // label and icon kept in interface for callers but not rendered (uploadLabel is used instead)
  label: _label,
  icon: _icon,
  file,
  accept,
  onFile,
  uploadLabel,
}: {
  label: string;
  icon: React.ReactNode;
  file: ExcelFile | null;
  accept: string;
  onFile: (f: ExcelFile | null) => void;
  uploadLabel: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (f: File) => {
    const b64 = await fileToBase64(f);
    onFile({ name: f.name, base64: b64 });
  }, [onFile]);

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) void handleFile(f); }}
      />
      {file ? (
        <div className="flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <span className="text-xs truncate">{file.name}</span>
          <button type="button" onClick={() => onFile(null)} className="text-xs text-muted-foreground hover:text-destructive">
            Quitar
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex items-center gap-1.5 text-xs text-primary hover:underline"
        >
          <Upload className="h-3 w-3" /> {uploadLabel}
        </button>
      )}
    </div>
  );
}

// ─── CheckboxCard ─────────────────────────────────────────────────────────────

function CheckboxCard({
  checked,
  onToggle,
  icon,
  title,
  children,
}: {
  checked: boolean;
  onToggle: () => void;
  icon: React.ReactNode;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={`rounded-lg border p-4 space-y-3 ${checked ? "border-primary bg-primary/5" : "border-border"}`}>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggle}
          className={`h-4 w-4 rounded border-2 flex-shrink-0 transition-colors ${checked ? "bg-primary border-primary" : "border-muted-foreground"}`}
        />
        <span className="text-muted-foreground flex-shrink-0">{icon}</span>
        <span className="text-sm font-medium">{title}</span>
      </div>
      {checked && children && <div className="ml-7">{children}</div>}
    </div>
  );
}

function StepWhat({
  origin,
  what,
  onWhat,
  ghlPreview,
  ghlPreviewLoading,
  clientsFile,
  closingFile,
  salesMetricsFile,
  financeMetricsFile,
  onClientsFile,
  onClosingFile,
  onSalesMetricsFile,
  onFinanceMetricsFile,
}: {
  origin: Origin;
  what: Set<WhatToImport>;
  onWhat: (w: WhatToImport) => void;
  ghlPreview: GHLPreview | null;
  ghlPreviewLoading: boolean;
  clientsFile: ExcelFile | null;
  closingFile: ExcelFile | null;
  salesMetricsFile: ExcelFile | null;
  financeMetricsFile: ExcelFile | null;
  onClientsFile: (f: ExcelFile | null) => void;
  onClosingFile: (f: ExcelFile | null) => void;
  onSalesMetricsFile: (f: ExcelFile | null) => void;
  onFinanceMetricsFile: (f: ExcelFile | null) => void;
}) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">¿Qué querés importar?</p>

      {/* Clientes */}
      <CheckboxCard
        checked={what.has("clients")}
        onToggle={() => onWhat("clients")}
        icon={<Users className="h-4 w-4" />}
        title="Clientes activos y anteriores"
      >
        {origin === "ghl" && (
          ghlPreviewLoading ? (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" /> Cargando preview…
            </div>
          ) : ghlPreview ? (
            <div className="space-y-1.5">
              <p className="text-xs text-muted-foreground">{ghlPreview.total} contactos en GHL</p>
              <div className="space-y-1 max-h-28 overflow-y-auto">
                {ghlPreview.preview.map((c, i) => (
                  <div key={i} className="text-xs flex gap-2">
                    <span className="font-medium truncate max-w-[160px]">{c.name}</span>
                    {c.email && <span className="text-muted-foreground truncate">{c.email}</span>}
                  </div>
                ))}
                {ghlPreview.total > 10 && <p className="text-xs text-muted-foreground italic">… y {ghlPreview.total - 10} más</p>}
              </div>
            </div>
          ) : null
        )}
        {origin === "excel" && (
          <FileRow
            label="clientes"
            icon={<Users className="h-3 w-3" />}
            file={clientsFile}
            accept=".xlsx,.xls,.csv"
            onFile={onClientsFile}
            uploadLabel="Subir archivo de clientes (.xlsx)"
          />
        )}
      </CheckboxCard>

      {/* Llamadas de cierre (solo Excel) */}
      {origin === "excel" && (
        <CheckboxCard
          checked={what.has("closing")}
          onToggle={() => onWhat("closing")}
          icon={<Phone className="h-4 w-4" />}
          title="Llamadas de cierre / citas"
        >
          <FileRow
            label="llamadas"
            icon={<Phone className="h-3 w-3" />}
            file={closingFile}
            accept=".xlsx,.xls,.csv"
            onFile={onClosingFile}
            uploadLabel="Subir archivo de llamadas (.xlsx)"
          />
        </CheckboxCard>
      )}

      {/* Métricas de ventas (solo Excel) */}
      {origin === "excel" && (
        <CheckboxCard
          checked={what.has("salesMetrics")}
          onToggle={() => onWhat("salesMetrics")}
          icon={<TrendingUp className="h-4 w-4" />}
          title="Métricas de ventas"
        >
          <p className="text-xs text-muted-foreground mb-2">
            Close rate, show rate, facturación, cash collected, leads, agendas, cierres, etc. Soporta tablas con un período por fila o en formato pivot (meses como columnas).
          </p>
          <FileRow
            label="métricas de ventas"
            icon={<TrendingUp className="h-3 w-3" />}
            file={salesMetricsFile}
            accept=".xlsx,.xls,.csv"
            onFile={onSalesMetricsFile}
            uploadLabel="Subir archivo de métricas de ventas (.xlsx)"
          />
        </CheckboxCard>
      )}

      {/* Métricas de finanzas (solo Excel) */}
      {origin === "excel" && (
        <CheckboxCard
          checked={what.has("financeMetrics")}
          onToggle={() => onWhat("financeMetrics")}
          icon={<DollarSign className="h-4 w-4" />}
          title="Métricas de finanzas"
        >
          <p className="text-xs text-muted-foreground mb-2">
            Facturación, cash collected, margen, por cobrar, gastos. Soporta tablas con un período por fila o en formato pivot (meses como columnas).
          </p>
          <FileRow
            label="métricas de finanzas"
            icon={<DollarSign className="h-3 w-3" />}
            file={financeMetricsFile}
            accept=".xlsx,.xls,.csv"
            onFile={onFinanceMetricsFile}
            uploadLabel="Subir archivo de métricas de finanzas (.xlsx)"
          />
        </CheckboxCard>
      )}

      {/* GHL solo importa clientes */}
      {origin === "ghl" && (
        <p className="text-xs text-muted-foreground">
          Las citas de GHL se sincronizan automáticamente desde la integración de calendario.
        </p>
      )}
    </div>
  );
}

// ─── Selector de hoja ─────────────────────────────────────────────────────────

function SheetSelector({
  label,
  allSheets,
  activeSheet,
  loading,
  onSelect,
}: {
  label: string;
  allSheets: string[];
  activeSheet: string;
  loading: boolean;
  onSelect: (sheet: string) => void;
}) {
  if (allSheets.length <= 1) return null;
  return (
    <div className="flex items-center gap-2 rounded-md bg-muted/50 px-3 py-2">
      <span className="text-xs text-muted-foreground shrink-0">Hoja ({label}):</span>
      <select
        value={activeSheet}
        disabled={loading}
        onChange={(e) => onSelect(e.target.value)}
        className="flex-1 h-7 rounded border border-input bg-background px-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
      >
        {allSheets.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
      {loading && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground shrink-0" />}
    </div>
  );
}

// ─── Mapper de filas para formato transpuesto ─────────────────────────────────

function TransposedRowMapper({
  label,
  preview,
  fields,
  mapping,
  onChange,
}: {
  label: string;
  preview: ExcelPreview;
  fields: RowField[];
  mapping: Record<string, string>;
  onChange: (m: Record<string, string>) => void;
}) {
  const months = preview.headers.filter((h) => looksLikeMonthHeader(h));
  const rowLabels = preview.rowLabels ?? [];

  return (
    <div className="space-y-3">
      <div className="rounded-md border border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30 px-3 py-2.5 space-y-1">
        <p className="text-xs font-medium text-blue-700 dark:text-blue-300">
          Formato tabla detectado — {label}
        </p>
        <p className="text-xs text-blue-600 dark:text-blue-400">
          Períodos detectados: {months.slice(0, 6).join(", ")}{months.length > 6 ? ` y ${months.length - 6} más` : ""}.
          Indicá qué fila del archivo corresponde a cada métrica.
        </p>
      </div>

      {rowLabels.length === 0 ? (
        <p className="text-xs text-amber-600 bg-amber-50 dark:bg-amber-950/30 rounded px-3 py-2">
          No se pudieron leer las etiquetas de fila. Verificá que la columna A del archivo tenga los nombres de las métricas.
        </p>
      ) : (
        <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
          {fields.map((f) => (
            <div key={f.key} className="flex items-center gap-2">
              <span className="text-xs text-foreground w-44 shrink-0">{f.label}</span>
              <select
                value={mapping[f.key] ?? ""}
                onChange={(e) => onChange({ ...mapping, [f.key]: e.target.value })}
                className="flex-1 h-7 rounded border border-input bg-background px-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="">— no importar —</option>
                {rowLabels.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Paso 2.5 — Mapeo de columnas ─────────────────────────────────────────────

function StepMapper({
  clientsPreview,
  closingPreview,
  salesMetricsPreview,
  financeMetricsPreview,
  clientsFile,
  closingFile,
  salesMetricsFile,
  financeMetricsFile,
  mapping,
  onMapping,
  loading,
  transposedTypes,
  transposedSalesRowMapping,
  transposedFinanceRowMapping,
  onTransposedSalesRowMappingChange,
  onTransposedFinanceRowMappingChange,
  onClientsSheetChange,
  onClosingSheetChange,
  onSalesMetricsSheetChange,
  onFinanceMetricsSheetChange,
  clientsSheetLoading,
  closingSheetLoading,
  salesMetricsSheetLoading,
  financeMetricsSheetLoading,
}: {
  clientsPreview: ExcelPreview | null;
  closingPreview: ExcelPreview | null;
  salesMetricsPreview: ExcelPreview | null;
  financeMetricsPreview: ExcelPreview | null;
  clientsFile: ExcelFile | null;
  closingFile: ExcelFile | null;
  salesMetricsFile: ExcelFile | null;
  financeMetricsFile: ExcelFile | null;
  mapping: ExcelColumnMapperValue;
  onMapping: (v: ExcelColumnMapperValue) => void;
  loading: boolean;
  transposedTypes: Set<WhatToImport>;
  transposedSalesRowMapping: Record<string, string>;
  transposedFinanceRowMapping: Record<string, string>;
  onTransposedSalesRowMappingChange: (m: Record<string, string>) => void;
  onTransposedFinanceRowMappingChange: (m: Record<string, string>) => void;
  onClientsSheetChange: (sheet: string) => void;
  onClosingSheetChange: (sheet: string) => void;
  onSalesMetricsSheetChange: (sheet: string) => void;
  onFinanceMetricsSheetChange: (sheet: string) => void;
  clientsSheetLoading: boolean;
  closingSheetLoading: boolean;
  salesMetricsSheetLoading: boolean;
  financeMetricsSheetLoading: boolean;
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-10 gap-2 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm">Leyendo columnas del archivo…</span>
      </div>
    );
  }

  const salesTransposed   = transposedTypes.has("salesMetrics");
  const financeTransposed = transposedTypes.has("financeMetrics");

  // Para el ExcelColumnMapper, pasamos undefined en tipos transpuestos (no necesitan mapeo de columnas)
  const salesHeaders   = salesTransposed   ? undefined : salesMetricsPreview?.headers;
  const financeHeaders = financeTransposed ? undefined : financeMetricsPreview?.headers;

  const needsColumnMapper = !!(
    clientsPreview?.headers.length ||
    closingPreview?.headers.length ||
    salesHeaders?.length ||
    financeHeaders?.length
  );

  const hasAnyTransposed = salesTransposed || financeTransposed;

  return (
    <div className="space-y-4">
      {hasAnyTransposed && !needsColumnMapper ? (
        <div>
          <p className="text-sm font-medium">Mapeo de filas</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Seleccioná qué fila de tu archivo corresponde a cada métrica de OTC.
          </p>
        </div>
      ) : (
        <div>
          <p className="text-sm font-medium">Mapeo de columnas</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Indicá qué columna de tu archivo corresponde a cada campo de OTC. Los campos marcados con <span className="text-destructive">*</span> son obligatorios.
          </p>
        </div>
      )}

      {/* Selectores de hoja — siempre visibles para poder cambiar de hoja */}
      {clientsPreview && clientsFile && (
        <SheetSelector label="clientes" allSheets={clientsPreview.allSheets} activeSheet={clientsPreview.activeSheet} loading={clientsSheetLoading} onSelect={onClientsSheetChange} />
      )}
      {closingPreview && closingFile && (
        <SheetSelector label="llamadas" allSheets={closingPreview.allSheets} activeSheet={closingPreview.activeSheet} loading={closingSheetLoading} onSelect={onClosingSheetChange} />
      )}
      {salesMetricsPreview && salesMetricsFile && (
        <SheetSelector label="métricas ventas" allSheets={salesMetricsPreview.allSheets} activeSheet={salesMetricsPreview.activeSheet} loading={salesMetricsSheetLoading} onSelect={onSalesMetricsSheetChange} />
      )}
      {financeMetricsPreview && financeMetricsFile && (
        <SheetSelector label="métricas finanzas" allSheets={financeMetricsPreview.allSheets} activeSheet={financeMetricsPreview.activeSheet} loading={financeMetricsSheetLoading} onSelect={onFinanceMetricsSheetChange} />
      )}

      {/* Mapper de filas para tipos transpuestos */}
      {salesTransposed && salesMetricsPreview && (
        <TransposedRowMapper
          label="Métricas de ventas"
          preview={salesMetricsPreview}
          fields={SALES_ROW_FIELDS}
          mapping={transposedSalesRowMapping}
          onChange={onTransposedSalesRowMappingChange}
        />
      )}
      {financeTransposed && financeMetricsPreview && (
        <TransposedRowMapper
          label="Métricas de finanzas"
          preview={financeMetricsPreview}
          fields={FINANCE_ROW_FIELDS}
          mapping={transposedFinanceRowMapping}
          onChange={onTransposedFinanceRowMappingChange}
        />
      )}

      {clientsPreview?.headers.length === 0 && (
        <p className="text-xs text-amber-600 bg-amber-50 dark:bg-amber-950/30 rounded px-3 py-2">
          La hoja seleccionada no tiene columnas reconocibles. Elegí otra hoja en el selector de arriba.
        </p>
      )}

      {needsColumnMapper && (
        <ExcelColumnMapper
          clientsHeaders={clientsPreview?.headers}
          clientsPreviewRows={clientsPreview?.rows}
          closingHeaders={closingPreview?.headers}
          closingPreviewRows={closingPreview?.rows}
          salesMetricsHeaders={salesHeaders}
          salesMetricsPreviewRows={salesTransposed ? undefined : salesMetricsPreview?.rows}
          financeMetricsHeaders={financeHeaders}
          financeMetricsPreviewRows={financeTransposed ? undefined : financeMetricsPreview?.rows}
          value={mapping}
          onChange={onMapping}
        />
      )}
    </div>
  );
}

// ─── Paso 3 — Confirmación ────────────────────────────────────────────────────

function StepConfirm({
  origin,
  what,
  ghlPreview,
  clientsFile,
  closingFile,
  salesMetricsFile,
  financeMetricsFile,
  importing,
  summary,
  onImport,
}: {
  origin: Origin;
  what: Set<WhatToImport>;
  ghlPreview: GHLPreview | null;
  clientsFile: ExcelFile | null;
  closingFile: ExcelFile | null;
  salesMetricsFile: ExcelFile | null;
  financeMetricsFile: ExcelFile | null;
  importing: boolean;
  summary: ImportSummary | null;
  onImport: () => void;
}) {
  if (summary) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-green-600">
          <CheckCircle className="h-5 w-5" />
          <span className="text-sm font-medium">Importación completada</span>
        </div>
        {summary.clientsResult && (
          <ResultRow label="Clientes" inserted={summary.clientsResult.inserted} skipped={summary.clientsResult.skipped} errors={summary.clientsResult.errors.length} />
        )}
        {summary.closingResult && (
          <ResultRow label="Llamadas de cierre" inserted={summary.closingResult.inserted} skipped={summary.closingResult.skipped} errors={summary.closingResult.errors.length} />
        )}
        {summary.salesMetricsResult && (
          <ResultRow label="Métricas de ventas" inserted={summary.salesMetricsResult.inserted} skipped={summary.salesMetricsResult.skipped} errors={summary.salesMetricsResult.errors.length} />
        )}
        {summary.financeMetricsResult && (
          <ResultRow label="Métricas de finanzas" inserted={summary.financeMetricsResult.inserted} skipped={summary.financeMetricsResult.skipped} errors={summary.financeMetricsResult.errors.length} />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">Revisá antes de importar:</p>
      <div className="rounded-lg border border-border divide-y divide-border">
        {what.has("clients") && (
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Clientes</span>
            </div>
            {origin === "ghl" && ghlPreview ? (
              <Badge variant="secondary">{ghlPreview.total} contactos de GHL</Badge>
            ) : clientsFile ? (
              <Badge variant="secondary">{clientsFile.name}</Badge>
            ) : (
              <span className="text-xs text-muted-foreground">Sin archivo</span>
            )}
          </div>
        )}
        {what.has("closing") && origin === "excel" && (
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Llamadas de cierre</span>
            </div>
            {closingFile ? (
              <Badge variant="secondary">{closingFile.name}</Badge>
            ) : (
              <span className="text-xs text-muted-foreground">Sin archivo</span>
            )}
          </div>
        )}
        {what.has("salesMetrics") && origin === "excel" && (
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Métricas de ventas</span>
            </div>
            {salesMetricsFile ? (
              <Badge variant="secondary">{salesMetricsFile.name}</Badge>
            ) : (
              <span className="text-xs text-muted-foreground">Sin archivo</span>
            )}
          </div>
        )}
        {what.has("financeMetrics") && origin === "excel" && (
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Métricas de finanzas</span>
            </div>
            {financeMetricsFile ? (
              <Badge variant="secondary">{financeMetricsFile.name}</Badge>
            ) : (
              <span className="text-xs text-muted-foreground">Sin archivo</span>
            )}
          </div>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        Clientes y llamadas: si ya existen, no se sobreescriben. Métricas: si ya existe un registro para el mismo período, se actualiza con los nuevos valores.
      </p>
      <Button
        type="button"
        onClick={onImport}
        disabled={importing}
        className="w-full"
      >
        {importing ? (
          <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Importando…</>
        ) : (
          "Importar"
        )}
      </Button>
    </div>
  );
}

function ResultRow({ label, inserted, skipped, errors }: {
  label: string; inserted: number; skipped: number; errors: number;
}) {
  return (
    <div className="text-sm">
      <p className="font-medium">{label}</p>
      <div className="flex gap-3 mt-1 text-xs text-muted-foreground">
        <span className="text-green-600">{inserted} importados</span>
        {skipped > 0 && <span>{skipped} ya existían</span>}
        {errors > 0 && <span className="text-destructive">{errors} errores</span>}
      </div>
    </div>
  );
}

// ─── Wizard principal ─────────────────────────────────────────────────────────

export function DataImportWizard({ ghlConnected }: { ghlConnected: boolean }) {
  const router = useRouter();
  const { push } = useToast();

  const [step, setStep] = useState<Step>("origin");
  const [origin, setOrigin] = useState<Origin>(null);
  const [what, setWhat] = useState<Set<WhatToImport>>(new Set(["clients"]));
  const [ghlPreview, setGhlPreview] = useState<GHLPreview | null>(null);
  const [ghlPreviewLoading, setGhlPreviewLoading] = useState(false);
  const [clientsFile, setClientsFile] = useState<ExcelFile | null>(null);
  const [closingFile, setClosingFile] = useState<ExcelFile | null>(null);
  const [salesMetricsFile, setSalesMetricsFile] = useState<ExcelFile | null>(null);
  const [financeMetricsFile, setFinanceMetricsFile] = useState<ExcelFile | null>(null);
  const [importing, setImporting] = useState(false);
  const [summary, setSummary] = useState<ImportSummary | null>(null);

  // ── Mapper state ──
  const [clientsPreview, setClientsPreview] = useState<ExcelPreview | null>(null);
  const [closingPreview, setClosingPreview] = useState<ExcelPreview | null>(null);
  const [salesMetricsPreview, setSalesMetricsPreview] = useState<ExcelPreview | null>(null);
  const [financeMetricsPreview, setFinanceMetricsPreview] = useState<ExcelPreview | null>(null);
  const [columnMapping, setColumnMapping] = useState<ExcelColumnMapperValue>({});
  const [mapperLoading, setMapperLoading] = useState(false);
  const [clientsSheetLoading, setClientsSheetLoading] = useState(false);
  const [closingSheetLoading, setClosingSheetLoading] = useState(false);
  const [salesMetricsSheetLoading, setSalesMetricsSheetLoading] = useState(false);
  const [financeMetricsSheetLoading, setFinanceMetricsSheetLoading] = useState(false);
  // Tipos donde se detectó formato transpuesto (pivot: meses=columnas, métricas=filas)
  const [transposedTypes, setTransposedTypes] = useState<Set<WhatToImport>>(new Set());
  // Mapeo manual de filas para formatos transpuestos: { fieldKey → "Etiqueta de fila en el Excel" }
  const [transposedSalesRowMapping, setTransposedSalesRowMapping] = useState<Record<string, string>>({});
  const [transposedFinanceRowMapping, setTransposedFinanceRowMapping] = useState<Record<string, string>>({});

  const toggleWhat = (w: WhatToImport) => {
    setWhat((prev) => {
      const next = new Set(prev);
      if (next.has(w)) next.delete(w);
      else next.add(w);
      return next;
    });
  };

  const handleOriginSelect = async (o: Origin) => {
    setOrigin(o);
    // Si es GHL, cargar preview de contactos automáticamente
    if (o === "ghl" && !ghlPreview) {
      setGhlPreviewLoading(true);
      try {
        const result = await previewGHLContactsAction();
        if (result.success) setGhlPreview(result.data);
      } finally {
        setGhlPreviewLoading(false);
      }
    }
  };

  // Transición de "what" → siguiente paso
  const handleAdvanceFromWhat = async () => {
    if (origin === "excel") {
      setMapperLoading(true);
      setStep("mapper");
      try {
        const [cp, lp, sp, fp] = await Promise.all([
          clientsFile && what.has("clients")       ? getExcelPreviewAction(clientsFile.base64)       : Promise.resolve(null),
          closingFile && what.has("closing")        ? getExcelPreviewAction(closingFile.base64)        : Promise.resolve(null),
          salesMetricsFile && what.has("salesMetrics")   ? getExcelPreviewAction(salesMetricsFile.base64)   : Promise.resolve(null),
          financeMetricsFile && what.has("financeMetrics") ? getExcelPreviewAction(financeMetricsFile.base64) : Promise.resolve(null),
        ]);
        const spData = sp?.success ? sp.data : null;
        const fpData = fp?.success ? fp.data : null;

        setClientsPreview(cp?.success ? cp.data : null);
        setClosingPreview(lp?.success ? lp.data : null);
        setSalesMetricsPreview(spData);
        setFinanceMetricsPreview(fpData);

        // Detectar formato transpuesto (pivot) para métricas
        const detected = new Set<WhatToImport>();
        if (spData && isTransposedMetricsFormat(spData.headers)) detected.add("salesMetrics");
        if (fpData && isTransposedMetricsFormat(fpData.headers)) detected.add("financeMetrics");
        setTransposedTypes(detected);

        // Auto-sugerir mapeo de filas usando el diccionario de sinónimos
        if (detected.has("salesMetrics") && spData?.rowLabels?.length) {
          setTransposedSalesRowMapping(autoMapTransposedRows("salesMetrics", spData.rowLabels));
        } else {
          setTransposedSalesRowMapping({});
        }
        if (detected.has("financeMetrics") && fpData?.rowLabels?.length) {
          setTransposedFinanceRowMapping(autoMapTransposedRows("financeMetrics", fpData.rowLabels));
        } else {
          setTransposedFinanceRowMapping({});
        }

        setColumnMapping({
          clientsMapping:       cp?.success ? autoMap("clients",       cp.data.headers) as Partial<ColumnMapping>            : undefined,
          closingMapping:       lp?.success ? autoMap("closing",       lp.data.headers) as Partial<ClosingColumnMapping>     : undefined,
          // Para tipos transpuestos no se necesita mapping; para el resto, auto-mapear
          salesMetricsMapping:  spData && !detected.has("salesMetrics")   ? autoMap("salesMetrics",  spData.headers)  as Partial<SalesMetricsColumnMapping>  : undefined,
          financeMetricsMapping:fpData && !detected.has("financeMetrics") ? autoMap("financeMetrics", fpData.headers) as Partial<FinanceMetricsColumnMapping> : undefined,
        });
      } finally {
        setMapperLoading(false);
      }
    } else {
      setStep("confirm");
    }
  };

  const canAdvanceFromOrigin = origin !== null;
  const canAdvanceFromWhat = what.size > 0 && (
    origin === "ghl"
      ? true
      : (what.has("clients")       ? !!clientsFile       : true) &&
        (what.has("closing")        ? !!closingFile        : true) &&
        (what.has("salesMetrics")   ? !!salesMetricsFile   : true) &&
        (what.has("financeMetrics") ? !!financeMetricsFile : true)
  );

  const canAdvanceFromMapper = (
    (!clientsPreview || isMappingValid("clients", columnMapping.clientsMapping)) &&
    (!closingPreview  || isMappingValid("closing", columnMapping.closingMapping)) &&
    (
      !salesMetricsPreview ? true :
      transposedTypes.has("salesMetrics")
        ? Object.values(transposedSalesRowMapping).some(Boolean)
        : isMappingValid("salesMetrics", columnMapping.salesMetricsMapping)
    ) &&
    (
      !financeMetricsPreview ? true :
      transposedTypes.has("financeMetrics")
        ? Object.values(transposedFinanceRowMapping).some(Boolean)
        : isMappingValid("financeMetrics", columnMapping.financeMetricsMapping)
    )
  );

  const handleClientsSheetChange = async (sheet: string) => {
    if (!clientsFile) return;
    setClientsSheetLoading(true);
    try {
      const result = await getExcelPreviewAction(clientsFile.base64, sheet);
      if (result.success) {
        setClientsPreview(result.data);
        setColumnMapping((prev) => ({
          ...prev,
          clientsMapping: autoMap("clients", result.data.headers) as Partial<ColumnMapping>,
        }));
      }
    } finally {
      setClientsSheetLoading(false);
    }
  };

  const handleClosingSheetChange = async (sheet: string) => {
    if (!closingFile) return;
    setClosingSheetLoading(true);
    try {
      const result = await getExcelPreviewAction(closingFile.base64, sheet);
      if (result.success) {
        setClosingPreview(result.data);
        setColumnMapping((prev) => ({
          ...prev,
          closingMapping: autoMap("closing", result.data.headers) as Partial<ClosingColumnMapping>,
        }));
      }
    } finally {
      setClosingSheetLoading(false);
    }
  };

  const handleSalesMetricsSheetChange = async (sheet: string) => {
    if (!salesMetricsFile) return;
    setSalesMetricsSheetLoading(true);
    try {
      const result = await getExcelPreviewAction(salesMetricsFile.base64, sheet);
      if (result.success) {
        setSalesMetricsPreview(result.data);
        const isTransposed = isTransposedMetricsFormat(result.data.headers);
        setTransposedTypes((prev) => {
          const next = new Set(prev);
          if (isTransposed) next.add("salesMetrics"); else next.delete("salesMetrics");
          return next;
        });
        if (isTransposed && result.data.rowLabels?.length) {
          setTransposedSalesRowMapping(autoMapTransposedRows("salesMetrics", result.data.rowLabels));
        } else {
          setTransposedSalesRowMapping({});
          setColumnMapping((prev) => ({
            ...prev,
            salesMetricsMapping: autoMap("salesMetrics", result.data.headers) as Partial<SalesMetricsColumnMapping>,
          }));
        }
      }
    } finally {
      setSalesMetricsSheetLoading(false);
    }
  };

  const handleFinanceMetricsSheetChange = async (sheet: string) => {
    if (!financeMetricsFile) return;
    setFinanceMetricsSheetLoading(true);
    try {
      const result = await getExcelPreviewAction(financeMetricsFile.base64, sheet);
      if (result.success) {
        setFinanceMetricsPreview(result.data);
        const isTransposed = isTransposedMetricsFormat(result.data.headers);
        setTransposedTypes((prev) => {
          const next = new Set(prev);
          if (isTransposed) next.add("financeMetrics"); else next.delete("financeMetrics");
          return next;
        });
        if (isTransposed && result.data.rowLabels?.length) {
          setTransposedFinanceRowMapping(autoMapTransposedRows("financeMetrics", result.data.rowLabels));
        } else {
          setTransposedFinanceRowMapping({});
          setColumnMapping((prev) => ({
            ...prev,
            financeMetricsMapping: autoMap("financeMetrics", result.data.headers) as Partial<FinanceMetricsColumnMapping>,
          }));
        }
      }
    } finally {
      setFinanceMetricsSheetLoading(false);
    }
  };

  const handleImport = async () => {
    setImporting(true);
    const result: ImportSummary = {};
    try {
      // ── Clientes ──
      if (what.has("clients")) {
        if (origin === "ghl") {
          const r = await importGHLContactsAction();
          if (!r.success) throw new Error(r.error);
          result.clientsResult = {
            inserted: r.data.inserted,
            skipped:  r.data.skippedExisting,
            errors:   [],
            source:   "ghl",
          };
        } else if (clientsFile) {
          const r = await importClientsFromExcelAction(
            clientsFile.base64,
            columnMapping.clientsMapping as ColumnMapping | undefined
          );
          if (!r.success) throw new Error(r.error);
          result.clientsResult = { ...r.data, source: "excel" };
        }
      }

      // ── Llamadas de cierre ──
      if (what.has("closing") && origin === "excel" && closingFile) {
        const r = await importClosingCallsFromExcelAction(
          closingFile.base64,
          columnMapping.closingMapping as ClosingColumnMapping | undefined
        );
        if (!r.success) throw new Error(r.error);
        result.closingResult = r.data;
      }

      // ── Métricas de ventas ──
      if (what.has("salesMetrics") && origin === "excel" && salesMetricsFile) {
        if (transposedTypes.has("salesMetrics")) {
          // Formato pivot: métricas como filas, meses como columnas — mapeo manual del usuario
          const r = await importSalesMetricsTransposedAction(
            salesMetricsFile.base64,
            transposedSalesRowMapping,
            salesMetricsPreview?.activeSheet
          );
          if (!r.success) throw new Error(r.error);
          result.salesMetricsResult = r.data;
        } else if (columnMapping.salesMetricsMapping?.period) {
          // Formato estándar: un período por fila, mapeo de columnas manual
          const r = await importSalesMetricsFromExcelAction(
            salesMetricsFile.base64,
            columnMapping.salesMetricsMapping as SalesMetricsColumnMapping,
            salesMetricsPreview?.activeSheet
          );
          if (!r.success) throw new Error(r.error);
          result.salesMetricsResult = r.data;
        }
      }

      // ── Métricas de finanzas ──
      if (what.has("financeMetrics") && origin === "excel" && financeMetricsFile) {
        if (transposedTypes.has("financeMetrics")) {
          // Formato pivot: métricas como filas, meses como columnas — mapeo manual del usuario
          const r = await importFinanceMetricsTransposedAction(
            financeMetricsFile.base64,
            transposedFinanceRowMapping,
            financeMetricsPreview?.activeSheet
          );
          if (!r.success) throw new Error(r.error);
          result.financeMetricsResult = r.data;
        } else if (columnMapping.financeMetricsMapping?.period) {
          // Formato estándar: un período por fila, mapeo de columnas manual
          const r = await importFinanceMetricsFromExcelAction(
            financeMetricsFile.base64,
            columnMapping.financeMetricsMapping as FinanceMetricsColumnMapping,
            financeMetricsPreview?.activeSheet
          );
          if (!r.success) throw new Error(r.error);
          result.financeMetricsResult = r.data;
        }
      }

      setSummary(result);
      const totalImported =
        (result.clientsResult?.inserted ?? 0) +
        (result.closingResult?.inserted ?? 0) +
        (result.salesMetricsResult?.inserted ?? 0) +
        (result.financeMetricsResult?.inserted ?? 0);
      push({
        title: "Importación completada",
        description: `${totalImported} registros importados`,
        variant: "success",
      });

      // Refresh para que el sidebar y el módulo de clientes actualicen contadores
      setTimeout(() => router.refresh(), 500);
    } catch (e) {
      push({
        title: "Error al importar",
        description: e instanceof Error ? e.message : "Error inesperado",
      });
    } finally {
      setImporting(false);
    }
  };

  // ── Stepper labels ──
  const steps: { key: Step; label: string }[] = [
    { key: "origin", label: "Origen" },
    { key: "what",   label: "Qué importar" },
    ...(origin === "excel" ? [{ key: "mapper" as Step, label: "Mapeo" }] : []),
    { key: "confirm", label: "Confirmar" },
  ];

  const stepIndex = steps.findIndex((s) => s.key === step);

  const handleBack = () => {
    if (step === "confirm") setStep(origin === "excel" ? "mapper" : "what");
    else if (step === "mapper") setStep("what");
    else setStep("origin");
  };

  const handleNext = () => {
    if (step === "origin") setStep("what");
    else if (step === "what") void handleAdvanceFromWhat();
    else if (step === "mapper") setStep("confirm");
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Stepper */}
      <div className="flex items-center gap-2">
        {steps.map((s, i) => (
          <div key={s.key} className="flex items-center gap-2">
            <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-semibold transition-colors
              ${i < stepIndex ? "bg-primary text-primary-foreground" :
                i === stepIndex ? "bg-primary text-primary-foreground" :
                "bg-muted text-muted-foreground"}`}
            >
              {i < stepIndex ? <CheckCircle className="h-3.5 w-3.5" /> : i + 1}
            </div>
            <span className={`text-xs hidden sm:block ${i === stepIndex ? "font-medium" : "text-muted-foreground"}`}>
              {s.label}
            </span>
            {i < steps.length - 1 && <ChevronRight className="h-3 w-3 text-muted-foreground" />}
          </div>
        ))}
      </div>

      {/* Contenido */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-5">
        {step === "origin" && (
          <StepOrigin
            ghlConnected={ghlConnected}
            selected={origin}
            onSelect={handleOriginSelect}
          />
        )}
        {step === "what" && (
          <StepWhat
            origin={origin}
            what={what}
            onWhat={toggleWhat}
            ghlPreview={ghlPreview}
            ghlPreviewLoading={ghlPreviewLoading}
            clientsFile={clientsFile}
            closingFile={closingFile}
            salesMetricsFile={salesMetricsFile}
            financeMetricsFile={financeMetricsFile}
            onClientsFile={setClientsFile}
            onClosingFile={setClosingFile}
            onSalesMetricsFile={setSalesMetricsFile}
            onFinanceMetricsFile={setFinanceMetricsFile}
          />
        )}
        {step === "mapper" && (
          <StepMapper
            clientsPreview={clientsPreview}
            closingPreview={closingPreview}
            salesMetricsPreview={salesMetricsPreview}
            financeMetricsPreview={financeMetricsPreview}
            clientsFile={clientsFile}
            closingFile={closingFile}
            salesMetricsFile={salesMetricsFile}
            financeMetricsFile={financeMetricsFile}
            mapping={columnMapping}
            onMapping={setColumnMapping}
            loading={mapperLoading}
            transposedTypes={transposedTypes}
            transposedSalesRowMapping={transposedSalesRowMapping}
            transposedFinanceRowMapping={transposedFinanceRowMapping}
            onTransposedSalesRowMappingChange={setTransposedSalesRowMapping}
            onTransposedFinanceRowMappingChange={setTransposedFinanceRowMapping}
            onClientsSheetChange={handleClientsSheetChange}
            onClosingSheetChange={handleClosingSheetChange}
            onSalesMetricsSheetChange={handleSalesMetricsSheetChange}
            onFinanceMetricsSheetChange={handleFinanceMetricsSheetChange}
            clientsSheetLoading={clientsSheetLoading}
            closingSheetLoading={closingSheetLoading}
            salesMetricsSheetLoading={salesMetricsSheetLoading}
            financeMetricsSheetLoading={financeMetricsSheetLoading}
          />
        )}
        {step === "confirm" && (
          <StepConfirm
            origin={origin}
            what={what}
            ghlPreview={ghlPreview}
            clientsFile={clientsFile}
            closingFile={closingFile}
            salesMetricsFile={salesMetricsFile}
            financeMetricsFile={financeMetricsFile}
            importing={importing}
            summary={summary}
            onImport={handleImport}
          />
        )}

        {/* Navegación */}
        {!summary && (
          <div className="flex justify-between pt-2">
            {step !== "origin" ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleBack}
              >
                <ChevronLeft className="h-4 w-4 mr-1" /> Atrás
              </Button>
            ) : <div />}

            {step !== "confirm" && (
              <Button
                type="button"
                size="sm"
                disabled={
                  (step === "origin" && !canAdvanceFromOrigin) ||
                  (step === "what"   && !canAdvanceFromWhat) ||
                  (step === "mapper" && (!canAdvanceFromMapper || mapperLoading))
                }
                onClick={handleNext}
              >
                Siguiente <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Auto-mapeo por nombre de columna ─────────────────────────────────────────

const CLIENT_KNOWN: Record<string, string> = {
  nombre: "name", name: "name",
  email: "email", correo: "email",
  teléfono: "phone", telefono: "phone", phone: "phone", tel: "phone",
  estado: "status", status: "status",
  "producto / plan": "product", producto: "product", plan: "product",
  "monto total": "totalAmount", monto: "totalAmount", importe: "totalAmount",
  "fecha inicio": "joinDate", "fecha de inicio": "joinDate",
  notas: "notes", notes: "notes",
};

const CLOSING_KNOWN: Record<string, string> = {
  "nombre prospecto": "leadName", prospecto: "leadName", lead: "leadName", nombre: "leadName",
  "fecha y hora": "scheduledAt", fecha: "scheduledAt", date: "scheduledAt",
  email: "email", correo: "email",
  estado: "status", status: "status",
  "monto cerrado": "amountClosed", monto: "amountClosed",
  notas: "notes", "notas / resultado": "notes", notes: "notes",
};

const SALES_METRICS_KNOWN: Record<string, string> = {
  "período": "period", periodo: "period", semana: "period", week: "period", fecha: "period", date: "period",
  "leads totales": "leadsTotales", leads: "leadsTotales",
  "agendas totales": "agendasTotales", agendas: "agendasTotales",
  asistencias: "asistencias", asistencia: "asistencias",
  inasistencias: "inasistencias", inasistencia: "inasistencias",
  cierres: "cierres", cierre: "cierres",
  "no cierres": "noCierres", "no cierre": "noCierres",
  señas: "señas", seña: "señas",
  facturación: "facturacion", facturacion: "facturacion", facturado: "facturacion",
  "cash collected": "cashCollected", cobrado: "cashCollected",
  "close rate": "closeRate", "tasa de cierre": "closeRate",
  "show rate": "showRate", "tasa de show": "showRate",
  "tasa de agendamiento": "tasaAgendamiento", "tasa agendamiento": "tasaAgendamiento",
  "tasa de fantasma": "tasaFantasma", "tasa fantasma": "tasaFantasma",
  "en nutrición": "enNutricion", "en nutricion": "enNutricion", nutricion: "enNutricion",
  perdidos: "perdidos",
  seguimientos: "seguimientos",
  "tiempo de respuesta": "tiempoRespuesta", "tiempo respuesta": "tiempoRespuesta",
};

const FINANCE_METRICS_KNOWN: Record<string, string> = {
  "período": "period", periodo: "period", mes: "period", month: "period", fecha: "period", date: "period",
  facturación: "facturacion", facturacion: "facturacion", facturado: "facturacion",
  "cash collected": "cashCollected", cobrado: "cashCollected",
  margen: "margen", margin: "margen",
  "por cobrar": "porCobrar", "cuentas por cobrar": "porCobrar",
  gastos: "gastos", expenses: "gastos",
};

function autoMap(
  type: "clients" | "closing" | "salesMetrics" | "financeMetrics",
  headers: string[]
): Record<string, string> {
  const known =
    type === "clients"        ? CLIENT_KNOWN :
    type === "closing"        ? CLOSING_KNOWN :
    type === "salesMetrics"   ? SALES_METRICS_KNOWN :
    FINANCE_METRICS_KNOWN;
  const result: Record<string, string> = {};
  for (const h of headers) {
    const norm = h.toLowerCase().trim();
    const field = known[norm];
    if (field && !result[field]) {
      result[field] = h;
    }
  }
  return result;
}

// ─── Campos para el mapper de filas transpuestas ──────────────────────────────

type RowField = { key: string; label: string };

// Solo métricas primarias — las derivadas se calculan automáticamente:
// inasistencias = agendas − asistencias
// no_cierres    = asistencias − cierres
// close_rate    = cierres / asistencias
// show_rate     = asistencias / agendas
// tasa_agendamiento = agendas / leads
// tasa_fantasma = inasistencias / agendas
const SALES_ROW_FIELDS: RowField[] = [
  { key: "leadsTotales",    label: "Leads totales" },
  { key: "agendasTotales",  label: "Agendas totales" },
  { key: "asistencias",     label: "Asistencias / shows" },
  { key: "cierres",         label: "Cierres" },
  { key: "señas",           label: "Señas" },
  { key: "facturacion",     label: "Facturación" },
  { key: "cashCollected",   label: "Cash collected" },
  { key: "enNutricion",     label: "En nutrición" },
  { key: "perdidos",        label: "Perdidos" },
  { key: "seguimientos",    label: "Seguimientos" },
  { key: "tiempoRespuesta", label: "Tiempo de respuesta" },
];

// Solo métricas primarias — las derivadas se calculan automáticamente:
// margen     = facturacion − gastos
// pct_margen = margen / facturacion
const FINANCE_ROW_FIELDS: RowField[] = [
  { key: "facturacion",   label: "Facturación" },
  { key: "cashCollected", label: "Cash collected" },
  { key: "gastos",        label: "Gastos" },
  { key: "porCobrar",     label: "Por cobrar" },
];

/**
 * A partir de las etiquetas de fila del archivo, sugiere un mapeo automático
 * usando el diccionario de sinónimos. El usuario puede editarlo luego.
 * Excluye el campo "period" (en formato pivotado, los períodos son las columnas).
 */
function autoMapTransposedRows(
  type: "salesMetrics" | "financeMetrics",
  rowLabels: string[]
): Record<string, string> {
  const known = type === "salesMetrics" ? SALES_METRICS_KNOWN : FINANCE_METRICS_KNOWN;
  const result: Record<string, string> = {};
  for (const label of rowLabels) {
    const norm = label.toLowerCase().trim();
    const fieldKey = known[norm];
    if (fieldKey && fieldKey !== "period" && !result[fieldKey]) {
      result[fieldKey] = label;
    }
  }
  return result;
}
