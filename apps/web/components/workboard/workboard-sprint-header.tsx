"use client";

import { useCallback, useMemo, useState } from "react";
import { History, Plus } from "lucide-react";
import { Badge, Button, cn } from "@ai-coo/ui";
import { FilterPills } from "@/components/marketing/filter-pills";
import { EmptyState } from "@/components/shared/empty-state";
import { TASK_AREA_OPTIONS, SPRINT_AREA_FOCUS_LABELS } from "@/lib/workboard/constants";
import { sprintAreaToTaskAreaFilter } from "@/lib/workboard/sprint";
import { useWorkboard } from "@/providers/workboard-provider";
import { useToast } from "@/providers/toast-provider";
import type { WorkboardSprint } from "@/types/workboard";
import { CreateSprintModal } from "./create-sprint-modal";
import { SprintRetrospectiveSheet } from "./sprint-retrospective-sheet";

function formatSprintDates(start: string, end: string): string {
  const fmt = (iso: string) =>
    new Date(iso + "T12:00:00").toLocaleDateString("es", {
      day: "numeric",
      month: "short",
    });
  return `${fmt(start)} – ${fmt(end)}`;
}

const AREA_FOCUS_BADGE: Record<string, string> = {
  ventas: "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30",
  marketing: "bg-violet-500/15 text-violet-700 dark:text-violet-300 border-violet-500/30",
  operaciones: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30",
  delivery: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
  producto: "bg-pink-500/15 text-pink-700 dark:text-pink-300 border-pink-500/30",
  general: "bg-muted text-muted-foreground border-border",
};

export function WorkboardSprintHeader({
  areaFilter,
  onAreaFilterChange,
}: {
  areaFilter: string;
  onAreaFilterChange: (v: string) => void;
}) {
  const { push } = useToast();
  const {
    sprints,
    sprintFilterId,
    setSprintFilterId,
    launches,
    launchFilterId,
    setLaunchFilterId,
    assigneeFilterId,
    setAssigneeFilterId,
    members,
    tasks,
    refreshSprints,
  } = useWorkboard();

  const [createOpen, setCreateOpen] = useState(false);
  const [retroSprint, setRetroSprint] = useState<WorkboardSprint | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  const sprintsWithCounts = useMemo(() => {
    return sprints.map((sprint) => {
      const sprintTasks = tasks.filter((t) => t.sprintId === sprint.id);
      const completedTasks = sprintTasks.filter((t) => t.status === "done").length;
      return {
        ...sprint,
        completedTasks,
        totalTasks: sprintTasks.length,
        totalMinutesLogged: sprintTasks.reduce(
          (sum, t) => sum + (t.actualMinutes ?? 0),
          0
        ),
      };
    });
  }, [sprints, tasks]);

  const activeSprint =
    sprintsWithCounts.find((s) => s.status === "active") ??
    sprintsWithCounts[0] ??
    null;

  const displayedSprint =
    sprintFilterId === "all"
      ? activeSprint
      : sprintsWithCounts.find((s) => s.id === sprintFilterId) ?? activeSprint;

  const progressPct = displayedSprint
    ? displayedSprint.totalTasks > 0
      ? Math.round(
          (displayedSprint.completedTasks / displayedSprint.totalTasks) * 100
        )
      : displayedSprint.completionRate
    : 0;

  const completedSprints = sprintsWithCounts.filter(
    (s) => s.status === "completed"
  );

  const handleSprintChange = useCallback(
    (sprintId: string) => {
      setSprintFilterId(sprintId);
      if (sprintId === "all") return;
      const sprint = sprintsWithCounts.find((s) => s.id === sprintId);
      if (sprint?.areaFocus) {
        const area = sprintAreaToTaskAreaFilter(sprint.areaFocus);
        if (area) onAreaFilterChange(area);
      }
    },
    [onAreaFilterChange, setSprintFilterId, sprintsWithCounts]
  );

  async function handleSprintCreated(sprint: WorkboardSprint) {
    await refreshSprints();
    setSprintFilterId(sprint.id);
    if (sprint.areaFocus) {
      const area = sprintAreaToTaskAreaFilter(sprint.areaFocus);
      if (area) onAreaFilterChange(area);
    }
    push({
      title: "Sprint creado ✓",
      description: `${sprint.name} está activo.`,
    });
  }

  if (!activeSprint && sprintsWithCounts.length === 0) {
    return (
      <>
        <EmptyState
          variant="inline"
          icon={<History className="h-5 w-5" />}
          title="Todavía no hay sprints"
          description="Creá el primero para organizar el tablero por ciclo de trabajo."
          action={
            <Button
              type="button"
              size="sm"
              className="gap-1.5"
              onClick={() => setCreateOpen(true)}
            >
              <Plus className="h-3.5 w-3.5" />
              Crear primer sprint
            </Button>
          }
        />
        <CreateSprintModal
          open={createOpen}
          onOpenChange={setCreateOpen}
          onCreated={(s) => void handleSprintCreated(s)}
        />
      </>
    );
  }

  return (
    <div className="space-y-4 rounded-xl border border-border/60 bg-card/40 p-4 dark:border-glass dark:bg-glass dark:backdrop-blur-md">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <label className="text-xs text-muted-foreground">Sprint</label>
            <select
              className="h-9 rounded-md border border-border bg-background px-3 text-sm font-medium"
              value={sprintFilterId}
              onChange={(e) => handleSprintChange(e.target.value)}
            >
              <option value="all">Todas las tareas</option>
              {sprintsWithCounts.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                  {s.status === "active" ? " (activo)" : ""}
                </option>
              ))}
            </select>
            {displayedSprint ? (
              <span className="text-xs text-muted-foreground">
                {formatSprintDates(
                  displayedSprint.startDate,
                  displayedSprint.endDate
                )}
              </span>
            ) : null}
          </div>
          {displayedSprint ? (
            <>
              <p className="text-sm text-muted-foreground">
                Objetivo:{" "}
                <span className="text-foreground">{displayedSprint.goal}</span>
              </p>
              {displayedSprint.areaFocus ? (
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[10px]",
                    AREA_FOCUS_BADGE[displayedSprint.areaFocus] ??
                      AREA_FOCUS_BADGE.general
                  )}
                >
                  Foco: {SPRINT_AREA_FOCUS_LABELS[displayedSprint.areaFocus]}
                </Badge>
              ) : null}
            </>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="gap-1.5"
            onClick={() => setCreateOpen(true)}
          >
            <Plus className="h-3.5 w-3.5" />
            Nuevo sprint
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="gap-1.5"
            onClick={() => setShowHistory((v) => !v)}
          >
            <History className="h-3.5 w-3.5" />
            {showHistory ? "Ocultar historial" : "Ver retrospectiva"}
          </Button>
        </div>
      </div>

      {displayedSprint ? (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Progreso del sprint</span>
            <span className="font-medium tabular-nums">
              {displayedSprint.completedTasks}/{displayedSprint.totalTasks}{" "}
              tareas · {progressPct}%
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-violet-500 transition-all"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      ) : null}

      <FilterPills
        options={[
          { value: "all", label: "Todas las áreas" },
          ...TASK_AREA_OPTIONS.map((o) => ({
            value: o.value,
            label: o.label,
          })),
        ]}
        value={areaFilter}
        onChange={onAreaFilterChange}
      />

      {members.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground">Persona:</span>
          <FilterPills
            options={[
              { value: "all", label: "Todas" },
              { value: "unassigned", label: "Sin asignar" },
              ...members.map((member) => ({
                value: member.id,
                label: member.name,
              })),
            ]}
            value={assigneeFilterId}
            onChange={setAssigneeFilterId}
          />
        </div>
      ) : null}

      {launches.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground">Lanzamiento:</span>
          <FilterPills
            options={[
              { value: "all", label: "Todos" },
              ...launches.map((launch) => ({
                value: launch.id,
                label: launch.name,
              })),
            ]}
            value={launchFilterId}
            onChange={setLaunchFilterId}
          />
        </div>
      ) : null}

      {showHistory ? (
        <div className="space-y-2 border-t border-border/60 pt-4 dark:border-white/[0.08]">
          <p className="text-xs font-medium text-muted-foreground">
            Sprints completados
          </p>
          {completedSprints.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No hay sprints completados aún.
            </p>
          ) : (
            <ul className="space-y-2">
              {completedSprints.map((sprint) => {
                const rate =
                  sprint.totalTasks > 0
                    ? Math.round(
                        (sprint.completedTasks / sprint.totalTasks) * 100
                      )
                    : sprint.completionRate;
                return (
                  <li
                    key={sprint.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/40 px-3 py-2 text-sm dark:border-white/[0.06]"
                  >
                    <div>
                      <p className="font-medium">{sprint.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatSprintDates(sprint.startDate, sprint.endDate)} ·{" "}
                        {rate}% completado
                      </p>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => setRetroSprint(sprint)}
                    >
                      Ver retrospectiva
                    </Button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      ) : null}

      <CreateSprintModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={(s) => void handleSprintCreated(s)}
      />

      <SprintRetrospectiveSheet
        sprint={retroSprint}
        open={Boolean(retroSprint)}
        onOpenChange={(open) => !open && setRetroSprint(null)}
      />
    </div>
  );
}
