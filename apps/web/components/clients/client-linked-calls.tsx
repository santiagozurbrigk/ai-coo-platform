"use client";

import { useEffect, useState } from "react";
import { Button } from "@ai-coo/ui";
import { ChevronDown, ExternalLink, Phone, TrendingUp, X } from "lucide-react";
import {
  getCloserEvolutionAction,
  getTeamAverageEvolutionAction,
  getTeamRankingAction,
} from "@/app/sales/actions";
import { ClientCallAnalysisSection } from "@/components/clients/client-call-analysis";
import { CloserEvolutionChart } from "@/components/clients/closer-evolution-chart";
import {
  TeamCallRanking,
  TeamPerformanceSummary,
} from "@/components/sales/team-call-ranking";
import type { ClientLinkedCall } from "@/types/clients";
import type { TeamRankingEntry } from "@/types/call-analysis";
import { cn } from "@/lib/utils";

function LinkedCallsEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
      <Phone className="h-8 w-8 text-muted-foreground" />
      <p className="text-sm font-medium text-foreground">Sin llamadas vinculadas</p>
      <p className="max-w-xs text-xs text-muted-foreground">
        Conectá Fathom y vinculá este cliente para ver el análisis de sus llamadas
        aquí.
      </p>
    </div>
  );
}

function CallAnalysisEmptyState() {
  return (
    <div className="mt-4 flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border/60 bg-muted/5 px-4 py-8 text-center dark:border-white/[0.08]">
      <p className="text-sm font-medium text-foreground">Análisis no disponible</p>
      <p className="max-w-sm text-xs text-muted-foreground">
        Esta llamada aún no tiene análisis. Se generará automáticamente cuando Fathom
        esté conectado y la transcripción esté procesada.
      </p>
    </div>
  );
}

function CloserEvolutionSheet({
  open,
  onOpenChange,
  closerName,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  closerName: string;
}) {
  const [scores, setScores] = useState<number[]>([]);
  const [teamAverage, setTeamAverage] = useState<number[]>([]);
  const [ranking, setRanking] = useState<TeamRankingEntry[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    setLoading(true);

    Promise.all([
      getCloserEvolutionAction(closerName),
      getTeamAverageEvolutionAction(),
      getTeamRankingAction(),
    ])
      .then(([evolution, avg, team]) => {
        if (cancelled) return;
        setScores(evolution);
        setTeamAverage(avg);
        setRanking(team);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, closerName]);

  return (
    <>
      {open ? (
        <button
          type="button"
          className="fixed inset-0 z-40 cursor-default bg-black/50"
          aria-label="Cerrar panel de evolución"
          onClick={() => onOpenChange(false)}
        />
      ) : null}

      <aside
        className={cn(
          "fixed right-0 top-0 z-50 flex h-full w-full max-w-lg flex-col border-l border-border/40 bg-background p-6 shadow-xl transition-transform duration-200 dark:border-white/[0.08] dark:bg-[#0A0A0A]",
          open ? "translate-x-0" : "translate-x-full"
        )}
        aria-hidden={!open}
      >
        <div className="mb-6 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-medium">Evolución del closer</h2>
            <p className="text-xs text-muted-foreground">{closerName}</p>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            aria-label="Cerrar"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 space-y-8 overflow-y-auto">
          {loading ? (
            <p className="text-sm text-muted-foreground">Cargando evolución…</p>
          ) : (
            <>
              <CloserEvolutionChart
                closerName={closerName}
                scores={scores}
                teamAverage={teamAverage}
              />
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Ranking del equipo
                </h3>
                <TeamCallRanking entries={ranking} />
              </div>
            </>
          )}
        </div>
      </aside>
    </>
  );
}

export function ClientLinkedCallsSection({
  calls,
}: {
  calls: ClientLinkedCall[];
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [evolutionOpen, setEvolutionOpen] = useState(false);
  const [evolutionCloser, setEvolutionCloser] = useState("Laura Martínez");

  const openEvolution = (closerName: string) => {
    setEvolutionCloser(closerName);
    setEvolutionOpen(true);
  };

  return (
    <>
      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-medium">Llamadas del cliente</h2>
          {calls.length > 0 ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="gap-1.5"
              onClick={() =>
                openEvolution(calls[0]?.closerName ?? "Laura Martínez")
              }
            >
              <TrendingUp className="h-3.5 w-3.5" />
              Ver evolución del closer
            </Button>
          ) : null}
        </div>

        {calls.length === 0 ? (
          <LinkedCallsEmptyState />
        ) : (
        <ul className="space-y-2">
          {calls.map((call) => {
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
                    onClick={() =>
                      setExpandedId(expanded ? null : call.id)
                    }
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
                        {call.date} · {call.duration}
                        {call.closerName ? ` · ${call.closerName}` : ""}
                      </p>
                    </div>
                  </button>
                  <Button size="sm" variant="ghost" asChild>
                    <a
                      href={call.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="gap-1"
                    >
                      Fathom
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </Button>
                </div>

                {expanded && call.analysis ? (
                  <ClientCallAnalysisSection
                    analysis={call.analysis}
                    durationLabel={call.duration}
                  />
                ) : null}
                {expanded && !call.analysis ? <CallAnalysisEmptyState /> : null}
              </li>
            );
          })}
        </ul>
        )}
      </section>

      <CloserEvolutionSheet
        open={evolutionOpen}
        onOpenChange={setEvolutionOpen}
        closerName={evolutionCloser}
      />
    </>
  );
}
