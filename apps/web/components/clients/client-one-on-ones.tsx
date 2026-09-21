"use client";

/**
 * Las sesiones 1-1 del cliente, con su contador arriba.
 *
 * ⭐ Sección aparte de «Llamadas de venta» y no una lista mezclada. Son dos
 * cosas distintas: la de venta es una sola, es con un lead que todavía no es
 * cliente, y se mira para evaluar al closer. Las 1-1 son la relación de
 * acompañamiento, se miran de a muchas y lo que importa es el ritmo. Mezclarlas
 * haría que "cuántas llamadas lleva" no signifique nada.
 */

import { useCallback, useEffect, useState } from "react";
import { Badge, Button, GlassPanel } from "@ai-coo/ui";
import {
  CalendarClock,
  ChevronDown,
  ExternalLink,
  Loader2,
  Phone,
  Plus,
  Sparkles,
  Upload,
} from "lucide-react";
import {
  getClientOneOnOnesAction,
  retryOneOnOneTasksAction,
  type ClientOneOnOnes,
} from "@/app/fathom/one-on-one-actions";
import { UploadOneOnOneDialog } from "@/components/clients/upload-one-on-one-dialog";
import { notifyClientTasksChanged } from "@/lib/clients/tasks-events";
import { FichaSection } from "@/components/clients/ficha-section";
import { useToast } from "@/providers/toast-provider";
import { cn } from "@/lib/utils";

const VACIO: ClientOneOnOnes = {
  stats: {
    totalCalls: 0,
    firstDate: null,
    lastDate: null,
    everyDays: null,
    daysSinceLast: null,
  },
  calls: [],
};

function formatearFecha(iso: string | null): string {
  if (!iso) return "sin fecha";
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString("es-AR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

/** "hoy", "ayer", "hace 3 días". Un número pelado obliga a hacer la cuenta. */
function formatearAntiguedad(dias: number | null): string | null {
  if (dias == null) return null;
  if (dias === 0) return "hoy";
  if (dias === 1) return "ayer";
  return `hace ${dias} días`;
}

/**
 * El resumen que va al lado del título: «3 · última hace 5 días · cada 12 días».
 *
 * ⭐ Antes era un panel propio con tres números grandes. La franja de arriba de
 * la ficha ya dice cuántas sesiones hay y cuándo fue la última; repetirlo a diez
 * centímetros en letra grande era decir lo mismo dos veces. Lo único que la
 * franja no dice es el ritmo, y con una sola llamada no hay ritmo que medir.
 */
function resumenDeSesiones(stats: ClientOneOnOnes["stats"]): string | undefined {
  if (stats.totalCalls === 0) return undefined;
  const partes = [String(stats.totalCalls)];
  const antiguedad = formatearAntiguedad(stats.daysSinceLast);
  if (antiguedad) partes.push(`última ${antiguedad}`);
  if (stats.everyDays != null) partes.push(`cada ${stats.everyDays} días`);
  return partes.join(" · ");
}

function ReintentarTareas({
  callId,
  onDone,
}: {
  callId: string;
  onDone: () => void;
}) {
  const { push } = useToast();
  const [busy, setBusy] = useState(false);

  const reintentar = async () => {
    setBusy(true);
    const result = await retryOneOnOneTasksAction({ callId });
    setBusy(false);

    if (!result.success) {
      push({ title: "No se pudieron sacar las tareas", description: result.error });
      return;
    }

    const { tasksCreated } = result.data;
    push({
      title:
        tasksCreated > 0
          ? `${tasksCreated} tarea${tasksCreated === 1 ? "" : "s"} cargada${tasksCreated === 1 ? "" : "s"}`
          : "No se encontraron compromisos",
      description:
        tasksCreated > 0
          ? "Están abajo, en Tareas."
          : "En esta llamada no quedó nada concreto para hacer. Podés cargar tareas a mano.",
      variant: tasksCreated > 0 ? "success" : undefined,
    });

    notifyClientTasksChanged();
    onDone();
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <p className="text-[11px] text-muted-foreground">
        Esta llamada no dejó tareas.
      </p>
      <Button
        type="button"
        size="sm"
        variant="outline"
        className="h-7 gap-1.5 text-xs"
        disabled={busy}
        onClick={reintentar}
      >
        {busy ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <Sparkles className="h-3 w-3" />
        )}
        {busy ? "Buscando…" : "Buscar tareas"}
      </Button>
    </div>
  );
}

export function ClientOneOnOnesSection({ clientId }: { clientId: string }) {
  const [data, setData] = useState<ClientOneOnOnes>(VACIO);
  const [loading, setLoading] = useState(true);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const cargar = useCallback(() => {
    let alive = true;
    getClientOneOnOnesAction(clientId)
      .then((next) => {
        if (alive) setData(next);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [clientId]);

  useEffect(() => cargar(), [cargar]);

  return (
    <FichaSection
      icon={Phone}
      title="Sesiones 1-1"
      meta={loading ? undefined : resumenDeSesiones(data.stats)}
      action={
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="gap-1.5"
          onClick={() => setUploadOpen(true)}
        >
          <Upload className="h-3.5 w-3.5" />
          Subir llamada
        </Button>
      }
    >
      {loading ? (
        <GlassPanel className="h-20 animate-pulse p-4" />
      ) : (
        <>
          {data.calls.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border/60 py-10 text-center dark:border-white/[0.08]">
              <CalendarClock className="h-7 w-7 text-muted-foreground" />
              <p className="text-sm font-medium text-foreground">
                Todavía no hay sesiones 1-1
              </p>
              <p className="max-w-sm text-xs text-muted-foreground">
                Pegá el link de Fathom de una llamada y se carga sola, con las
                tareas que quedaron para el cliente y para el coach.
              </p>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="gap-1.5"
                onClick={() => setUploadOpen(true)}
              >
                <Plus className="h-3.5 w-3.5" />
                Subir la primera
              </Button>
            </div>
          ) : (
            <ul className="space-y-2">
              {data.calls.map((call) => {
                const expanded = expandedId === call.id;
                return (
                  <li
                    key={call.id}
                    className="rounded-lg border border-border px-4 py-3 dark:border-white/[0.08]"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <button
                        type="button"
                        className="flex min-w-0 flex-1 items-start gap-2 text-left"
                        onClick={() => setExpandedId(expanded ? null : call.id)}
                      >
                        <ChevronDown
                          className={cn(
                            "mt-0.5 h-4 w-4 shrink-0 text-muted-foreground transition-transform",
                            expanded && "rotate-180"
                          )}
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-medium">{call.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatearFecha(call.date)}
                            {call.durationMinutes != null
                              ? ` · ${call.durationMinutes} min`
                              : ""}
                          </p>
                        </div>
                      </button>

                      <div className="flex shrink-0 items-center gap-1">
                        {call.uploadedManually ? (
                          <Badge variant="outline" className="text-[11px]">
                            subida a mano
                          </Badge>
                        ) : null}
                        {call.fathomUrl ? (
                          <Button size="sm" variant="ghost" asChild>
                            <a
                              href={call.fathomUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label="Ver la grabación en Fathom"
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                          </Button>
                        ) : null}
                      </div>
                    </div>

                    {expanded ? (
                      <div className="mt-3 space-y-3 border-t border-border/60 pt-3 dark:border-white/[0.08]">
                        {call.situationSummary ? (
                          <p className="text-xs leading-relaxed text-muted-foreground">
                            {call.situationSummary}
                          </p>
                        ) : (
                          <p className="text-xs text-muted-foreground">
                            {call.hasTranscript
                              ? "El análisis de esta llamada todavía se está procesando."
                              : "Fathom no devolvió la transcripción de esta llamada, así que no tiene análisis."}
                          </p>
                        )}

                        {call.nextSteps.length > 0 ? (
                          <div className="space-y-1">
                            <p className="text-xs font-medium">Próximos pasos</p>
                            <ul className="list-disc space-y-0.5 pl-4">
                              {call.nextSteps.map((step) => (
                                <li key={step} className="text-xs text-muted-foreground">
                                  {step}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ) : null}

                        {/*
                          ⭐ El reintento aparece sólo donde tiene sentido: hay
                          transcripción para leer y no salió ninguna tarea. Si ya
                          salieron, volver a correrlo las duplicaría.
                        */}
                        {call.hasTranscript && call.tasksCreated === 0 ? (
                          <ReintentarTareas
                            callId={call.id}
                            onDone={cargar}
                          />
                        ) : (
                          <p className="text-[11px] text-muted-foreground">
                            {call.tasksCreated} tarea
                            {call.tasksCreated === 1 ? "" : "s"} de esta llamada, en
                            la sección de abajo.
                          </p>
                        )}
                      </div>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}

      <UploadOneOnOneDialog
        clientId={clientId}
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onUploaded={() => {
          notifyClientTasksChanged();
          cargar();
        }}
      />
    </FichaSection>
  );
}
