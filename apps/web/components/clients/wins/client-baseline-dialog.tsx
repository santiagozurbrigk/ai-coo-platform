"use client";

/**
 * A · Nicho y baseline del cliente.
 *
 * Vive en el dashboard porque es donde el hueco se nota: ves "sin medir" y
 * arreglás la causa ahí mismo, sin ir a buscar otra pantalla.
 */

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
import type { ClientBaseline } from "@/types/wins";

export type BaselineDraft = {
  niche: string;
  metricKey: string;
  metricValue: string;
  metricUnit: string;
  capturedAt: string;
};

export function ClientBaselineDialog({
  open,
  clientName,
  niche,
  baseline,
  saving,
  error,
  onClose,
  onSubmit,
}: {
  open: boolean;
  clientName: string;
  niche: string | null;
  baseline: ClientBaseline | null;
  saving: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (draft: BaselineDraft) => void;
}) {
  const [draft, setDraft] = useState<BaselineDraft>({
    niche: "",
    metricKey: "",
    metricValue: "",
    metricUnit: "",
    capturedAt: "",
  });

  useEffect(() => {
    if (!open) return;
    setDraft({
      niche: niche ?? "",
      metricKey: baseline?.metricKey ?? "",
      metricValue: baseline ? String(baseline.metricValue) : "",
      metricUnit: baseline?.metricUnit ?? "",
      capturedAt: baseline?.capturedAt?.slice(0, 10) ?? "",
    });
  }, [open, niche, baseline]);

  function patch(changes: Partial<BaselineDraft>) {
    setDraft((current) => ({ ...current, ...changes }));
  }

  return (
    <Dialog open={open} onOpenChange={(next) => (next ? null : onClose())}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nicho y punto de partida</DialogTitle>
          <DialogDescription>
            De <strong>{clientName}</strong>. El punto de partida es cómo estaba antes
            de empezar: con él, el recorrido arranca el día uno en vez de en su primer
            win con número.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="client-niche">Nicho</Label>
            <Input
              id="client-niche"
              value={draft.niche}
              onChange={(event) => patch({ niche: event.target.value })}
              placeholder="coaching fitness"
            />
          </div>

          <div className="space-y-2 rounded-lg border border-border/60 p-3">
            <Label>Punto de partida (opcional)</Label>
            <p className="text-xs text-muted-foreground">
              Usá la misma clave y unidad que después vas a cargar en sus wins; si no,
              no se pueden comparar.
            </p>
            <div className="grid gap-2 sm:grid-cols-3">
              <Input
                aria-label="Clave"
                value={draft.metricKey}
                onChange={(event) => patch({ metricKey: event.target.value })}
                placeholder="facturacion"
              />
              <Input
                aria-label="Valor"
                inputMode="decimal"
                value={draft.metricValue}
                onChange={(event) => patch({ metricValue: event.target.value })}
                placeholder="500"
              />
              <Input
                aria-label="Unidad"
                value={draft.metricUnit}
                onChange={(event) => patch({ metricUnit: event.target.value })}
                placeholder="USD"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="baseline-date" className="text-xs">
                Cuándo se midió
              </Label>
              <Input
                id="baseline-date"
                type="date"
                max={new Date().toISOString().slice(0, 10)}
                value={draft.capturedAt}
                onChange={(event) => patch({ capturedAt: event.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Sin fecha no sirve para medir un plazo, así que no cuenta como punto.
              </p>
            </div>
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button type="button" onClick={() => onSubmit(draft)} disabled={saving}>
            {saving ? "Guardando…" : "Guardar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
