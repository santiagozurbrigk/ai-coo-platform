"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Check } from "lucide-react";
import { cn } from "@ai-coo/ui";
import { setFunnelStepBindingAction } from "@/app/funnels/actions";
import type { FunnelFormOption, StepBindingRowView } from "@/app/funnels/actions";
import type { GHLStageOption } from "@/app/ghl/opportunity-actions";
import type { VTurbPlayerOption } from "@/app/vturb/actions";
import type { WebinarJamWebinarOption } from "@/app/webinarjam/actions";
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
  ghlStages = [],
  vturbPlayers = [],
  webinarJamWebinars = [],
  forms = [],
}: {
  funnelId: string;
  rows: StepBindingRowView[];
  /**
   * Etapas de GHL disponibles para las fuentes que las piden. Vacío significa
   * que la org no sincronizó sus pipelines todavía.
   */
  ghlStages?: GHLStageOption[];
  /** Videos de VTurb disponibles. Vacío = falta conectar o sincronizar VTurb. */
  vturbPlayers?: VTurbPlayerOption[];
  /** Webinars de WebinarJam disponibles. */
  webinarJamWebinars?: WebinarJamWebinarOption[];
  /** Formularios de Typeform / Google Forms de la org. */
  forms?: FunnelFormOption[];
}) {
  const router = useRouter();
  const { push } = useToast();
  const [isPending, startTransition] = useTransition();
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(rows.map((r) => [r.stepId, r.currentSourceId ?? UNBOUND]))
  );
  const [savedStep, setSavedStep] = useState<string | null>(null);
  // Cada fuente configurable pide un solo parámetro (la etapa de GHL o el video
  // de VTurb), así que alcanza con guardar un valor por paso más su clave.
  const [configValues, setConfigValues] = useState<Record<string, string>>(
    Object.fromEntries(
      rows.map((r) => {
        const value =
          r.currentConfig.stageId ??
          r.currentConfig.playerId ??
          r.currentConfig.webinarId ??
          r.currentConfig.formId;
        return [r.stepId, typeof value === "string" ? value : ""];
      })
    )
  );

  function save(
    stepId: string,
    sourceId: string,
    configKey: string | null,
    configValue: string,
    rollback: () => void
  ) {
    setSavedStep(null);
    startTransition(async () => {
      const result = await setFunnelStepBindingAction(
        funnelId,
        stepId,
        sourceId === UNBOUND ? null : sourceId,
        configKey && configValue ? { [configKey]: configValue } : {}
      );

      if (!result.ok) {
        rollback();
        push({ title: "No se pudo guardar", description: result.error });
        return;
      }

      setSavedStep(stepId);
      router.refresh();
    });
  }

  function handleChange(stepId: string, value: string) {
    const previous = values[stepId] ?? UNBOUND;
    setValues((prev) => ({ ...prev, [stepId]: value }));
    // Cambiar de fuente descarta el parámetro elegido para la anterior: una
    // etapa de GHL no significa nada para una fuente de VTurb, ni al revés.
    setConfigValues((prev) => ({ ...prev, [stepId]: "" }));

    save(stepId, value, null, "", () => {
      setValues((prev) => ({ ...prev, [stepId]: previous }));
      setConfigValues((prev) => ({ ...prev, [stepId]: "" }));
    });
  }

  function handleConfigChange(
    stepId: string,
    sourceId: string,
    configKey: string,
    configValue: string
  ) {
    const previous = configValues[stepId] ?? "";
    setConfigValues((prev) => ({ ...prev, [stepId]: configValue }));
    save(stepId, sourceId, configKey, configValue, () =>
      setConfigValues((prev) => ({ ...prev, [stepId]: previous }))
    );
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
            const configField = row.options.find((o) => o.sourceId === value)?.configFields[0];

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
                  {configField ? (
                    <ConfigPicker
                      field={configField}
                      value={configValues[row.stepId] ?? ""}
                      disabled={isPending}
                      ghlStages={ghlStages}
                      vturbPlayers={vturbPlayers}
                      webinarJamWebinars={webinarJamWebinars}
                      forms={forms}
                      onChange={(next) =>
                        handleConfigChange(row.stepId, value, configField.key, next)
                      }
                    />
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

/**
 * Selector del parámetro que pide una fuente.
 *
 * Vive acá y no en cada fila porque el patrón es el mismo para las dos fuentes
 * configurables: sin elegir, el paso resuelve a "sin datos"; sin catálogo
 * sincronizado, lo que corresponde es decirlo, no mostrar un selector vacío.
 */
function ConfigPicker({
  field,
  value,
  disabled,
  ghlStages,
  vturbPlayers,
  webinarJamWebinars,
  forms,
  onChange,
}: {
  field: { key: string; label: string; kind: string };
  value: string;
  disabled: boolean;
  ghlStages: GHLStageOption[];
  vturbPlayers: VTurbPlayerOption[];
  webinarJamWebinars: WebinarJamWebinarOption[];
  forms: FunnelFormOption[];
  onChange: (next: string) => void;
}) {
  const EMPTY_MESSAGE: Record<string, string> = {
    vturb_player: "Conectá VTurb en Integraciones y sincronizá los videos para poder elegir uno.",
    webinarjam_webinar:
      "Conectá WebinarJam en Integraciones y sincronizá los webinars para poder elegir uno.",
    ghl_stage: "Sincronizá los pipelines de GoHighLevel en Integraciones para poder elegir la etapa.",
    form: "Conectá Typeform o Google Forms en Integraciones para poder elegir un formulario.",
  };
  const empty = EMPTY_MESSAGE[field.kind] ?? EMPTY_MESSAGE.ghl_stage;

  const options =
    field.kind === "vturb_player"
      ? vturbPlayers.map((player) => ({
          value: player.playerId,
          label: player.name ?? player.playerId,
          // Sin pitch time no se puede medir "llegaron al CTA": conviene verlo
          // antes de elegir, no después de que el embudo diga "sin datos".
          hint: player.pitchTime ? null : "sin pitch time",
        }))
      : field.kind === "form"
      ? forms.map((form) => ({
          value: form.formId,
          label: form.title,
          hint: form.platform,
        }))
      : field.kind === "webinarjam_webinar"
      ? webinarJamWebinars.map((webinar) => ({
          value: webinar.webinarId,
          label: webinar.name ?? webinar.webinarId,
          // Mismo criterio que VTurb: sin el segundo de la oferta, el stick rate
          // no se puede medir.
          hint: webinar.pitchSecond ? null : "sin segundo de oferta",
        }))
      : ghlStages.map((stage) => ({
          value: stage.stageId,
          label: `${stage.pipelineName ?? "Pipeline"} · ${stage.stageName ?? stage.stageId}`,
          hint: null,
        }));

  if (options.length === 0) {
    return <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">{empty}</p>;
  }

  return (
    <select
      value={value}
      disabled={disabled}
      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onChange(e.target.value)}
      className={cn(
        "mt-2 w-full max-w-[280px] rounded-lg border bg-background px-3 py-1.5 text-sm",
        value ? "border-border" : "border-amber-500/40 text-muted-foreground"
      )}
    >
      <option value="">{`Elegí ${field.label.toLowerCase()}`}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
          {option.hint ? ` (${option.hint})` : ""}
        </option>
      ))}
    </select>
  );
}
