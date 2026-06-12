"use client";

import { useState } from "react";
import { History, Plus } from "lucide-react";
import { Button, cn } from "@ai-coo/ui";
import { FilterPills } from "@/components/marketing/filter-pills";
import { useToast } from "@/providers/toast-provider";
import {
  CURRENT_SPRINT_ID,
  mockWorkboardSprints,
} from "@/mocks/workboard-sprints";
import { TASK_AREA_OPTIONS } from "@/lib/workboard/constants";
import type { TaskArea, WorkboardSprint } from "@/types/workboard";

function formatSprintDates(start: string, end: string): string {
  const fmt = (iso: string) =>
    new Date(iso + "T12:00:00").toLocaleDateString("es", {
      day: "numeric",
      month: "short",
    });
  return `${fmt(start)} – ${fmt(end)}`;
}

const GOAL_FILTER_OPTIONS = [
  { value: "all", label: "Todos los objetivos" },
  ...mockWorkboardSprints.map((s) => ({
    value: s.id,
    label: s.goal,
  })),
];

export function WorkboardSprintHeader({
  areaFilter,
  onAreaFilterChange,
}: {
  areaFilter: string;
  onAreaFilterChange: (v: string) => void;
}) {
  const { push } = useToast();
  const [activeSprintId, setActiveSprintId] = useState(CURRENT_SPRINT_ID);
  const [goalFilter, setGoalFilter] = useState("all");
  const [showHistory, setShowHistory] = useState(false);

  const activeSprint =
    mockWorkboardSprints.find((s) => s.id === activeSprintId) ??
    mockWorkboardSprints[0]!;

  const progressPct = Math.round(
    (activeSprint.completedTasks / Math.max(activeSprint.totalTasks, 1)) * 100
  );

  const pastSprints = mockWorkboardSprints.filter(
    (s) => s.id !== activeSprintId
  );

  return (
    <div className="space-y-4 rounded-xl border border-border/60 bg-card/40 p-4 dark:border-white/[0.08] dark:bg-[#1A1A1A]">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <label className="text-xs text-muted-foreground">Sprint</label>
            <select
              className="h-9 rounded-md border border-border bg-background px-3 text-sm font-medium"
              value={activeSprintId}
              onChange={(e) => setActiveSprintId(e.target.value)}
            >
              {mockWorkboardSprints.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            <span className="text-xs text-muted-foreground">
              {formatSprintDates(activeSprint.startDate, activeSprint.endDate)}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            Objetivo: <span className="text-foreground">{activeSprint.goal}</span>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="gap-1.5"
            onClick={() =>
              push({
                title: "Nuevo sprint",
                description: "Mock — en producción se creará con fechas y objetivo.",
              })
            }
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

      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Progreso del sprint</span>
          <span className="font-medium tabular-nums">
            {activeSprint.completedTasks}/{activeSprint.totalTasks} tareas ·{" "}
            {progressPct}%
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full bg-violet-500 transition-all"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
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
        <FilterPills
          options={GOAL_FILTER_OPTIONS}
          value={goalFilter}
          onChange={setGoalFilter}
        />
      </div>

      {showHistory ? (
        <div className="space-y-2 border-t border-border/60 pt-4 dark:border-white/[0.08]">
          <p className="text-xs font-medium text-muted-foreground">
            Sprints anteriores
          </p>
          <ul className="space-y-2">
            {pastSprints.map((sprint) => (
              <SprintHistoryRow key={sprint.id} sprint={sprint} />
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function SprintHistoryRow({ sprint }: { sprint: WorkboardSprint }) {
  const { push } = useToast();
  const rate = Math.round(
    (sprint.completedTasks / Math.max(sprint.totalTasks, 1)) * 100
  );

  return (
    <li
      className={cn(
        "flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/40 px-3 py-2 text-sm dark:border-white/[0.06]"
      )}
    >
      <div>
        <p className="font-medium">{sprint.name}</p>
        <p className="text-xs text-muted-foreground">
          {formatSprintDates(sprint.startDate, sprint.endDate)} · {rate}%
          completado
        </p>
      </div>
      <Button
        type="button"
        size="sm"
        variant="ghost"
        onClick={() =>
          push({
            title: "Retrospectiva",
            description: `Mock de retrospectiva para ${sprint.name}: qué funcionó, qué mejorar.`,
          })
        }
      >
        Ver retrospectiva
      </Button>
    </li>
  );
}
