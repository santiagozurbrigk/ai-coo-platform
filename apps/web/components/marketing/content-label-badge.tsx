"use client";

import { useState, useTransition } from "react";
import { Button, cn } from "@ai-coo/ui";
import { updateContentLabelAction } from "@/app/marketing/actions";
import type { ContentLabel } from "@/lib/content/label-content";

const LABELS: ContentLabel[] = [
  "AUTORIDAD",
  "ATRACCION",
  "NUTRICION",
  "VENTA",
];

const LABEL_COLORS: Record<ContentLabel, string> = {
  AUTORIDAD: "bg-violet-500/15 text-violet-700 dark:text-violet-300 border-violet-500/30",
  ATRACCION: "bg-pink-500/15 text-pink-700 dark:text-pink-300 border-pink-500/30",
  NUTRICION: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
  VENTA: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30",
};

type Props = {
  assetId: string;
  aiLabel: ContentLabel | null;
  manualLabel: ContentLabel | null;
  confidence: number | null;
  onLabelChange?: (newLabel: ContentLabel | null) => void;
};

export function ContentLabelBadge({
  assetId,
  aiLabel,
  manualLabel,
  confidence,
  onLabelChange,
}: Props) {
  const effective = manualLabel ?? aiLabel;
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<ContentLabel | null>(effective);
  const [pending, startTransition] = useTransition();

  if (!effective && !open) {
    return (
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setSelected(null);
          setOpen(true);
        }}
        className="inline-flex items-center gap-1 rounded-md border border-dashed border-border px-2 py-0.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary"
      >
        + Etiquetar
      </button>
    );
  }

  function handleSave() {
    startTransition(async () => {
      const res = await updateContentLabelAction(assetId, selected);
      if (res.success) {
        onLabelChange?.(selected);
        setOpen(false);
      }
    });
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setSelected(manualLabel ?? aiLabel);
          setOpen((v) => !v);
        }}
        className={cn(
          "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium transition-opacity hover:opacity-90",
          effective && LABEL_COLORS[effective]
        )}
      >
        {effective ?? "Sin etiqueta"}
        {manualLabel && (
          <span className="text-[10px] opacity-70" title="Editado manualmente">
            ✎
          </span>
        )}
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setOpen(false);
            }}
          />
          <div
            className="absolute left-0 top-full z-50 mt-1 w-56 rounded-lg border border-border bg-popover p-3 shadow-lg"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <p className="text-xs text-muted-foreground mb-2">
              Etiqueta actual:{" "}
              <strong>{effective ?? "—"}</strong>
            </p>
            {aiLabel && !manualLabel && confidence != null && (
              <p className="text-xs text-muted-foreground mb-3">
                Sugerida por IA ({Math.round(confidence * 100)}% confianza)
              </p>
            )}
            {manualLabel && aiLabel && (
              <p className="text-xs text-muted-foreground mb-3">
                IA sugirió {aiLabel} ({confidence != null ? `${Math.round(confidence * 100)}%` : "—"})
              </p>
            )}
            <p className="text-xs font-medium mb-2">Cambiar a:</p>
            <div className="space-y-1.5 mb-3">
              {LABELS.map((label) => (
                <label
                  key={label}
                  className="flex cursor-pointer items-center gap-2 text-xs"
                >
                  <input
                    type="radio"
                    name={`label-${assetId}`}
                    checked={selected === label}
                    onChange={() => setSelected(label)}
                  />
                  {label}
                </label>
              ))}
            </div>
            <Button size="sm" className="w-full" disabled={pending} onClick={handleSave}>
              {pending ? "Guardando…" : "Guardar"}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

export function ContentLabelFilterBadge({
  label,
  active,
  onClick,
}: {
  label: ContentLabel | "all";
  active: boolean;
  onClick: () => void;
}) {
  const text = label === "all" ? "Todas" : label;
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-md px-3 py-1.5 text-xs font-medium",
        active
          ? "bg-primary text-primary-foreground"
          : "bg-muted text-muted-foreground"
      )}
    >
      {text}
    </button>
  );
}

export { LABEL_COLORS };
