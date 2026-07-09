"use client";

import { useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
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
import { createWorkboardTasksAction } from "@/app/agent/actions";
import { markFathomTasksSentToBoardAction } from "@/app/fathom/actions";
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

type EditableProposal = FathomTaskProposal & { selected: boolean };

type FathomTaskProposalModalProps = {
  proposals: FathomTaskProposal[];
  fathomCallId: string;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export function FathomTaskProposalModal({
  proposals,
  fathomCallId,
  open,
  onClose,
  onSuccess,
}: FathomTaskProposalModalProps) {
  const [items, setItems] = useState<EditableProposal[]>(() =>
    proposals.map((proposal) => ({ ...proposal, selected: true }))
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedCount = useMemo(
    () => items.filter((item) => item.selected).length,
    [items]
  );

  const updateItem = (index: number, patch: Partial<EditableProposal>) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, ...patch } : item))
    );
  };

  const handleSubmit = async () => {
    const selected = items.filter((item) => item.selected);
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

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Agregar tareas al Tablero de Trabajo</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          {items.map((item, index) => (
            <div
              key={`${item.title}-${index}`}
              className={cn(
                "rounded-xl border border-violet-500/20 bg-violet-500/5 p-4 dark:bg-violet-500/10",
                !item.selected && "opacity-60"
              )}
            >
              <label className="mb-3 flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={item.selected}
                  onChange={(e) => updateItem(index, { selected: e.target.checked })}
                  className="mt-1 h-4 w-4 rounded border-violet-400 text-violet-600 focus:ring-violet-500"
                />
                <span className="text-xs font-medium text-muted-foreground">
                  Incluir esta tarea
                </span>
              </label>

              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor={`task-title-${index}`}>Título</Label>
                  <Input
                    id={`task-title-${index}`}
                    value={item.title}
                    onChange={(e) => updateItem(index, { title: e.target.value })}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor={`task-desc-${index}`}>Descripción</Label>
                  <Input
                    id={`task-desc-${index}`}
                    value={item.description ?? ""}
                    onChange={(e) =>
                      updateItem(index, { description: e.target.value })
                    }
                  />
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor={`task-area-${index}`}>Área</Label>
                    <select
                      id={`task-area-${index}`}
                      value={item.area ?? "general"}
                      onChange={(e) =>
                        updateItem(index, {
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
                    <Label htmlFor={`task-priority-${index}`}>Prioridad</Label>
                    <select
                      id={`task-priority-${index}`}
                      value={item.priority ?? "medium"}
                      onChange={(e) =>
                        updateItem(index, {
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
                    <Label htmlFor={`task-due-${index}`}>Vencimiento</Label>
                    <Input
                      id={`task-due-${index}`}
                      type="date"
                      value={item.due_date ?? ""}
                      onChange={(e) =>
                        updateItem(index, {
                          due_date: e.target.value || null,
                        })
                      }
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor={`task-assignee-${index}`}>Responsable</Label>
                    <Input
                      id={`task-assignee-${index}`}
                      value={item.assignee_name ?? ""}
                      onChange={(e) =>
                        updateItem(index, {
                          assignee_name: e.target.value || null,
                        })
                      }
                      placeholder="Nombre del equipo"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={() => void handleSubmit()}
            disabled={saving || selectedCount === 0}
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
