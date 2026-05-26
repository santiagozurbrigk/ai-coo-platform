"use client";

import { useState } from "react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  FormField,
  Textarea,
} from "@ai-coo/ui";
import type { NoCloseReasonId } from "@/types/closing";

const selectClass =
  "flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm";

const REASONS: { id: NoCloseReasonId; label: string }[] = [
  { id: "price", label: "Objeción de precio" },
  { id: "timing", label: "No es el momento adecuado" },
  { id: "think", label: "Necesita pensarlo" },
  { id: "partner", label: "Debe decidir con su pareja/socio" },
  { id: "not_qualified", label: "No calificado" },
  { id: "no_show", label: "No show" },
  { id: "other", label: "Otro" },
];

export function NoCloseModal({
  open,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (reason: NoCloseReasonId, notes?: string) => void;
}) {
  const [reason, setReason] = useState<NoCloseReasonId>("price");
  const [notes, setNotes] = useState("");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Motivo de no cierre</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <FormField label="Motivo">
            <select
              className={selectClass}
              value={reason}
              onChange={(e) => setReason(e.target.value as NoCloseReasonId)}
            >
              {REASONS.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.label}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Notas adicionales (opcional)">
            <Textarea
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contexto para el equipo y la IA..."
            />
          </FormField>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={() => {
              onSubmit(reason, notes.trim() || undefined);
              onOpenChange(false);
            }}
          >
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
