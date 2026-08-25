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
  getExcelPreviewAction,
  type ExcelImportResult,
  type ExcelPreview,
} from "@/app/clients/import-actions";
import type { ColumnMapping } from "@/lib/clients/excel-parser";
import type { ClosingColumnMapping } from "@/lib/closing/excel-parser";
import {
  ExcelColumnMapper,
  isMappingValid,
  type ExcelColumnMapperValue,
} from "@/components/integrations/excel-column-mapper";
import { Upload, Database, FileSpreadsheet, CheckCircle, Loader2, ChevronRight, ChevronLeft, Users, Phone } from "lucide-react";
import { paths } from "@/routes";

// ─── Tipos ────────────────────────────────────────────────────────────────────

type Origin = "ghl" | "excel" | null;
type WhatToImport = "clients" | "closing" | "both";
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
  clientsResult?: ExcelImportResult & { source: "ghl" | "excel" };
  closingResult?: ExcelImportResult;
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

function StepWhat({
  origin,
  what,
  onWhat,
  ghlPreview,
  ghlPreviewLoading,
  clientsFile,
  closingFile,
  onClientsFile,
  onClosingFile,
}: {
  origin: Origin;
  what: Set<WhatToImport>;
  onWhat: (w: WhatToImport) => void;
  ghlPreview: GHLPreview | null;
  ghlPreviewLoading: boolean;
  clientsFile: ExcelFile | null;
  closingFile: ExcelFile | null;
  onClientsFile: (f: ExcelFile | null) => void;
  onClosingFile: (f: ExcelFile | null) => void;
}) {
  const clientsRef = useRef<HTMLInputElement>(null);
  const closingRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File, type: "clients" | "closing") => {
      const b64 = await fileToBase64(file);
      const ef: ExcelFile = { name: file.name, base64: b64 };
      if (type === "clients") onClientsFile(ef);
      else onClosingFile(ef);
    },
    [onClientsFile, onClosingFile]
  );

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">¿Qué querés importar?</p>

      {/* Clientes */}
      <div className={`rounded-lg border p-4 space-y-3 ${what.has("clients") ? "border-primary bg-primary/5" : "border-border"}`}>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onWhat("clients")}
            className={`h-4 w-4 rounded border-2 flex-shrink-0 transition-colors ${what.has("clients") ? "bg-primary border-primary" : "border-muted-foreground"}`}
          />
          <Users className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <span className="text-sm font-medium">Clientes activos y anteriores</span>
        </div>

        {what.has("clients") && (
          <div className="ml-7 space-y-2">
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
                    {ghlPreview.total > 10 && (
                      <p className="text-xs text-muted-foreground italic">… y {ghlPreview.total - 10} más</p>
                    )}
                  </div>
                </div>
              ) : null
            )}

            {origin === "excel" && (
              <div>
                <input
                  ref={clientsRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) void handleFile(f, "clients");
                  }}
                />
                {clientsFile ? (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-xs truncate">{clientsFile.name}</span>
                    <button
                      type="button"
                      onClick={() => onClientsFile(null)}
                      className="text-xs text-muted-foreground hover:text-destructive"
                    >
                      Quitar
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => clientsRef.current?.click()}
                    className="flex items-center gap-1.5 text-xs text-primary hover:underline"
                  >
                    <Upload className="h-3 w-3" /> Subir archivo de clientes (.xlsx)
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Llamadas */}
      {origin === "excel" && (
        <div className={`rounded-lg border p-4 space-y-3 ${what.has("closing") ? "border-primary bg-primary/5" : "border-border"}`}>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onWhat("closing")}
              className={`h-4 w-4 rounded border-2 flex-shrink-0 transition-colors ${what.has("closing") ? "bg-primary border-primary" : "border-muted-foreground"}`}
            />
            <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="text-sm font-medium">Llamadas de cierre / citas</span>
          </div>

          {what.has("closing") && (
            <div className="ml-7">
              <input
                ref={closingRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void handleFile(f, "closing");
                }}
              />
              {closingFile ? (
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-xs truncate">{closingFile.name}</span>
                  <button
                    type="button"
                    onClick={() => onClosingFile(null)}
                    className="text-xs text-muted-foreground hover:text-destructive"
                  >
                    Quitar
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => closingRef.current?.click()}
                  className="flex items-center gap-1.5 text-xs text-primary hover:underline"
                >
                  <Upload className="h-3 w-3" /> Subir archivo de llamadas (.xlsx)
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* GHL solo importa clientes (appointments ya están via sync) */}
      {origin === "ghl" && (
        <p className="text-xs text-muted-foreground">
          Las citas de GHL se sincronizan automáticamente desde la integración de calendario.
        </p>
      )}
    </div>
  );
}

// ─── Paso 2.5 — Mapeo de columnas ─────────────────────────────────────────────

function StepMapper({
  clientsPreview,
  closingPreview,
  mapping,
  onMapping,
  loading,
}: {
  clientsPreview: ExcelPreview | null;
  closingPreview: ExcelPreview | null;
  mapping: ExcelColumnMapperValue;
  onMapping: (v: ExcelColumnMapperValue) => void;
  loading: boolean;
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
    <div className="space-y-3">
      <div>
        <p className="text-sm font-medium">Mapeo de columnas</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          Indicá qué columna de tu archivo corresponde a cada campo de OTC. Los campos marcados con <span className="text-destructive">*</span> son obligatorios.
        </p>
      </div>
      <ExcelColumnMapper
        clientsHeaders={clientsPreview?.headers}
        clientsPreviewRows={clientsPreview?.rows}
        closingHeaders={closingPreview?.headers}
        closingPreviewRows={closingPreview?.rows}
        value={mapping}
        onChange={onMapping}
      />
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
  importing,
  summary,
  onImport,
}: {
  origin: Origin;
  what: Set<WhatToImport>;
  ghlPreview: GHLPreview | null;
  clientsFile: ExcelFile | null;
  closingFile: ExcelFile | null;
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
          <ResultRow
            label="Clientes"
            inserted={summary.clientsResult.inserted}
            skipped={summary.clientsResult.skipped}
            errors={summary.clientsResult.errors.length}
          />
        )}
        {summary.closingResult && (
          <ResultRow
            label="Llamadas de cierre"
            inserted={summary.closingResult.inserted}
            skipped={summary.closingResult.skipped}
            errors={summary.closingResult.errors.length}
          />
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
      </div>
      <p className="text-xs text-muted-foreground">
        Los registros existentes no se sobreescribirán.
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
  const [importing, setImporting] = useState(false);
  const [summary, setSummary] = useState<ImportSummary | null>(null);

  // ── Mapper state ──
  const [clientsPreview, setClientsPreview] = useState<ExcelPreview | null>(null);
  const [closingPreview, setClosingPreview] = useState<ExcelPreview | null>(null);
  const [columnMapping, setColumnMapping] = useState<ExcelColumnMapperValue>({});
  const [mapperLoading, setMapperLoading] = useState(false);

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
      // Cargar previews de archivos para el mapper
      setMapperLoading(true);
      setStep("mapper");
      try {
        const [cp, lp] = await Promise.all([
          clientsFile && what.has("clients")
            ? getExcelPreviewAction(clientsFile.base64)
            : Promise.resolve(null),
          closingFile && what.has("closing")
            ? getExcelPreviewAction(closingFile.base64)
            : Promise.resolve(null),
        ]);
        setClientsPreview(cp?.success ? cp.data : null);
        setClosingPreview(lp?.success ? lp.data : null);
        // Auto-mapeo: si el header coincide exactamente con nombres OTC, pre-seleccionar
        setColumnMapping({
          clientsMapping: cp?.success ? autoMap("clients", cp.data.headers) : undefined,
          closingMapping: lp?.success ? autoMap("closing", lp.data.headers) : undefined,
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
      : (what.has("clients") ? !!clientsFile : true) &&
        (what.has("closing") ? !!closingFile : true)
  );

  const canAdvanceFromMapper = (
    (!clientsPreview || isMappingValid("clients", columnMapping.clientsMapping)) &&
    (!closingPreview || isMappingValid("closing", columnMapping.closingMapping))
  );

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

      setSummary(result);
      push({
        title: "Importación completada",
        description: `${result.clientsResult?.inserted ?? 0} clientes · ${result.closingResult?.inserted ?? 0} llamadas importadas`,
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
            onClientsFile={setClientsFile}
            onClosingFile={setClosingFile}
          />
        )}
        {step === "mapper" && (
          <StepMapper
            clientsPreview={clientsPreview}
            closingPreview={closingPreview}
            mapping={columnMapping}
            onMapping={setColumnMapping}
            loading={mapperLoading}
          />
        )}
        {step === "confirm" && (
          <StepConfirm
            origin={origin}
            what={what}
            ghlPreview={ghlPreview}
            clientsFile={clientsFile}
            closingFile={closingFile}
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

function autoMap(
  type: "clients" | "closing",
  headers: string[]
): Partial<ColumnMapping> | Partial<ClosingColumnMapping> {
  const known = type === "clients" ? CLIENT_KNOWN : CLOSING_KNOWN;
  const result: Record<string, string> = {};
  for (const h of headers) {
    const norm = h.toLowerCase().trim();
    const field = known[norm];
    if (field && !result[field]) {
      result[field] = h;
    }
  }
  // El cast es seguro: las claves en result son siempre fields válidos del ColumnMapping
  return result as Partial<ColumnMapping> | Partial<ClosingColumnMapping>;
}
