"use client";

/**
 * Alta y edición de un checkpoint.
 *
 * ⭐ Las métricas no se definen acá: se **eligen** de las columnas de checkpoint
 * que ya existen (C0). Si no hay ninguna, el formulario lo dice con un link en
 * vez de mostrar una lista vacía sin explicación.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Textarea,
  cn,
} from "@ai-coo/ui";
import { AlertTriangle } from "lucide-react";
import {
  CHECKPOINT_CLIENT_STATUSES,
  CHECKPOINT_CLIENT_STATUS_LABEL,
  type Checkpoint,
  type CheckpointMetric,
  type ClientStatusValue,
} from "@/types/checkpoints";
import type { FieldDefinition } from "@/types/custom-fields";
import { FIELD_TYPE_LABEL } from "@/lib/custom-fields";
import { selectableCheckpointFields } from "@/lib/checkpoints";
import { paths } from "@/routes";

const CONTROL_CLASS =
  "h-9 w-full rounded-md border border-border bg-background px-2 text-sm";

export type CheckpointDraft = {
  name: string;
  description: string;
  setsClientStatus: ClientStatusValue | null;
  expectedDays: string;
  metricSchema: CheckpointMetric[];
};

function draftFrom(checkpoint: Checkpoint | null): CheckpointDraft {
  return {
    name: checkpoint?.name ?? "",
    description: checkpoint?.description ?? "",
    setsClientStatus: checkpoint?.setsClientStatus ?? null,
    expectedDays:
      checkpoint?.expectedDays === null || checkpoint?.expectedDays === undefined
        ? ""
        : String(checkpoint.expectedDays),
    metricSchema: checkpoint?.metricSchema ?? [],
  };
}

export function CheckpointDialog({
  open,
  checkpoint,
  stageName,
  checkpointFields,
  saving,
  error,
  onClose,
  onSubmit,
}: {
  open: boolean;
  /** `null` = alta. */
  checkpoint: Checkpoint | null;
  stageName: string;
  checkpointFields: FieldDefinition[];
  saving: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (draft: CheckpointDraft) => void;
}) {
  const [draft, setDraft] = useState<CheckpointDraft>(() => draftFrom(checkpoint));

  useEffect(() => {
    if (open) setDraft(draftFrom(checkpoint));
  }, [open, checkpoint]);

  const available = selectableCheckpointFields(checkpointFields);

  /**
   * Métricas que apuntan a una columna que ya no existe. Se muestran igual:
   * verlas es lo que permite sacarlas.
   */
  const brokenMetrics = draft.metricSchema.filter(
    (metric) => !available.some((field) => field.key === metric.fieldKey)
  );

  function patch(changes: Partial<CheckpointDraft>) {
    setDraft((current) => ({ ...current, ...changes }));
  }

  function toggleMetric(fieldKey: string) {
    const isOn = draft.metricSchema.some((metric) => metric.fieldKey === fieldKey);
    patch({
      metricSchema: isOn
        ? draft.metricSchema.filter((metric) => metric.fieldKey !== fieldKey)
        : [...draft.metricSchema, { fieldKey, required: false }],
    });
  }

  function toggleRequired(fieldKey: string) {
    patch({
      metricSchema: draft.metricSchema.map((metric) =>
        metric.fieldKey === fieldKey ? { ...metric, required: !metric.required } : metric
      ),
    });
  }

  return (
    <Dialog open={open} onOpenChange={(next) => (next ? null : onClose())}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {checkpoint ? "Editar checkpoint" : "Nuevo checkpoint"}
          </DialogTitle>
          <DialogDescription>
            Un hito dentro de la fase <strong>{stageName}</strong>. Es una afirmación
            sobre el negocio del cliente: pasó o no pasó.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="checkpoint-name">Nombre</Label>
            <Input
              id="checkpoint-name"
              value={draft.name}
              onChange={(event) => patch({ name: event.target.value })}
              placeholder="Primer entregable"
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="checkpoint-description">Ayuda (opcional)</Label>
            <Textarea
              id="checkpoint-description"
              value={draft.description}
              onChange={(event) => patch({ description: event.target.value })}
              rows={2}
              placeholder="Qué tiene que haber pasado para darlo por alcanzado."
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="checkpoint-days">Plazo esperado (opcional)</Label>
            <div className="flex items-center gap-2">
              <Input
                id="checkpoint-days"
                inputMode="numeric"
                className="w-24"
                value={draft.expectedDays}
                onChange={(event) => patch({ expectedDays: event.target.value })}
                placeholder="5"
              />
              <span className="text-xs text-muted-foreground">
                días desde el checkpoint anterior
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Si pasan y el cliente no lo alcanzó, queda marcado como trabado.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="checkpoint-status">Al alcanzarlo, el cliente pasa a</Label>
            <select
              id="checkpoint-status"
              className={CONTROL_CLASS}
              value={draft.setsClientStatus ?? ""}
              onChange={(event) =>
                patch({
                  setsClientStatus:
                    (event.target.value as ClientStatusValue) || null,
                })
              }
            >
              <option value="">No cambia el estado</option>
              {CHECKPOINT_CLIENT_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {CHECKPOINT_CLIENT_STATUS_LABEL[status]}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label>Qué métricas pide</Label>

            {available.length === 0 ? (
              <div className="rounded-lg border border-border/60 p-3 text-xs text-muted-foreground">
                Todavía no definiste ninguna columna de checkpoint.{" "}
                <Link
                  href={paths.platform.clients.customFields}
                  className="text-primary underline-offset-4 hover:underline"
                >
                  Creala en Campos personalizados
                </Link>{" "}
                y volvé acá a elegirla.
              </div>
            ) : (
              <div className="space-y-1.5">
                {available.map((field) => {
                  const metric = draft.metricSchema.find(
                    (entry) => entry.fieldKey === field.key
                  );
                  const isOn = metric !== undefined;
                  return (
                    <div
                      key={field.key}
                      className={cn(
                        "flex items-center gap-3 rounded-lg border px-3 py-2",
                        isOn ? "border-primary/40 bg-primary/5" : "border-border/60"
                      )}
                    >
                      <input
                        type="checkbox"
                        id={`metric-${field.key}`}
                        checked={isOn}
                        onChange={() => toggleMetric(field.key)}
                        className="h-4 w-4 rounded border-border"
                      />
                      <label
                        htmlFor={`metric-${field.key}`}
                        className="min-w-0 flex-1 cursor-pointer text-sm"
                      >
                        {field.label}
                        <span className="ml-2 text-xs text-muted-foreground">
                          {FIELD_TYPE_LABEL[field.fieldType]}
                        </span>
                      </label>
                      {isOn ? (
                        <button
                          type="button"
                          onClick={() => toggleRequired(field.key)}
                          disabled={field.isRequired}
                          title={
                            field.isRequired
                              ? "La columna ya es obligatoria en Campos personalizados"
                              : "Marcar como obligatoria en este checkpoint"
                          }
                          className={cn(
                            "shrink-0 rounded-full border px-2 py-0.5 text-[11px]",
                            metric.required || field.isRequired
                              ? "border-primary/40 text-primary"
                              : "border-border text-muted-foreground hover:text-foreground",
                            field.isRequired && "cursor-default opacity-70"
                          )}
                        >
                          {metric.required || field.isRequired
                            ? "Obligatoria"
                            : "Opcional"}
                        </button>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            )}

            {brokenMetrics.length > 0 ? (
              <div className="space-y-1.5 rounded-lg border border-warning/40 p-3">
                <p className="flex items-center gap-1.5 text-xs text-warning">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  Estas métricas apuntan a columnas que ya no existen o están archivadas
                </p>
                {brokenMetrics.map((metric) => (
                  <div
                    key={metric.fieldKey}
                    className="flex items-center justify-between gap-2 text-xs"
                  >
                    <code className="font-mono text-muted-foreground">
                      {metric.fieldKey}
                    </code>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleMetric(metric.fieldKey)}
                    >
                      Quitar
                    </Button>
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={() => onSubmit(draft)}
            disabled={saving || draft.name.trim() === ""}
          >
            {saving ? "Guardando…" : checkpoint ? "Guardar" : "Crear checkpoint"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
