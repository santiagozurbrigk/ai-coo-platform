"use client";

import { X } from "lucide-react";
import { Badge, Button, cn } from "@ai-coo/ui";
import { SPRINT_AREA_FOCUS_LABELS } from "@/lib/workboard/constants";
import type { WorkboardSprint } from "@/types/workboard";

function formatSprintDates(start: string, end: string): string {
  const fmt = (iso: string) =>
    new Date(iso + "T12:00:00").toLocaleDateString("es", {
      day: "numeric",
      month: "short",
    });
  return `${fmt(start)} – ${fmt(end)}`;
}

function formatMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} h`;
  return `${h} h ${m} min`;
}

export function SprintRetrospectiveSheet({
  sprint,
  open,
  onOpenChange,
}: {
  sprint: WorkboardSprint | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (!sprint) return null;

  const rate =
    sprint.totalTasks > 0
      ? Math.round((sprint.completedTasks / sprint.totalTasks) * 100)
      : sprint.completionRate;

  return (
    <>
      {open ? (
        <button
          type="button"
          className="fixed inset-0 z-40 cursor-default bg-black/50"
          aria-label="Cerrar retrospectiva"
          onClick={() => onOpenChange(false)}
        />
      ) : null}

      <aside
        className={cn(
          "fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l border-border/40 bg-background p-6 shadow-xl backdrop-blur-xl transition-transform duration-200 dark:border-glass dark:bg-[#111111]/80",
          open ? "translate-x-0" : "translate-x-full"
        )}
        aria-hidden={!open}
      >
        <div className="mb-6 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-medium">Retrospectiva</h2>
            <p className="mt-1 text-sm text-muted-foreground">{sprint.name}</p>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            aria-label="Cerrar"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto text-sm">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Período</p>
            <p>{formatSprintDates(sprint.startDate, sprint.endDate)}</p>
          </div>

          {sprint.areaFocus ? (
            <div>
              <Badge variant="outline" className="text-xs">
                {SPRINT_AREA_FOCUS_LABELS[sprint.areaFocus]}
              </Badge>
            </div>
          ) : null}

          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Completion rate</p>
            <p className="text-lg font-semibold tabular-nums">{rate}%</p>
            <p className="text-muted-foreground">
              {sprint.completedTasks}/{sprint.totalTasks} tareas completadas
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Objetivo</p>
            <p>{sprint.goal || "Sin objetivo definido"}</p>
          </div>

          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Tiempo total registrado</p>
            <p className="font-medium">
              {formatMinutes(sprint.totalMinutesLogged ?? 0)}
            </p>
          </div>

          <p className="rounded-lg border border-border/60 bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
            Evaluá si el objetivo del sprint se cumplió y qué mejorar en el
            próximo ciclo.
          </p>
        </div>

        <Button type="button" variant="outline" className="mt-4" onClick={() => onOpenChange(false)}>
          Cerrar
        </Button>
      </aside>
    </>
  );
}
