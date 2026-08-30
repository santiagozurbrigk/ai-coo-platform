"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, ChevronLeft, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  Input,
  Label,
} from "@ai-coo/ui";
import {
  validateClickUpKeyAction,
  fetchClickUpListsAction,
  fetchClickUpPreviewAction,
  importClickUpClientsAction,
  type ClickUpPreviewRow,
} from "@/app/integrations/clickup/import-actions";
import type { ClickUpWorkspace, ClickUpList } from "@/lib/clickup/client";
import { OTC_FIELDS, type FieldMapping, type OtcClientField } from "@/lib/clickup/field-mapper";
import { useToast } from "@/providers/toast-provider";
import { usePlatformData } from "@/providers";
import { brand } from "@/lib/brand";

type Step = "key" | "list" | "mapping" | "result";

type ClickUpImportWizardProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const SELECT_CLS =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm focus:outline-none focus:ring-1 focus:ring-ring";

export function ClickUpImportWizard({ open, onOpenChange }: ClickUpImportWizardProps) {
  const router = useRouter();
  const { push } = useToast();
  const { refreshClients } = usePlatformData();
  const [isPending, startTransition] = useTransition();

  const [step, setStep] = useState<Step>("key");
  const [apiKey, setApiKey] = useState("");
  const [error, setError] = useState<string | null>(null);

  // step: key
  const [workspaces, setWorkspaces] = useState<ClickUpWorkspace[]>([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState("");

  // step: list
  const [lists, setLists] = useState<ClickUpList[]>([]);
  const [selectedList, setSelectedList] = useState("");

  // step: mapping
  const [clickupFields, setClickupFields] = useState<{ name: string; isBuiltin?: boolean }[]>([]);
  const [mapping, setMapping] = useState<FieldMapping[]>([]);
  const [preview, setPreview] = useState<ClickUpPreviewRow[]>([]);
  const [totalTasks, setTotalTasks] = useState(0);

  // step: result
  const [resultInserted, setResultInserted] = useState(0);
  const [resultErrors, setResultErrors] = useState(0);

  const resetWizard = () => {
    setStep("key");
    setApiKey("");
    setError(null);
    setWorkspaces([]);
    setSelectedWorkspace("");
    setLists([]);
    setSelectedList("");
    setClickupFields([]);
    setMapping([]);
    setPreview([]);
    setTotalTasks(0);
  };

  const handleClose = (open: boolean) => {
    if (!open) resetWizard();
    onOpenChange(open);
  };

  const handleValidateKey = () => {
    setError(null);
    startTransition(async () => {
      const res = await validateClickUpKeyAction(apiKey);
      if (!res.success) { setError(res.error); return; }
      setWorkspaces(res.workspaces);
      setSelectedWorkspace(res.workspaces[0]?.id ?? "");
      setStep("list");
    });
  };

  const handleFetchLists = () => {
    setError(null);
    startTransition(async () => {
      const res = await fetchClickUpListsAction(apiKey, selectedWorkspace);
      if (!res.success) { setError(res.error); return; }
      if (!res.lists.length) { setError("No se encontraron listas en este workspace."); return; }
      setLists(res.lists);
      setSelectedList(res.lists[0]?.id ?? "");
      setStep("mapping");
      // fetch preview
      const prev = await fetchClickUpPreviewAction(apiKey, res.lists[0]?.id ?? "");
      if (prev.success) {
        setClickupFields(prev.fields);
        setMapping(prev.mapping);
        setPreview(prev.preview);
        setTotalTasks(prev.totalTasks);
      } else {
        setError(prev.error);
      }
    });
  };

  const handleListChange = (listId: string) => {
    setSelectedList(listId);
    setError(null);
    startTransition(async () => {
      const prev = await fetchClickUpPreviewAction(apiKey, listId);
      if (prev.success) {
        setClickupFields(prev.fields);
        setMapping(prev.mapping);
        setPreview(prev.preview);
        setTotalTasks(prev.totalTasks);
      } else {
        setError(prev.error);
      }
    });
  };

  const updateMapping = (clickupField: string, otcField: OtcClientField | "") => {
    setMapping((prev) =>
      prev.map((m) =>
        m.clickupField === clickupField
          ? { ...m, otcField: otcField === "" ? null : (otcField as OtcClientField) }
          : m
      )
    );
  };

  const handleImport = () => {
    setError(null);
    startTransition(async () => {
      const res = await importClickUpClientsAction(apiKey, selectedList, mapping);
      if (!res.success) { setError(res.error); return; }
      setResultInserted(res.inserted);
      setResultErrors(res.errors);
      setStep("result");
      await refreshClients();
      router.refresh();
    });
  };

  const listLabel = (list: ClickUpList) => {
    const parts: string[] = [];
    if (list.space?.name) parts.push(list.space.name);
    if (list.folder?.name) parts.push(list.folder.name);
    parts.push(list.name);
    return parts.join(" › ");
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="w-[calc(100vw-2rem)] max-w-2xl">
        <DialogHeader>
          <DialogTitle>Importar clientes desde ClickUp</DialogTitle>
          <DialogDescription>
            {step === "key" && "Ingresá tu API key personal de ClickUp para comenzar."}
            {step === "list" && "Elegí el workspace y la lista que contiene tus clientes."}
            {step === "mapping" && `Mapeá los campos de ClickUp a ${brand.name}. ${totalTasks} tareas encontradas.`}
            {step === "result" && "Importación completada."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* STEP: KEY */}
          {step === "key" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cu-apikey">API key de ClickUp</Label>
                <Input
                  id="cu-apikey"
                  type="password"
                  autoComplete="off"
                  placeholder="pk_xxxxxxxxxxxxxxxx"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleValidateKey(); }}
                />
                <p className="text-xs text-muted-foreground">
                  Encontrala en ClickUp → Perfil → Aplicaciones → API token.
                </p>
              </div>
              {error && <ErrorBanner message={error} />}
              <div className="flex justify-end">
                <Button onClick={handleValidateKey} disabled={isPending || !apiKey.trim()}>
                  {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {isPending ? "Validando…" : "Continuar"}
                  {!isPending && <ChevronRight className="ml-1 h-4 w-4" />}
                </Button>
              </div>
            </div>
          )}

          {/* STEP: LIST */}
          {step === "list" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cu-workspace">Workspace</Label>
                <select
                  id="cu-workspace"
                  className={SELECT_CLS}
                  value={selectedWorkspace}
                  onChange={(e) => setSelectedWorkspace(e.target.value)}
                >
                  {workspaces.map((ws) => (
                    <option key={ws.id} value={ws.id}>{ws.name}</option>
                  ))}
                </select>
              </div>
              {error && <ErrorBanner message={error} />}
              <div className="flex justify-between">
                <Button variant="ghost" onClick={() => setStep("key")} disabled={isPending}>
                  <ChevronLeft className="mr-1 h-4 w-4" /> Atrás
                </Button>
                <Button onClick={handleFetchLists} disabled={isPending || !selectedWorkspace}>
                  {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                  {isPending ? "Cargando listas…" : "Continuar"}
                  {!isPending && <ChevronRight className="ml-1 h-4 w-4" />}
                </Button>
              </div>
            </div>
          )}

          {/* STEP: MAPPING */}
          {step === "mapping" && (
            <div className="space-y-4">
              {/* List selector */}
              <div className="space-y-2">
                <Label htmlFor="cu-list">Lista</Label>
                <select
                  id="cu-list"
                  className={SELECT_CLS}
                  value={selectedList}
                  onChange={(e) => handleListChange(e.target.value)}
                >
                  {lists.map((l) => (
                    <option key={l.id} value={l.id}>{listLabel(l)}</option>
                  ))}
                </select>
              </div>

              {/* Field mapping table */}
              {isPending ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Mapeo de campos</p>
                  <div className="max-h-52 overflow-y-auto rounded-lg border border-border/40 divide-y divide-border/40">
                    {clickupFields.map((f) => {
                      const m = mapping.find((x) => x.clickupField === f.name);
                      return (
                        <div key={f.name} className="flex items-center gap-2 px-3 py-2">
                          <span className="w-[45%] shrink-0 truncate text-xs text-foreground font-medium">{f.name}</span>
                          <select
                            className={`${SELECT_CLS} min-w-0 flex-1 text-xs py-1`}
                            value={m?.otcField ?? ""}
                            onChange={(e) => updateMapping(f.name, e.target.value as OtcClientField | "")}
                          >
                            <option value="">— omitir —</option>
                            {OTC_FIELDS.map((of) => (
                              <option key={of.key} value={of.key}>{of.label}{of.required ? " *" : ""}</option>
                            ))}
                          </select>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Preview table */}
              {preview.length > 0 && !isPending && (
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Vista previa (primeras {preview.length} filas)</p>
                  <div className="overflow-x-auto rounded-lg border border-border/40">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-border/40 bg-muted/30">
                          {clickupFields.map((f) => (
                            <th key={f.name} className="px-3 py-2 text-left font-medium text-muted-foreground truncate max-w-[120px]">
                              {f.name}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {preview.map((row, i) => (
                          <tr key={i} className="border-b border-border/20 last:border-0">
                            {clickupFields.map((f) => (
                              <td key={f.name} className="px-3 py-2 truncate max-w-[120px] text-foreground/80">
                                {row[f.name] ?? ""}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {error && <ErrorBanner message={error} />}

              <div className="flex justify-between">
                <Button variant="ghost" onClick={() => setStep("list")} disabled={isPending}>
                  <ChevronLeft className="mr-1 h-4 w-4" /> Atrás
                </Button>
                <Button
                  onClick={handleImport}
                  disabled={isPending || !selectedList || !mapping.some((m) => m.otcField === "name")}
                >
                  {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                  {isPending ? "Importando…" : `Importar ${totalTasks} clientes`}
                </Button>
              </div>
            </div>
          )}

          {/* STEP: RESULT */}
          {step === "result" && (
            <div className="space-y-4">
              <div className="flex flex-col items-center gap-3 py-6 text-center">
                <CheckCircle2 className="h-10 w-10 text-emerald-500" />
                <div>
                  <p className="text-base font-semibold text-foreground">
                    {resultInserted} cliente{resultInserted !== 1 ? "s" : ""} importado{resultInserted !== 1 ? "s" : ""}
                  </p>
                  {resultErrors > 0 && (
                    <p className="mt-1 text-sm text-muted-foreground">
                      {resultErrors} fila{resultErrors !== 1 ? "s" : ""} omitida{resultErrors !== 1 ? "s" : ""}.
                    </p>
                  )}
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    resetWizard();
                  }}
                >
                  Importar otra lista
                </Button>
                <Button onClick={() => handleClose(false)}>Cerrar</Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{message}</span>
    </div>
  );
}
