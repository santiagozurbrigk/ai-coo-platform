"use client";

/** Alta y edición de una fase del recorrido: nombre y color. */

import { useEffect, useState } from "react";
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
} from "@ai-coo/ui";
import { FIELD_OPTION_COLORS, type FieldOptionColor } from "@/types/custom-fields";
import { fieldOptionColorVar } from "@/lib/custom-fields";
import type { JourneyStage } from "@/types/checkpoints";

export type StageDraft = { name: string; color: FieldOptionColor };

export function StageDialog({
  open,
  stage,
  saving,
  error,
  onClose,
  onSubmit,
}: {
  open: boolean;
  /** `null` = alta. */
  stage: JourneyStage | null;
  saving: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (draft: StageDraft) => void;
}) {
  const [draft, setDraft] = useState<StageDraft>({ name: "", color: "neutral" });

  useEffect(() => {
    if (open) {
      setDraft({ name: stage?.name ?? "", color: stage?.color ?? "cat-1" });
    }
  }, [open, stage]);

  return (
    <Dialog open={open} onOpenChange={(next) => (next ? null : onClose())}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{stage ? "Editar fase" : "Nueva fase"}</DialogTitle>
          <DialogDescription>
            Un tramo del recorrido. Adentro van los checkpoints concretos.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="stage-name">Nombre</Label>
            <Input
              id="stage-name"
              value={draft.name}
              onChange={(event) => setDraft({ ...draft, name: event.target.value })}
              placeholder="Onboarding"
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <Label>Color</Label>
            <div className="flex flex-wrap gap-2">
              {FIELD_OPTION_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  aria-label={`Color ${color}`}
                  aria-pressed={draft.color === color}
                  onClick={() => setDraft({ ...draft, color })}
                  className="h-7 w-7 rounded-full border-2 transition-transform hover:scale-110"
                  style={{
                    backgroundColor: fieldOptionColorVar(color),
                    borderColor:
                      draft.color === color
                        ? "hsl(var(--foreground))"
                        : "transparent",
                  }}
                />
              ))}
            </div>
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
            {saving ? "Guardando…" : stage ? "Guardar" : "Crear fase"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
