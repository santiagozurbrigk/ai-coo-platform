"use client";

import { useMemo, useState } from "react";
import { Loader2, Trash2 } from "lucide-react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
} from "@ai-coo/ui";
import { createWorkboardTasksAction } from "@/app/agent/workboard-actions";
import {
  markFathomTasksSentToBoardAction,
  updateFathomTaskProposalsAction,
} from "@/app/fathom/actions";
import type { FathomTaskProposal } from "@/lib/fathom/team-task-extraction";
import { cn } from "@/lib/utils";

const AREA_OPTIONS = [
  { value: "marketing", label: "Marketing" },
  { value: "ventas", label: "Ventas" },
  { value: "operaciones", label: "Operaciones" },
  { value: "finanzas", label: "Finanzas" },
  { value: "clientes", label: "Clientes" },
  { value: "general", label: "General" },
] as const;

const PRIORITY_OPTIONS = [
  { value: "low", label: "Baja" },
  { value: "medium", label: "Media" },
  { value: "high", label: "Alta" },
] as const;

type EditableProposal = FathomTaskProposal & {
  selected: boolean;
  rejected: boolean;
};

type FathomTaskProposalModalProps = {
  proposals: FathomTaskProposal[];
  fathomCallId: string;
  open: boolean;
  onClose: () => void;
  onSuccess: (allRejected?: boolean) => void;
};

export function FathomTaskProposalModal({
  proposals,
  fathomCallId,
  open,
  onClose,
  onSuccess,
}: FathomTaskProposalModalProps) {
  const [items, setItems] = useState<EditableProposal[]>(() =>
    proposals.map((p) => ({
      ...p,
      selected: !(p as Record<string, unknown>).rejected,
      rejected: Boolean((p as Record<string, unknown>).rejected),
    }))
  );
  const [saving, setSaving] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const visibleItems = items.filter((i) => !i.rejected);
  const selectedCount = useMemo(
    () => visibleItems.filter((i) => i.selected).length,
    [visibleItems]
  );

  const updateItem = (index: number, patch: Partial<EditableProposal>) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, ...patch } : item))
    );
  };

  const rejectItem = async (index: number) => {
    const updated = items.map((item, i) =>
      i === index ? { ...item, rejected: true, selected: false } : item
    );
    setItems(updated);

    // Persist the rejection immediately
    await updateFathomTaskProposalsAction(
      fathomCallId,
      updated.map(({ selected: _s, ...rest }) => rest)
    );

    // If all are now rejected, auto-close the banner
    if (updated.every((i) => i.rejected)) {
      await markFathomTasksSentToBoardAction(fathomCallId);
      onSuccess(true);
      onClose();
    }
  };

  const handleRejectAll = async () => {
    setRejecting(true);
    setError(null);
    try {
      const allRejected = items.map((i) => ({
        ...i,
        rejected: true,
        selected: false,
      }));
      await updateFathomTaskProposalsAction(
        fathomCallId,
        allRejected.map(({ selected: _s, ...rest }) => rest)
      );
      await markFathomTasksSentToBoardAction(fathomCallId);
      onSuccess(true);
      onClose();
    } catch {
      setError("No se pudieron rechazar las tareas.");
    } finally {
      setRejecting(false);
    }
  };

  const handleSubmit = async () => {
    const selected = visibleItems.filter((i) => i.selected);
    if (!selected.length || saving) return;

    setSaving(true);
    setError(null);

    const result = await createWorkboardTasksAction({
      tasks: selected.map((item) => ({
        title: item.title,
        description: item.description,
        area: item.area,
        priority: item.priority,
        due_date: item.due_date ?? null,
        assignee_name: item.assignee_name ?? null,
        tags: ["fathom"],
      })),
    });

    if (!result.ok) {
      setSaving(false);
      setError(result.error ?? "No se pudieron crear las tareas.");
      return;
    }

    const markResult = await markFathomTasksSentToBoardAction(fathomCallId);
    setSaving(false);

    if (!markResult.ok) {
      setError(markResult.error ?? "Las tareas se crearon pero no se pudo marcar la reunión.");
      return;
    }

    onSuccess();
    onClose();
  };

  const originalIndex = (visibleIndex: number) => {
    let count = -1;
    for (let i = 0; i < items.length; i++) {
      if (!items[i].rejected) {
        count++;
        if (count === visibleIndex) return i;
      }
    }
    return visibleIndex;
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Revisar tareas detectadas</DialogTitle>
          <p className="text-sm text-muted-foreground">
            La IA detectó estas tareas en la reunión. Podés agregarlas al tablero, editarlas o rechazarlas.
          </p>
        </DialogHeader>

        <div className="space-y-3">
          {visibleItems.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">
              Todas las tareas fueron rechazadas.
            </p>
          ) : (
            visibleItems.map((item, visibleIdx) => {
              const realIdx = originalIndex(visibleIdx);
              return (
                <div
                  key={`${item.title}-${realIdx}`}
                  className={cn(
                    "rounded-xl border border-violet-500/20 bg-violet-500/5 p-4 dark:bg-violet-500/10",
                    !item.selected && "opacity-60"
                  )}
                >
                  {/* Header row: checkbox + reject button */}
                  <div className="mb-3 flex items-center justify-between">
                    <label className="flex cursor-pointer items-center gap-2">
                      <input
                        type="checkbox"
                        checked={item.selected}
                        onChange={(e) =>
                          updateItem(realIdx, { selected: e.target.checked })
                        }
                        className="h-4 w-4 rounded border-violet-400 text-violet-600 focus:ring-violet-500"
                      />
                      <span className="text-xs font-medium text-muted-foreground">
                        Incluir esta tarea
                      </span>
                    </label>
                    <button
                      type="button"
                      onClick={() => void rejectItem(realIdx)}
                      className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                      title="Rechazar esta tarea"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Rechazar
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <Label htmlFor={`task-title-${realIdx}`}>Título</Label>
                      <Input
                        id={`task-title-${realIdx}`}
                        value={item.title}
                        onChange={(e) =>
                          updateItem(realIdx, { title: e.target.value })
                        }
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor={`task-desc-${realIdx}`}>Descripción</Label>
                      <Input
                        id={`task-desc-${realIdx}`}
                        value={item.description ?? ""}
                        onChange={(e) =>
                          updateItem(realIdx, { description: e.target.value })
                        }
                      />
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <Label htmlFor={`task-area-${realIdx}`}>Área</Label>
                        <select
                          id={`task-area-${realIdx}`}
                          value={item.area ?? "general"}
                          onChange={(e) =>
                            updateItem(realIdx, {
                              area: e.target.value as EditableProposal["area"],
                            })
                          }
                          className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                        >
                          {AREA_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor={`task-priority-${realIdx}`}>Prioridad</Label>
                        <select
                          id={`task-priority-${realIdx}`}
                          value={item.priority ?? "medium"}
                          onChange={(e) =>
                            updateItem(realIdx, {
                              priority: e.target.value as EditableProposal["priority"],
                            })
                          }
                          className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                        >
                          {PRIORITY_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <Label htmlFor={`task-due-${realIdx}`}>Vencimiento</Label>
                        <Input
                          id={`task-due-${realIdx}`}
                          type="date"
                          value={item.due_date ?? ""}
                          onChange={(e) =>
                            updateItem(realIdx, {
                              due_date: e.target.value || null,
                            })
                          }
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor={`task-assignee-${realIdx}`}>Responsable</Label>
                        <Input
                          id={`task-assignee-${realIdx}`}
                          value={item.assignee_name ?? ""}
                          onChange={(e) =>
                            updateItem(realIdx, {
                              assignee_name: e.target.value || null,
                            })
                          }
                          placeholder="Nombre del equipo"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="ghost"
            className="text-muted-foreground"
            onClick={() => void handleRejectAll()}
            disabled={saving || rejecting || visibleItems.length === 0}
          >
            {rejecting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="mr-2 h-4 w-4" />
            )}
            Rechazar todas
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={saving || rejecting}
          >
            Cerrar
          </Button>
          <Button
            type="button"
            onClick={() => void handleSubmit()}
            disabled={saving || rejecting || selectedCount === 0}
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Agregando…
              </>
            ) : (
              `Agregar ${selectedCount} tarea${selectedCount === 1 ? "" : "s"} al Tablero`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
