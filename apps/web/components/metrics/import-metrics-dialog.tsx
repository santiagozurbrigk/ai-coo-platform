"use client";

import { useRef, useState } from "react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@ai-coo/ui";
import { AlertCircle, CheckCircle2, FileSpreadsheet, Upload } from "lucide-react";
import { importMetricSnapshotsAction } from "@/app/metrics/actions";
import { SNAPSHOT_LOCATIONS, type SnapshotLocation } from "@/lib/metrics/snapshot-locations";
import { extractRawRecords } from "@/lib/clients/parse-client-import";
import {
  detectPeriodColumn,
  getMetricColumns,
  parseMetricsImportRows,
  type MetricSnapshotInput,
} from "@/lib/metrics/parse-metrics-import";
import {
  mapColumnsToOtcMetrics,
  type ColumnMapping,
} from "@/lib/metrics/otc-metric-registry";
import { useToast } from "@/providers/toast-provider";

type Step = "idle" | "mapping" | "preview";

interface ImportMetricsDialogProps {
  /** Si se especifica, el selector de módulo se fija a este valor y no se muestra */
  defaultLocation?: SnapshotLocation;
  onImported?: () => void;
}

export function ImportMetricsDialog({ defaultLocation, onImported }: ImportMetricsDialogProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { push } = useToast();

  const [open, setOpen] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [step, setStep] = useState<Step>("idle");
  const [location, setLocation] = useState<SnapshotLocation>(defaultLocation ?? "dashboard");

  const [rawRecords, setRawRecords] = useState<Record<string, string>[]>([]);
  const [allHeaders, setAllHeaders] = useState<string[]>([]);
  const [periodColumn, setPeriodColumn] = useState<string>("");
  const [metricColumns, setMetricColumns] = useState<string[]>([]);

  // Mapeo automático columna → métrica OTC (para mostrar badges en el paso de mapping)
  const [columnMappings, setColumnMappings] = useState<Map<string, ColumnMapping>>(new Map());

  const [snapshots, setSnapshots] = useState<MetricSnapshotInput[]>([]);
  const [parseErrors, setParseErrors] = useState<{ row: number; message: string }[]>([]);
  const [saving, setSaving] = useState(false);

  const resetForm = () => {
    setStep("idle");
    setFileName(null);
    setLocation(defaultLocation ?? "dashboard");
    setRawRecords([]);
    setAllHeaders([]);
    setPeriodColumn("");
    setMetricColumns([]);
    setColumnMappings(new Map());
    setSnapshots([]);
    setParseErrors([]);
    setSaving(false);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);

    try {
      const result = await extractRawRecords(file);

      if ("error" in result) {
        push({ title: result.error, variant: "default" });
        return;
      }

      const { records, headers } = result;

      if (records.length === 0) {
        push({ title: "El archivo está vacío o no tiene datos", variant: "default" });
        return;
      }

      setRawRecords(records);
      setAllHeaders(headers);

      // Detectar columna de fecha automáticamente
      const detected = detectPeriodColumn(headers);
      const periodCol = detected ?? headers[0] ?? "";
      const metricCols = detected
        ? getMetricColumns(headers, detected)
        : headers.slice(1);

      setPeriodColumn(periodCol);
      setMetricColumns(metricCols);

      // Mapear automáticamente columnas → métricas OTC (solo para feedback visual)
      const mappings = mapColumnsToOtcMetrics(metricCols);
      setColumnMappings(new Map(mappings.map((m) => [m.column, m])));

      setStep("mapping");
    } catch (err) {
      push({
        title: "Error al leer el archivo",
        description: err instanceof Error ? err.message : undefined,
        variant: "default",
      });
    }
  };

  const handlePeriodColumnChange = (newPeriod: string) => {
    setPeriodColumn(newPeriod);
    const newMetricCols = getMetricColumns(allHeaders, newPeriod);
    setMetricColumns(newMetricCols);
    const mappings = mapColumnsToOtcMetrics(newMetricCols);
    setColumnMappings(new Map(mappings.map((m) => [m.column, m])));
  };

  const toggleMetricColumn = (col: string) => {
    setMetricColumns((prev) =>
      prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col]
    );
  };

  const handleContinue = () => {
    // Construir mapa columna → key OTC para las columnas reconocidas
    const columnToOtcKey = new Map<string, string>();
    for (const [col, mapping] of columnMappings) {
      if (mapping.otcKey) columnToOtcKey.set(col, mapping.otcKey);
    }
    const result = parseMetricsImportRows(rawRecords, periodColumn, metricColumns, columnToOtcKey);
    setSnapshots(result.snapshots);
    setParseErrors(result.errors);
    setStep("preview");
  };

  const handleImport = async () => {
    if (snapshots.length === 0) return;
    setSaving(true);
    try {
      const result = await importMetricSnapshotsAction(snapshots, location);
      push({
        title: `${result.upsertedCount} valores importados correctamente`,
        variant: "success",
      });
      onImported?.();
      setOpen(false);
      resetForm();
    } catch (err) {
      push({
        title: "Error al importar",
        description: err instanceof Error ? err.message : undefined,
        variant: "default",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => { resetForm(); setOpen(true); }}
        className="flex items-center gap-1.5 rounded-lg border border-border/60 bg-muted/30 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
      >
        <FileSpreadsheet className="h-3.5 w-3.5" />
        Importar Excel
      </button>

      <Dialog open={open} onOpenChange={(v: boolean) => { if (!v) resetForm(); setOpen(v); }}>
        <DialogContent className="max-w-lg">
          {/* ── Paso 1: Idle — cargar archivo ── */}
          {step === "idle" && (
            <>
              <DialogHeader>
                <DialogTitle>Importar métricas desde Excel / CSV</DialogTitle>
                <DialogDescription>
                  Cargá un archivo con tus métricas históricas. El sistema detecta automáticamente la
                  columna de fecha y toma el resto como métricas numéricas.
                </DialogDescription>
              </DialogHeader>

              {/* Selector de módulo */}
              {!defaultLocation && (
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    ¿A qué sección pertenecen estas métricas?
                  </label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {SNAPSHOT_LOCATIONS.map((loc) => (
                      <button
                        key={loc.value}
                        type="button"
                        onClick={() => setLocation(loc.value)}
                        className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                          location === loc.value
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        }`}
                      >
                        {loc.label}
                      </button>
                    ))}
                  </div>
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    Las métricas aparecerán en esa sección y en el Panel General.
                  </p>
                </div>
              )}

              {/* Formato esperado */}
              <div className="rounded-lg border border-border/50 bg-muted/20 p-3 space-y-1.5">
                <p className="text-xs font-medium text-foreground/80">Formato esperado:</p>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr className="text-muted-foreground">
                        {["Fecha", "Leads", "Chats abiertos", "Tasa agendamiento", "Revenue"].map((h) => (
                          <th key={h} className="border border-border/40 px-2 py-1 font-medium bg-muted/30 text-left">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        {["07/2026", "200", "85", "42%", "15.000"].map((v, i) => (
                          <td key={i} className="border border-border/40 px-2 py-1 text-muted-foreground">
                            {v}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        {["08/2026", "250", "110", "48%", "18.000"].map((v, i) => (
                          <td key={i} className="border border-border/40 px-2 py-1 text-muted-foreground">
                            {v}
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-muted-foreground">
                  Soporta .xlsx, .xls y .csv · Reimportar actualiza los valores existentes.
                </p>
              </div>

              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="flex flex-col items-center justify-center gap-3 w-full rounded-xl border-2 border-dashed border-border/50 bg-muted/10 px-4 py-10 text-center transition-colors hover:border-primary/30 hover:bg-primary/5"
              >
                <Upload className="h-7 w-7 text-muted-foreground/50" />
                <div>
                  <p className="text-sm font-medium text-foreground/80">Seleccioná tu archivo</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {fileName ?? "Excel (.xlsx, .xls) o CSV"}
                  </p>
                </div>
              </button>

              <input
                ref={inputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                onChange={handleFileChange}
              />
            </>
          )}

          {/* ── Paso 2: Mapping — confirmar columnas ── */}
          {step === "mapping" && (
            <>
              <DialogHeader>
                <DialogTitle>Confirmar columnas</DialogTitle>
                <DialogDescription>
                  Verificá que la columna de fecha sea correcta y seleccioná qué métricas querés
                  importar.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {/* Columna de fecha */}
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Columna de fecha / período
                  </label>
                  <select
                    value={periodColumn}
                    onChange={(e) => handlePeriodColumnChange(e.target.value)}
                    className="mt-1.5 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                  >
                    {allHeaders.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Columnas de métricas */}
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Columnas de métricas a importar
                  </label>
                  <p className="text-xs text-muted-foreground mt-0.5 mb-2">
                    Las columnas con{" "}
                    <CheckCircle2 className="inline h-3 w-3 text-primary align-[-1px]" />{" "}
                    fueron reconocidas como métricas OTC y se guardarán con su clave estándar.
                    Deseleccioná columnas que no sean numéricas (notas, comentarios, etc.).
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {allHeaders
                      .filter((h) => h !== periodColumn)
                      .map((col) => {
                        const active = metricColumns.includes(col);
                        const mapping = columnMappings.get(col);
                        const isRecognized = !!mapping?.otcKey;
                        return (
                          <button
                            key={col}
                            type="button"
                            onClick={() => toggleMetricColumn(col)}
                            title={
                              isRecognized
                                ? `Reconocida como "${mapping!.metricDef!.label}" (${mapping!.metricDef!.location})`
                                : "Columna no reconocida — se importará tal cual"
                            }
                            className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                              active
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-muted-foreground hover:bg-muted/80"
                            }`}
                          >
                            {col}
                            {isRecognized && (
                              <CheckCircle2 className="h-3 w-3 opacity-80 flex-shrink-0" />
                            )}
                          </button>
                        );
                      })}
                  </div>
                  {/* Resumen de reconocimiento */}
                  {columnMappings.size > 0 && (() => {
                    const recognized = [...columnMappings.values()].filter(m => m.otcKey).length;
                    const total = columnMappings.size;
                    return recognized > 0 ? (
                      <p className="mt-2 text-xs text-primary/80">
                        {recognized} de {total} columnas reconocidas como métricas OTC.
                        Se crearán automáticamente en los módulos correspondientes.
                      </p>
                    ) : null;
                  })()}
                </div>

                {/* Resumen de lo que se va a importar */}
                <div className="rounded-lg border border-border/50 bg-muted/10 px-3 py-2 text-xs text-muted-foreground">
                  <span className="font-medium text-foreground/80">
                    {rawRecords.length} filas · {metricColumns.length} métricas detectadas
                  </span>
                  {" "}→ hasta {rawRecords.length * metricColumns.length} valores
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" size="sm" onClick={resetForm}>
                  Cancelar
                </Button>
                <Button
                  size="sm"
                  onClick={handleContinue}
                  disabled={!periodColumn || metricColumns.length === 0}
                >
                  Vista previa
                </Button>
              </DialogFooter>
            </>
          )}

          {/* ── Paso 3: Preview ── */}
          {step === "preview" && (
            <>
              <DialogHeader>
                <DialogTitle>Vista previa de la importación</DialogTitle>
                <DialogDescription>
                  {snapshots.length} valor{snapshots.length !== 1 ? "es" : ""} listos para importar.
                  {parseErrors.length > 0 && ` ${parseErrors.length} filas con advertencias.`}
                </DialogDescription>
              </DialogHeader>

              {/* Errores / advertencias */}
              {parseErrors.length > 0 && (
                <div className="rounded-lg border border-amber-200/50 bg-amber-50/50 dark:border-amber-800/30 dark:bg-amber-950/20 p-3 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-amber-700 dark:text-amber-400">
                    <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                    Advertencias ({parseErrors.length})
                  </div>
                  <ul className="space-y-0.5 max-h-24 overflow-y-auto">
                    {parseErrors.map((e, i) => (
                      <li key={i} className="text-xs text-amber-600 dark:text-amber-400/80">
                        {e.message}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Preview table */}
              {snapshots.length > 0 ? (
                <div className="max-h-64 overflow-y-auto rounded-lg border border-border">
                  <table className="w-full text-xs">
                    <thead className="sticky top-0 bg-muted/80 backdrop-blur-sm">
                      <tr>
                        <th className="px-3 py-2 text-left text-muted-foreground font-medium">Período</th>
                        <th className="px-3 py-2 text-left text-muted-foreground font-medium">Métrica</th>
                        <th className="px-3 py-2 text-right text-muted-foreground font-medium">Valor</th>
                      </tr>
                    </thead>
                    <tbody>
                      {snapshots.slice(0, 50).map((s, i) => (
                        <tr key={i} className="border-t border-border/50 hover:bg-muted/20">
                          <td className="px-3 py-1.5 text-muted-foreground">{s.period}</td>
                          <td className="px-3 py-1.5 font-medium">{s.metric_key}</td>
                          <td className="px-3 py-1.5 text-right tabular-nums">
                            {s.value.toLocaleString("es-AR")}
                          </td>
                        </tr>
                      ))}
                      {snapshots.length > 50 && (
                        <tr>
                          <td colSpan={3} className="px-3 py-2 text-center text-muted-foreground">
                            … y {snapshots.length - 50} más
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
                  <AlertCircle className="h-4 w-4" />
                  No se encontraron valores válidos para importar
                </div>
              )}

              <DialogFooter>
                <Button variant="outline" size="sm" onClick={() => setStep("mapping")}>
                  Volver
                </Button>
                <Button
                  size="sm"
                  onClick={handleImport}
                  disabled={saving || snapshots.length === 0}
                >
                  {saving ? "Importando…" : (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                      Importar {snapshots.length} valor{snapshots.length !== 1 ? "es" : ""}
                    </>
                  )}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
