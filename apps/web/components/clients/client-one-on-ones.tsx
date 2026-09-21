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
  Phone,
  Plus,
  Upload,
} from "lucide-react";
import {
  getClientOneOnOnesAction,
  type ClientOneOnOnes,
} from "@/app/fathom/one-on-one-actions";
import { UploadOneOnOneDialog } from "@/components/clients/upload-one-on-one-dialog";
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

function Contador({ stats }: { stats: ClientOneOnOnes["stats"] }) {
  const antiguedad = formatearAntiguedad(stats.daysSinceLast);

  return (
    <GlassPanel className="flex flex-wrap items-center gap-x-8 gap-y-3 p-4">
      <div>
        <p className="text-2xl font-semibold tabular-nums">{stats.totalCalls}</p>
        <p className="text-xs text-muted-foreground">
          {stats.totalCalls === 1 ? "sesión 1-1" : "sesiones 1-1"}
        </p>
      </div>

      {stats.lastDate ? (
        <div>
          <p className="text-sm font-medium">{formatearFecha(stats.lastDate)}</p>
          <p className="text-xs text-muted-foreground">
            última{antiguedad ? ` · ${antiguedad}` : ""}
          </p>
        </div>
      ) : null}

      {/*
        El ritmo aparece recién con dos llamadas. Con una sola no hay ritmo que
        medir, y cualquier número ahí sería inventado.
      */}
      {stats.everyDays != null ? (
        <div>
          <p className="text-sm font-medium">cada {stats.everyDays} días</p>
          <p className="text-xs text-muted-foreground">
            desde el {formatearFecha(stats.firstDate)}
          </p>
        </div>
      ) : null}
    </GlassPanel>
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
    <section className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-sm font-medium">
          <Phone className="h-4 w-4" />
          Sesiones 1-1
        </h2>
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
      </div>

      {loading ? (
        <GlassPanel className="h-20 animate-pulse p-4" />
      ) : (
        <>
          <Contador stats={data.stats} />

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
        onUploaded={cargar}
      />
    </section>
  );
}
