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
import { AlertCircle, CheckCircle2, Upload } from "lucide-react";
import {
  importClosingCallsAction,
  type ImportClosingCallsRowError,
} from "@/app/closing/actions";
import { extractRawRecords } from "@/lib/clients/parse-client-import";
import {
  CLOSING_ALL_FIELDS,
  CLOSING_FIELD_LABELS,
  CLOSING_REQUIRED_FIELDS,
  mapClosingColumnHeaders,
  parseClosingImportRowsMapped,
  type ClosingImportField,
  type ClosingColumnMapping,
} from "@/lib/closing/parse-closing-import";
import { usePlatformData } from "@/providers";
import { useToast } from "@/providers/toast-provider";
import type { ClosingCall } from "@/types/closing";

type Step = "idle" | "mapping" | "preview";

export function ImportClosingCallsDialog() {
  const inputRef = useRef<HTMLInputElement>(null);
  const { refreshClosingCalls } = usePlatformData();
  const { push } = useToast();

  const [open, setOpen] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [step, setStep] = useState<Step>("idle");

  const [rawRecords, setRawRecords] = useState<Record<string, string>[]>([]);
  const [mapping, setMapping] = useState<ClosingColumnMapping>({});

  const [rows, setRows] = useState<Omit<ClosingCall, "id">[]>([]);
  const [errors, setErrors] = useState<ImportClosingCallsRowError[]>([]);
  const [saving, setSaving] = useState(false);

  const resetForm = () => {
    setFileName(null);
    setStep("idle");
    setRawRecords([]);
    setMapping({});
    setRows([]);
    setErrors([]);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleFile = async (file: File | null) => {
    setFileName(file?.name ?? null);
    setRawRecords([]);
    setMapping({});
    setRows([]);
    setErrors([]);
    setStep("idle");
    if (!file) return;

    const extracted = await extractRawRecords(file);
    if ("error" in extracted) {
      setErrors([{ row: 1, message: extracted.error }]);
      return;
    }

    const { headers, records } = extracted;
    setRawRecords(records);

    const result = mapClosingColumnHeaders(headers);
    setMapping(result.mapping);

    if (result.allRequiredMapped) {
      const parsed = parseClosingImportRowsMapped(records, result.mapping);
      setRows(parsed.rows);
      setErrors(parsed.errors);
      setStep("preview");
    } else {
      setStep("mapping");
    }
  };

  const handleMappingChange = (header: string, field: ClosingImportField | null) => {
    setMapping((prev) => {
      const next = { ...prev };
      if (field !== null) {
        for (const key of Object.keys(next)) {
          if (next[key] === field && key !== header) {
            next[key] = null;
          }
        }
      }
      next[header] = field;
      return next;
    });
  };

  const confirmMapping = () => {
    const parsed = parseClosingImportRowsMapped(rawRecords, mapping);
    setRows(parsed.rows);
    setErrors(parsed.errors);
    setStep("preview");
  };

  const handleImport = async () => {
    setSaving(true);
    try {
      const result = await importClosingCallsAction(rows);
      if (result.errors.length > 0) {
        setErrors(result.errors);
        return;
      }
      await refreshClosingCalls();
      push({
        title: "Llamadas importadas",
        description: `${result.insertedCount} llamada${result.insertedCount !== 1 ? "s" : ""} cargada${result.insertedCount !== 1 ? "s" : ""} correctamente.`,
        variant: "success",
      });
      setOpen(false);
      resetForm();
    } catch (error) {
      push({
        title: "No se pudieron importar las llamadas",
        description: error instanceof Error ? error.message : undefined,
      });
    } finally {
      setSaving(false);
    }
  };

  const mappedFields = new Set(
    Object.values(mapping).filter(Boolean) as ClosingImportField[]
  );
  const missingRequired = CLOSING_REQUIRED_FIELDS.filter(
    (f) => !mappedFields.has(f)
  );
  const canConfirmMapping = missingRequired.length === 0;

  const getSample = (header: string): string => {
    for (const record of rawRecords.slice(0, 5)) {
      const val = record[header]?.trim();
      if (val) return val;
    }
    return "—";
  };

  const STATUS_LABEL: Record<string, string> = {
    scheduled: "Agendada",
    closed: "Cerrada",
    not_closed: "No cerrada",
    no_show: "No show",
  };

  return (
    <>
      <Button variant="outline" className="gap-2" onClick={() => setOpen(true)}>
        <Upload className="h-4 w-4" />
        Cargar llamadas
      </Button>

      <Dialog
        open={open}
        onOpenChange={(nextOpen: boolean) => {
          setOpen(nextOpen);
          if (!nextOpen) resetForm();
        }}
      >
        <DialogContent className="flex max-h-[min(90vh,720px)] max-w-2xl flex-col gap-0 overflow-hidden p-0">
          <DialogHeader className="shrink-0 border-b px-6 py-4">
            <DialogTitle>Cargar llamadas de cierre</DialogTitle>
            <DialogDescription>
              {step === "mapping"
                ? "Asigná las columnas de tu archivo a los campos del sistema."
                : "Importá el historial de llamadas desde CSV o Excel (.xlsx). OTC reconoce columnas en español automáticamente."}
            </DialogDescription>
          </DialogHeader>

          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-5 text-sm">
            <input
              ref={inputRef}
              type="file"
              accept=".csv,.xlsx,.xls,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
              onChange={(e) => void handleFile(e.target.files?.[0] ?? null)}
              className="block w-full text-sm text-muted-foreground file:mr-3 file:rounded-lg file:border file:border-border file:bg-background file:px-3 file:py-2 file:text-sm file:font-medium file:text-foreground"
            />

            {/* PASO: idle */}
            {step === "idle" && !errors.length && (
              <div className="rounded-lg bg-muted/20 p-3">
                <p className="font-medium">Formato flexible</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Tu archivo puede usar columnas como &ldquo;Nombre del lead&rdquo;,
                  &ldquo;Fecha de llamada&rdquo;, &ldquo;Estado&rdquo;,
                  &ldquo;Ingreso cobrado&rdquo;, &ldquo;Link Fathom&rdquo;, etc.
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Campos obligatorios: <strong>Nombre del lead</strong> y{" "}
                  <strong>Fecha de llamada</strong>. El resto es opcional.
                </p>
              </div>
            )}

            {/* PASO: mapping */}
            {step === "mapping" && (
              <div className="space-y-3">
                {missingRequired.length > 0 && (
                  <div className="flex items-start gap-2 rounded-lg bg-amber-500/10 px-3 py-2.5 text-xs text-amber-700 dark:text-amber-400">
                    <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    <span>
                      Asigná manualmente:{" "}
                      <strong>
                        {missingRequired
                          .map((f) => CLOSING_FIELD_LABELS[f])
                          .join(", ")}
                      </strong>
                    </span>
                  </div>
                )}

                <div className="overflow-hidden rounded-lg border text-xs">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-muted/30">
                        <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                          Columna en tu archivo
                        </th>
                        <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                          Campo en OTC
                        </th>
                        <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                          Ejemplo
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {Object.entries(mapping).map(([header, field]) => (
                        <tr key={header}>
                          <td className="px-3 py-2 font-mono text-foreground/80">
                            {header}
                          </td>
                          <td className="px-3 py-2">
                            {field !== null ? (
                              <span className="flex items-center gap-1.5 text-green-600 dark:text-green-400">
                                <CheckCircle2 className="h-3 w-3 shrink-0" />
                                {CLOSING_FIELD_LABELS[field]}
                                {CLOSING_REQUIRED_FIELDS.includes(field) && (
                                  <span className="text-muted-foreground">*</span>
                                )}
                              </span>
                            ) : (
                              <select
                                className="rounded border border-border bg-background px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                                defaultValue=""
                                onChange={(e) =>
                                  handleMappingChange(
                                    header,
                                    (e.target.value as ClosingImportField) || null
                                  )
                                }
                              >
                                <option value="">— Ignorar columna —</option>
                                {CLOSING_ALL_FIELDS.map((f) => (
                                  <option key={f} value={f}>
                                    {CLOSING_FIELD_LABELS[f]}
                                    {CLOSING_REQUIRED_FIELDS.includes(f) ? " *" : ""}
                                  </option>
                                ))}
                              </select>
                            )}
                          </td>
                          <td className="px-3 py-2 text-muted-foreground">
                            {getSample(header)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-muted-foreground">* Campos obligatorios</p>
              </div>
            )}

            {/* PASO: preview */}
            {step === "preview" && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 rounded-lg bg-muted/20 px-3 py-2.5 text-xs">
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                  <span>
                    <strong>
                      {rows.length} llamada{rows.length !== 1 ? "s" : ""}
                    </strong>{" "}
                    listas para importar
                    {fileName ? ` · ${fileName}` : ""}
                  </span>
                </div>

                {rows.length > 0 && (
                  <div className="overflow-hidden rounded-lg border text-xs">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b bg-muted/30">
                          <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                            Lead
                          </th>
                          <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                            Fecha
                          </th>
                          <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                            Estado
                          </th>
                          <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                            Ingreso
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {rows.slice(0, 5).map((row, i) => (
                          <tr key={i}>
                            <td className="px-3 py-2">{row.leadName}</td>
                            <td className="px-3 py-2 text-muted-foreground">
                              {row.scheduledAt.split("T")[0]}
                            </td>
                            <td className="px-3 py-2 text-muted-foreground">
                              {STATUS_LABEL[row.status] ?? row.status}
                            </td>
                            <td className="px-3 py-2 text-muted-foreground">
                              {row.outcome?.revenue
                                ? `$${row.outcome.revenue.toLocaleString()}`
                                : "—"}
                            </td>
                          </tr>
                        ))}
                        {rows.length > 5 && (
                          <tr>
                            <td
                              colSpan={4}
                              className="px-3 py-2 text-center text-muted-foreground"
                            >
                              + {rows.length - 5} fila
                              {rows.length - 5 !== 1 ? "s" : ""} más
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Errores */}
            {errors.length > 0 && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3">
                <p className="text-sm font-medium text-destructive">
                  {errors.length === 1 && errors[0]?.row === 1
                    ? "Error al procesar el archivo"
                    : "Revisá estas filas antes de importar"}
                </p>
                <ul className="mt-2 max-h-32 space-y-1 overflow-y-auto text-xs text-destructive">
                  {errors.map((error, index) => (
                    <li key={`${error.row}-${index}`}>
                      {error.row === 1 && errors.length === 1
                        ? error.message
                        : `Fila ${error.row}: ${error.message}`}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <DialogFooter className="shrink-0 border-t px-6 py-4">
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            {step === "mapping" && (
              <Button onClick={confirmMapping} disabled={!canConfirmMapping}>
                Confirmar mapeo
              </Button>
            )}
            {step === "preview" && (
              <Button
                onClick={() => void handleImport()}
                disabled={saving || rows.length === 0 || errors.length > 0}
              >
                {saving
                  ? "Importando…"
                  : `Importar ${rows.length} llamada${rows.length !== 1 ? "s" : ""}`}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
