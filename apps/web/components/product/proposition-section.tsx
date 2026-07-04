"use client";

import { useState, useTransition } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { Button } from "@ai-coo/ui";
import { saveValuePropositionAction } from "@/app/product/actions";
import { useToast } from "@/providers/toast-provider";
import type { ValueProposition } from "@/types/product";

const FIELDS: {
  label: string;
  key: keyof ValueProposition;
  colorClass: string;
  borderClass: string;
}[] = [
  { label: "Avatar", key: "avatar", colorClass: "text-violet-600 dark:text-violet-400", borderClass: "border-violet-500/40" },
  { label: "Resultado", key: "result", colorClass: "text-green-600 dark:text-green-400", borderClass: "border-green-500/40" },
  { label: "Sin esto...", key: "painRemoved", colorClass: "text-red-600 dark:text-red-400", borderClass: "border-red-500/40" },
  { label: "En cuánto tiempo", key: "timeframe", colorClass: "text-amber-600 dark:text-amber-400", borderClass: "border-amber-500/40" },
];

export function PropositionSection({
  initial,
  canEdit = true,
  onSaved,
}: {
  initial: ValueProposition;
  canEdit?: boolean;
  onSaved?: () => void;
}) {
  const { push } = useToast();
  const [proposition, setProposition] = useState(initial);
  const [dirty, setDirty] = useState(false);
  const [pending, startTransition] = useTransition();

  const handleSave = () => {
    startTransition(async () => {
      const result = await saveValuePropositionAction(proposition);
      if (!result.success) {
        push({ title: "No se pudo guardar", description: result.error });
        return;
      }
      setProposition(result.data);
      setDirty(false);
      push({
        title: "Propuesta guardada",
        description: "El Agente ya puede usar este posicionamiento.",
        variant: "success",
      });
      onSaved?.();
    });
  };

  return (
    <section id="proposition" className="scroll-mt-6 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-foreground">Propuesta de valor</h2>
        {canEdit && dirty ? (
          <Button
            type="button"
            size="sm"
            className="bg-violet-600 hover:bg-violet-700"
            disabled={pending}
            onClick={handleSave}
          >
            {pending ? <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> : null}
            Guardar propuesta
          </Button>
        ) : null}
      </div>
      <div className="mx-auto max-w-2xl">
        <div className="glass-liquid-subtle rounded-2xl border border-border p-8 text-center dark:border-white/8">
          <p className="mb-6 text-xs uppercase tracking-wider text-muted-foreground">
            Propuesta de valor del negocio
          </p>
          <div className="space-y-2 text-2xl font-semibold leading-relaxed text-foreground">
            <span className="text-muted-foreground">Ayudo a </span>
            <span className={`border-b ${FIELDS[0].borderClass} ${FIELDS[0].colorClass}`}>
              {proposition.avatar || "…"}
            </span>
            <span className="text-muted-foreground"> a lograr </span>
            <span className={`border-b ${FIELDS[1].borderClass} ${FIELDS[1].colorClass}`}>
              {proposition.result || "…"}
            </span>
            <br />
            <span className="text-muted-foreground">sin </span>
            <span className={`border-b ${FIELDS[2].borderClass} ${FIELDS[2].colorClass}`}>
              {proposition.painRemoved || "…"}
            </span>
            <span className="text-muted-foreground"> en </span>
            <span className={`border-b ${FIELDS[3].borderClass} ${FIELDS[3].colorClass}`}>
              {proposition.timeframe || "…"}
            </span>
          </div>
          <div className="mt-8 grid grid-cols-1 gap-4 text-left sm:grid-cols-2">
            {FIELDS.map((field) => (
              <div key={field.key}>
                <label className="mb-1 block text-[10px] uppercase tracking-wider text-muted-foreground">
                  {field.label}
                </label>
                <input
                  value={proposition[field.key]}
                  disabled={!canEdit || pending}
                  onChange={(e) => {
                    setProposition((prev) => ({
                      ...prev,
                      [field.key]: e.target.value,
                    }));
                    setDirty(true);
                  }}
                  className="w-full rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm text-foreground transition-colors focus:border-violet-500/40 focus:outline-none disabled:opacity-60 dark:border-white/8 dark:bg-white/4"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-violet-500/15 bg-violet-500/5 p-4">
          <div className="mb-2 flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-violet-500 dark:text-violet-400" />
            <p className="text-xs text-violet-600 dark:text-violet-400">
              Cómo el Agente usa esta información
            </p>
          </div>
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            Al guardar, esta propuesta se incluye en el contexto del Agente de negocio
            junto con avatar, productos y frameworks. Usá el mismo lenguaje y
            posicionamiento en ventas y marketing.
          </p>
        </div>
      </div>
    </section>
  );
}
