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
  importClientsAction,
  type ImportClientsRowError,
} from "@/app/clients/actions";
import {
  CLIENT_IMPORT_TEMPLATE,
  extractRawRecords,
  parseClientImportRowsMapped,
} from "@/lib/clients/parse-client-import";
import {
  ALL_FIELDS,
  FIELD_LABELS,
  REQUIRED_FIELDS,
  mapColumnHeaders,
  type ClientImportField,
  type ColumnMapping,
} from "@/lib/clients/column-mapper";
import { usePlatformData } from "@/providers";
import { useToast } from "@/providers/toast-provider";
import type { Client } from "@/types/clients";

type Step = "idle" | "mapping" | "preview";

export function ImportClientsDialog() {
  const inputRef = useRef<HTMLInputElement>(null);
  const { refreshClients } = usePlatformData();
  const { push } = useToast();

  const [open, setOpen] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [step, setStep] = useState<Step>("idle");

  const [rawRecords, setRawRecords] = useState<Record<string, string>[]>([]);
  const [mapping, setMapping] = useState<ColumnMapping>({});

  const [rows, setRows] = useState<Omit<Client, "id">[]>([]);
  const [errors, setErrors] = useState<ImportClientsRowError[]>([]);
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

    const result = mapColumnHeaders(headers);
    setMapping(result.mapping);

    if (result.allRequiredMapped) {
      // Todas las columnas requeridas se detectaron automáticamente
      const parsed = parseClientImportRowsMapped(records, result.mapping);
      setRows(parsed.rows);
      setErrors(parsed.errors);
      setStep("preview");
    } else {
      // Hay columnas requeridas que no se pudieron mapear — mostrar paso manual
      setStep("mapping");
    }
  };

  const handleMappingChange = (header: string, field: ClientImportField | null) => {
    setMapping((prev) => {
      const next = { ...prev };
      // Si el campo ya está asignado a otra columna, liberarlo
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
    const parsed = parseClientImportRowsMapped(rawRecords, mapping);
    setRows(parsed.rows);
    setErrors(parsed.errors);
    setStep("preview");
  };

  const handleImport = async () => {
    setSaving(true);
    try {
      const result = await importClientsAction(rows);
      if (result.errors.length > 0) {
        setErrors(result.errors);
        return;
      }
      await refreshClients();
      push({
        title: "Clientes importados",
        description: `${result.insertedCount} cliente${result.insertedCount !== 1 ? "s" : ""} cargado${result.insertedCount !== 1 ? "s" : ""} correctamente.`,
        variant: "success",
      });
      setOpen(false);
      resetForm();
    } catch (error) {
      push({
        title: "No se pudieron importar los clientes",
        description: error instanceof Error ? error.message : undefined,
      });
    } finally {
      setSaving(false);
    }
  };

  // Qué campos requeridos siguen sin mapear
  const mappedFields = new Set(Object.values(mapping).filter(Boolean) as ClientImportField[]);
  const missingRequired = REQUIRED_FIELDS.filter((f) => !mappedFields.has(f));
  const canConfirmMapping = missingRequired.length === 0;

  // Muestra de valor de una columna (primera fila no vacía)
  const getSample = (header: string): string => {
    for (const record of rawRecords.slice(0, 5)) {
      const val = record[header]?.trim();
      if (val) return val;
    }
    return "—";
  };

  return (
    <>
      <Button variant="outline" className="gap-2" onClick={() => setOpen(true)}>
        <Upload className="h-4 w-4" />
        Cargar clientes
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
            <DialogTitle>Cargar clientes</DialogTitle>
            <DialogDescription>
              {step === "mapping"
                ? "Asigná las columnas de tu archivo a los campos del sistema."
                : "Importá clientes desde CSV o Excel (.xlsx). OTC reconoce columnas en español automáticamente."}
            </DialogDescription>
          </DialogHeader>

          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-5 text-sm">
            {/* Selector de archivo — siempre visible */}
            <input
              ref={inputRef}
              type="file"
              accept=".csv,.xlsx,.xls,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
              onChange={(e) => void handleFile(e.target.files?.[0] ?? null)}
              className="block w-full text-sm text-muted-foreground file:mr-3 file:rounded-lg file:border file:border-border file:bg-background file:px-3 file:py-2 file:text-sm file:font-medium file:text-foreground"
            />

            {/* PASO: idle — info de formato */}
            {step === "idle" && !errors.length && (
              <div className="rounded-lg bg-muted/20 p-3">
                <p className="font-medium">Formato flexible</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Tu archivo puede usar columnas como &ldquo;Alumno&rdquo;, &ldquo;Inversión&rdquo;,
                  &ldquo;Forma de pago&rdquo;, &ldquo;Fecha de compra&rdquo;, etc. OTC también
                  reconoce el formato estándar:
                </p>
                <pre className="mt-3 overflow-x-auto rounded-md bg-background p-3 text-xs text-muted-foreground">
                  {CLIENT_IMPORT_TEMPLATE}
                </pre>
              </div>
            )}

            {/* PASO: mapping — tabla de columnas */}
            {step === "mapping" && (
              <div className="space-y-3">
                {missingRequired.length > 0 && (
                  <div className="flex items-start gap-2 rounded-lg bg-amber-500/10 px-3 py-2.5 text-xs text-amber-700 dark:text-amber-400">
                    <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    <span>
                      Asigná manualmente:{" "}
                      <strong>{missingRequired.map((f) => FIELD_LABELS[f]).join(", ")}</strong>
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
                                {FIELD_LABELS[field]}
                                {REQUIRED_FIELDS.includes(field) && (
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
                                    (e.target.value as ClientImportField) || null
                                  )
                                }
                              >
                                <option value="">— Ignorar columna —</option>
                                {ALL_FIELDS.map((f) => (
                                  <option key={f} value={f}>
                                    {FIELD_LABELS[f]}
                                    {REQUIRED_FIELDS.includes(f) ? " *" : ""}
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
                <p className="text-xs text-muted-foreground">
                  * Campos obligatorios
                </p>
              </div>
            )}

            {/* PASO: preview — resumen antes de importar */}
            {step === "preview" && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 rounded-lg bg-muted/20 px-3 py-2.5 text-xs">
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                  <span>
                    <strong>{rows.length} fila{rows.length !== 1 ? "s" : ""}</strong> listas para importar
                    {fileName ? ` · ${fileName}` : ""}
                  </span>
                </div>

                {rows.length > 0 && (
                  <div className="overflow-hidden rounded-lg border text-xs">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b bg-muted/30">
                          <th className="px-3 py-2 text-left font-medium text-muted-foreground">Nombre</th>
                          <th className="px-3 py-2 text-left font-medium text-muted-foreground">Ingreso</th>
                          <th className="px-3 py-2 text-left font-medium text-muted-foreground">Inversión</th>
                          <th className="px-3 py-2 text-left font-medium text-muted-foreground">Plataforma</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {rows.slice(0, 5).map((row, i) => (
                          <tr key={i}>
                            <td className="px-3 py-2">{row.name}</td>
                            <td className="px-3 py-2 text-muted-foreground">{row.joinDate}</td>
                            <td className="px-3 py-2 text-muted-foreground">{row.totalAmount}</td>
                            <td className="px-3 py-2 text-muted-foreground">{row.platform}</td>
                          </tr>
                        ))}
                        {rows.length > 5 && (
                          <tr>
                            <td colSpan={4} className="px-3 py-2 text-center text-muted-foreground">
                              + {rows.length - 5} fila{rows.length - 5 !== 1 ? "s" : ""} más
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Errores — visible en cualquier paso */}
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
                  : `Importar ${rows.length} cliente${rows.length !== 1 ? "s" : ""}`}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
