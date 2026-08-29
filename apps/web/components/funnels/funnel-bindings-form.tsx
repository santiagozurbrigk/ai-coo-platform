"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Check } from "lucide-react";
import { cn } from "@ai-coo/ui";
import { setFunnelStepBindingAction } from "@/app/funnels/actions";
import type { StepBindingRowView } from "@/app/funnels/actions";
import { useToast } from "@/providers/toast-provider";

const UNBOUND = "__sin_fuente__";

/**
 * Configuración de qué fuente alimenta cada paso del embudo.
 *
 * Dejar un paso sin fuente es una opción legítima y explícita, no un olvido: el
 * paso resuelve como "sin datos", que es distinto de cero
 * (docs/FUNNELS_ARCHITECTURE.md §9.1).
 *
 * Cada fila muestra además qué herramienta le asigna el documento fuente a ese
 * paso, para que se vea cuándo lo que hay conectado no es lo que el estándar
 * pide.
 */
export function FunnelBindingsForm({
  funnelId,
  rows,
}: {
  funnelId: string;
  rows: StepBindingRowView[];
}) {
  const router = useRouter();
  const { push } = useToast();
  const [isPending, startTransition] = useTransition();
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(rows.map((r) => [r.stepId, r.currentSourceId ?? UNBOUND]))
  );
  const [savedStep, setSavedStep] = useState<string | null>(null);

  function handleChange(stepId: string, value: string) {
    const previous = values[stepId] ?? UNBOUND;
    setValues((prev) => ({ ...prev, [stepId]: value }));
    setSavedStep(null);

    startTransition(async () => {
      const result = await setFunnelStepBindingAction(
        funnelId,
        stepId,
        value === UNBOUND ? null : value
      );

      if (!result.ok) {
        setValues((prev) => ({ ...prev, [stepId]: previous }));
        push({ title: "No se pudo guardar", description: result.error });
        return;
      }

      setSavedStep(stepId);
      router.refresh();
    });
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-card dark:border-glass dark:bg-glass">
      <table className="w-full min-w-[820px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-border text-left">
            <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Etapa
            </th>
            <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Paso
            </th>
            <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Fuente de datos
            </th>
            <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Según el estándar
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const value = values[row.stepId] ?? UNBOUND;
            const unbound = value === UNBOUND;
            const noOptions = row.options.length === 0;

            return (
              <tr key={row.stepId} className="border-b border-border/60 last:border-b-0">
                <td className="px-4 py-3 font-medium text-primary">{row.stageLabel}</td>
                <td className="px-4 py-3">
                  <p>{row.stepLabel}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{row.metricLabel}</p>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <select
                      value={value}
                      disabled={isPending || noOptions}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                        handleChange(row.stepId, e.target.value)
                      }
                      className={cn(
                        "w-full max-w-[280px] rounded-lg border bg-background px-3 py-1.5 text-sm",
                        unbound ? "border-amber-500/40 text-muted-foreground" : "border-border"
                      )}
                    >
                      <option value={UNBOUND}>Sin fuente — no se mide</option>
                      {row.options.map((option) => (
                        <option key={option.sourceId} value={option.sourceId}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    {savedStep === row.stepId ? (
                      <Check className="h-4 w-4 shrink-0 text-emerald-500" />
                    ) : null}
                  </div>
                  {noOptions ? (
                    <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                      No hay ninguna fuente disponible para esta etapa todavía.
                    </p>
                  ) : null}
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    {unbound ? (
                      <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-500" />
                    ) : null}
                    {row.documentTool}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
