"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
} from "@ai-coo/ui";
import { useToast } from "@/providers/toast-provider";
import { previewGHLContactsAction, importGHLContactsAction } from "@/app/ghl/import-actions";
import {
  importClientsFromExcelAction,
  importSalesMetricsManualAction,
  getExcelPreviewAction,
  type ExcelImportResult,
  type ExcelPreview,
  type ManualSalesMetricInput,
} from "@/app/clients/import-actions";
import type { ColumnMapping } from "@/lib/clients/excel-parser";
import {
  ExcelColumnMapper,
  isMappingValid,
  type ExcelColumnMapperValue,
} from "@/components/integrations/excel-column-mapper";
import {
  Upload,
  Database,
  FileSpreadsheet,
  CheckCircle,
  Loader2,
  ChevronRight,
  ChevronLeft,
  Users,
  TrendingUp,
  Plus,
  Trash2,
  Calendar,
} from "lucide-react";

// ─── Tipos ────────────────────────────────────────────────────────────────────

type Origin = "ghl" | "excel" | null;
type WhatToImport = "clients" | "salesMetrics";
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
  salesMetricsResult?: ExcelImportResult;
};

// Fila del formulario manual de métricas de ventas
type ManualSalesRow = {
  id:            string;
  period:        string; // YYYY-MM (formato de <input type="month">)
  leadsTotales:  string;
  agendasTotales: string;
  asistencias:   string;
  cierres:       string;
  facturacion:   string;
};

function newRow(period?: string): ManualSalesRow {
  return {
    id:             Math.random().toString(36).slice(2),
    period:         period ?? "",
    leadsTotales:   "",
    agendasTotales: "",
    asistencias:    "",
    cierres:        "",
    facturacion:    "",
  };
}

function parseNum(s: string): number | undefined {
  if (!s.trim()) return undefined;
  const n = parseFloat(s.replace(",", "."));
  return isNaN(n) ? undefined : n;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const b64 = result.split(",")[1];
      resolve(b64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Calcula el período por defecto: mes anterior
function defaultPeriod(): string {
  const d = new Date();
  d.setMonth(d.getMonth() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
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

// ─── Sub-componente: fila de archivo por tipo ─────────────────────────────────

function FileRow({
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

// ─── Formulario manual de métricas de ventas — cards por mes ──────────────────

const SALES_FIELD_LABELS: Array<{
  key: keyof Omit<ManualSalesRow, "id" | "period">;
  label: string;
  prefix?: string;
}> = [
  { key: "leadsTotales",   label: "Leads totales"   },
  { key: "agendasTotales", label: "Agendas totales" },
  { key: "asistencias",    label: "Show up"         },
  { key: "cierres",        label: "Cierres"         },
  { key: "facturacion",    label: "Facturación", prefix: "$" },
];

function MonthCard({
  row,
  canRemove,
  onUpdate,
  onRemove,
}: {
  row: ManualSalesRow;
  canRemove: boolean;
  onUpdate: (field: keyof ManualSalesRow, value: string) => void;
  onRemove: () => void;
}) {
  const inputCls =
    "w-full h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring";

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-4">
      {/* Cabecera: selector de mes + botón eliminar */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1">
          <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
          <input
            type="month"
            value={row.period}
            onChange={e => onUpdate("period", e.target.value)}
            className="h-9 flex-1 rounded-md border border-input bg-background px-3 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="h-9 w-9 flex items-center justify-center rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            title="Eliminar mes"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Grid de métricas 3×2 */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {SALES_FIELD_LABELS.map(f => (
          <div key={f.key} className="space-y-1.5">
            <label className="block text-xs font-medium text-muted-foreground">
              {f.label}
            </label>
            <div className="relative">
              {f.prefix && (
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
                  {f.prefix}
                </span>
              )}
              <input
                type="text"
                inputMode="decimal"
                placeholder="—"
                value={row[f.key]}
                onChange={e => onUpdate(f.key, e.target.value)}
                className={`${inputCls}${f.prefix ? " pl-6" : ""}`}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ManualSalesForm({
  rows,
  onChange,
}: {
  rows: ManualSalesRow[];
  onChange: (rows: ManualSalesRow[]) => void;
}) {
  const updateRow = (id: string, field: keyof ManualSalesRow, value: string) => {
    onChange(rows.map(r => r.id === id ? { ...r, [field]: value } : r));
  };
  const removeRow = (id: string) => {
    if (rows.length === 1) return;
    onChange(rows.filter(r => r.id !== id));
  };
  const addRow = () => {
    const last = rows[rows.length - 1]?.period;
    let nextPeriod = "";
    if (last && /^\d{4}-\d{2}$/.test(last)) {
      const [y, m] = last.split("-").map(Number) as [number, number];
      const next = m === 12 ? { y: y + 1, m: 1 } : { y, m: m + 1 };
      nextPeriod = `${next.y}-${String(next.m).padStart(2, "0")}`;
    }
    onChange([...rows, newRow(nextPeriod)]);
  };

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        OTC calcula automáticamente close rate, show rate y más a partir de estos datos. Podés cargar varios meses a la vez.
      </p>

      <div className="space-y-3 max-h-[480px] overflow-y-auto pr-0.5">
        {rows.map(row => (
          <MonthCard
            key={row.id}
            row={row}
            canRemove={rows.length > 1}
            onUpdate={(field, value) => updateRow(row.id, field, value)}
            onRemove={() => removeRow(row.id)}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={addRow}
        className="flex items-center gap-2 text-sm text-primary hover:underline"
      >
        <Plus className="h-4 w-4" /> Agregar mes
      </button>
    </div>
  );
}

// ─── Paso 2 — Qué importar ────────────────────────────────────────────────────

function StepWhat({
  origin,
  what,
  onWhat,
  ghlPreview,
  ghlPreviewLoading,
  clientsFile,
  onClientsFile,
}: {
  origin: Origin;
  what: Set<WhatToImport>;
  onWhat: (w: WhatToImport) => void;
  ghlPreview: GHLPreview | null;
  ghlPreviewLoading: boolean;
  clientsFile: ExcelFile | null;
  onClientsFile: (f: ExcelFile | null) => void;
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

      {/* Métricas de ventas */}
      <CheckboxCard
        checked={what.has("salesMetrics")}
        onToggle={() => onWhat("salesMetrics")}
        icon={<TrendingUp className="h-4 w-4" />}
        title="Métricas de ventas"
      >
        <p className="text-xs text-muted-foreground">
          Cargás los datos mes a mes en el siguiente paso.
        </p>
      </CheckboxCard>
    </div>
  );
}

// ─── Paso 2.5 — Mapeo de columnas (solo para archivo de clientes) ─────────────

function StepMapper({
  clientsPreview,
  clientsFile,
  mapping,
  onMapping,
  loading,
  clientsSheetLoading,
  onClientsSheetChange,
}: {
  clientsPreview: ExcelPreview | null;
  clientsFile: ExcelFile | null;
  mapping: ExcelColumnMapperValue;
  onMapping: (v: ExcelColumnMapperValue) => void;
  loading: boolean;
  clientsSheetLoading: boolean;
  onClientsSheetChange: (sheet: string) => void;
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-10 gap-2 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm">Leyendo columnas del archivo…</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-medium">Mapeo de columnas — Clientes</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          Indicá qué columna de tu archivo corresponde a cada campo de OTC. Los campos marcados con <span className="text-destructive">*</span> son obligatorios.
        </p>
      </div>

      {clientsPreview && clientsFile && clientsPreview.allSheets.length > 1 && (
        <div className="flex items-center gap-2 rounded-md bg-muted/50 px-3 py-2">
          <span className="text-xs text-muted-foreground shrink-0">Hoja (clientes):</span>
          <select
            value={clientsPreview.activeSheet}
            disabled={clientsSheetLoading}
            onChange={(e) => onClientsSheetChange(e.target.value)}
            className="flex-1 h-7 rounded border border-input bg-background px-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          >
            {clientsPreview.allSheets.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          {clientsSheetLoading && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground shrink-0" />}
        </div>
      )}

      {clientsPreview?.headers.length === 0 && (
        <p className="text-xs text-amber-600 bg-amber-50 dark:bg-amber-950/30 rounded px-3 py-2">
          La hoja seleccionada no tiene columnas reconocibles. Elegí otra hoja en el selector de arriba.
        </p>
      )}

      {clientsPreview?.headers.length ? (
        <ExcelColumnMapper
          clientsHeaders={clientsPreview.headers}
          clientsPreviewRows={clientsPreview.rows}
          value={mapping}
          onChange={onMapping}
        />
      ) : null}
    </div>
  );
}

// ─── Paso 3 — Confirmación ────────────────────────────────────────────────────

function StepConfirm({
  origin,
  what,
  ghlPreview,
  clientsFile,
  manualSalesRows,
  onManualSalesRowsChange,
  importing,
  summary,
  onImport,
}: {
  origin: Origin;
  what: Set<WhatToImport>;
  ghlPreview: GHLPreview | null;
  clientsFile: ExcelFile | null;
  manualSalesRows: ManualSalesRow[];
  onManualSalesRowsChange: (rows: ManualSalesRow[]) => void;
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
        {summary.salesMetricsResult && (
          <ResultRow label="Métricas de ventas" inserted={summary.salesMetricsResult.inserted} skipped={summary.salesMetricsResult.skipped} errors={summary.salesMetricsResult.errors.length} />
        )}
      </div>
    );
  }

  const salesRowsWithPeriod = manualSalesRows.filter(r => r.period);
  const canImport =
    !what.has("salesMetrics") || salesRowsWithPeriod.length > 0;

  return (
    <div className="space-y-5">

      {/* Resumen de clientes */}
      {what.has("clients") && (
        <div className="rounded-lg border border-border px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Clientes</span>
          </div>
          <span className="text-xs text-muted-foreground">
            {origin === "ghl" && ghlPreview
              ? `${ghlPreview.total} contactos de GHL`
              : clientsFile
                ? clientsFile.name
                : "Sin archivo"}
          </span>
        </div>
      )}

      {/* Formulario de métricas de ventas */}
      {what.has("salesMetrics") && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm font-medium">Métricas de ventas</p>
          </div>
          <ManualSalesForm
            rows={manualSalesRows}
            onChange={onManualSalesRowsChange}
          />
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Clientes: si ya existen, no se sobreescriben. Métricas: si ya existe un registro para el mismo período, se actualiza con los nuevos valores.
      </p>

      <Button
        type="button"
        onClick={onImport}
        disabled={importing || !canImport}
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

// ─── Auto-mapeo de columnas ───────────────────────────────────────────────────

const CLIENT_KNOWN: Record<string, string> = {
  nombre: "name", "nombre completo": "name", name: "name",
  email: "email", correo: "email",
  teléfono: "phone", telefono: "phone", phone: "phone", tel: "phone",
  "producto / plan": "product", producto: "product", plan: "product",
  "monto total": "totalAmount", "monto pagado": "totalAmount", "cash collected": "totalAmount",
  monto: "totalAmount", importe: "totalAmount",
  "fecha inicio": "joinDate", "fecha de inicio": "joinDate",
};

function autoMapClients(headers: string[]): Record<string, string> {
  const result: Record<string, string> = {};
  for (const h of headers) {
    const norm = h.toLowerCase().trim();
    const field = CLIENT_KNOWN[norm];
    if (field && !result[field]) result[field] = h;
  }
  return result;
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
  const [manualSalesRows, setManualSalesRows] = useState<ManualSalesRow[]>([newRow(defaultPeriod())]);
  const [importing, setImporting] = useState(false);
  const [summary, setSummary] = useState<ImportSummary | null>(null);

  // ── Mapper state (solo para clientes) ──
  const [clientsPreview, setClientsPreview] = useState<ExcelPreview | null>(null);
  const [columnMapping, setColumnMapping] = useState<ExcelColumnMapperValue>({});
  const [mapperLoading, setMapperLoading] = useState(false);
  const [clientsSheetLoading, setClientsSheetLoading] = useState(false);

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

  // ¿El paso actual necesita un mapper de columnas?
  const needsMapper = origin === "excel" && what.has("clients") && !!clientsFile;

  const handleAdvanceFromWhat = async () => {
    if (needsMapper) {
      setMapperLoading(true);
      setStep("mapper");
      try {
        const result = clientsFile ? await getExcelPreviewAction(clientsFile.base64) : null;
        if (result?.success) {
          setClientsPreview(result.data);
          setColumnMapping({ clientsMapping: autoMapClients(result.data.headers) as Partial<ColumnMapping> });
        } else {
          setClientsPreview(null);
        }
      } finally {
        setMapperLoading(false);
      }
    } else {
      setStep("confirm");
    }
  };

  const canAdvanceFromOrigin = origin !== null;

  // El paso "Qué importar" solo necesita: algo seleccionado + archivo de clientes si es excel
  const canAdvanceFromWhat = what.size > 0 && (
    origin === "ghl"
      ? true
      : !what.has("clients") || !!clientsFile
  );

  const canAdvanceFromMapper = !clientsPreview || isMappingValid("clients", columnMapping.clientsMapping);

  const handleClientsSheetChange = async (sheet: string) => {
    if (!clientsFile) return;
    setClientsSheetLoading(true);
    try {
      const result = await getExcelPreviewAction(clientsFile.base64, sheet);
      if (result.success) {
        setClientsPreview(result.data);
        setColumnMapping((prev) => ({
          ...prev,
          clientsMapping: autoMapClients(result.data.headers) as Partial<ColumnMapping>,
        }));
      }
    } finally {
      setClientsSheetLoading(false);
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

      // ── Métricas de ventas (manual) ──
      if (what.has("salesMetrics")) {
        const rows: ManualSalesMetricInput[] = manualSalesRows
          .filter(r => r.period)
          .map(r => ({
            period:         r.period,
            leadsTotales:   parseNum(r.leadsTotales),
            agendasTotales: parseNum(r.agendasTotales),
            asistencias:    parseNum(r.asistencias),
            // inasistencias se calcula automáticamente: agendas - show up
            inasistencias:  (parseNum(r.agendasTotales) != null && parseNum(r.asistencias) != null)
              ? (parseNum(r.agendasTotales)! - parseNum(r.asistencias)!)
              : undefined,
            cierres:        parseNum(r.cierres),
            facturacion:    parseNum(r.facturacion),
          }));
        const r = await importSalesMetricsManualAction(rows);
        if (!r.success) throw new Error(r.error);
        result.salesMetricsResult = r.data;
      }

      setSummary(result);
      const totalImported =
        (result.clientsResult?.inserted ?? 0) +
        (result.salesMetricsResult?.inserted ?? 0);
      push({
        title: "Importación completada",
        description: `${totalImported} registros importados`,
        variant: "success",
      });

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
    { key: "origin",  label: "Origen" },
    { key: "what",    label: "Qué importar" },
    ...(needsMapper ? [{ key: "mapper" as Step, label: "Mapeo" }] : []),
    { key: "confirm", label: "Confirmar" },
  ];

  const stepIndex = steps.findIndex((s) => s.key === step);

  const handleBack = () => {
    if (step === "confirm") setStep(needsMapper ? "mapper" : "what");
    else if (step === "mapper") setStep("what");
    else setStep("origin");
  };

  const handleNext = () => {
    if (step === "origin") setStep("what");
    else if (step === "what") void handleAdvanceFromWhat();
    else if (step === "mapper") setStep("confirm");
  };

  const canAdvance =
    step === "origin"  ? canAdvanceFromOrigin  :
    step === "what"    ? canAdvanceFromWhat    :
    step === "mapper"  ? canAdvanceFromMapper  :
    false;

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Stepper */}
      <div className="flex items-center gap-2">
        {steps.map((s, i) => (
          <div key={s.key} className="flex items-center gap-2">
            <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-semibold transition-colors
              ${i <= stepIndex ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
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
            onClientsFile={setClientsFile}
          />
        )}
        {step === "mapper" && (
          <StepMapper
            clientsPreview={clientsPreview}
            clientsFile={clientsFile}
            mapping={columnMapping}
            onMapping={setColumnMapping}
            loading={mapperLoading}
            clientsSheetLoading={clientsSheetLoading}
            onClientsSheetChange={handleClientsSheetChange}
          />
        )}
        {step === "confirm" && (
          <StepConfirm
            origin={origin}
            what={what}
            ghlPreview={ghlPreview}
            clientsFile={clientsFile}
            manualSalesRows={manualSalesRows}
            onManualSalesRowsChange={setManualSalesRows}
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
                className="gap-1"
              >
                <ChevronLeft className="h-4 w-4" /> Atrás
              </Button>
            ) : <div />}
            {step !== "confirm" && (
              <Button
                type="button"
                size="sm"
                onClick={handleNext}
                disabled={!canAdvance}
                className="gap-1"
              >
                Siguiente <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
