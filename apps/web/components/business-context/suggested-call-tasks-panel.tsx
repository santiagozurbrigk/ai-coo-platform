"use client";

import { useState } from "react";
import { Kanban, Sparkles } from "lucide-react";
import { Button } from "@ai-coo/ui";
import { Panel } from "@/components/shared/panel";
import { useToast } from "@/providers/toast-provider";
import {
  getSuggestedTasksForDocument,
  SUGGESTED_TASK_ASSIGNEES,
} from "@/mocks/suggested-call-tasks";
import type {
  ContextDocument,
  SuggestedCallTask,
  SuggestedCallTaskPriority,
} from "@/types/business-context";

const PRIORITY_LABEL: Record<SuggestedCallTaskPriority, string> = {
  high: "Alta",
  medium: "Media",
  low: "Baja",
};

function isFathomCall(document: ContextDocument): boolean {
  return document.sourceType === "fathom" || document.source === "Fathom";
}

export function SuggestedCallTasksPanel({
  document,
}: {
  document: ContextDocument;
}) {
  const { push } = useToast();
  const initial = getSuggestedTasksForDocument(document.id);
  const [tasks, setTasks] = useState(initial);
  const [assignments, setAssignments] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      initial.map((t) => [t.id, t.suggestedAssigneeId])
    )
  );
  const [addingId, setAddingId] = useState<string | null>(null);

  if (!isFathomCall(document) || tasks.length === 0) return null;

  const handleAdd = (task: SuggestedCallTask) => {
    setAddingId(task.id);
    window.setTimeout(() => {
      setAddingId(null);
      setTasks((prev) => prev.filter((t) => t.id !== task.id));
      const assignee = SUGGESTED_TASK_ASSIGNEES.find(
        (m) => m.id === assignments[task.id]
      );
      push({
        title: "Tarea agregada al tablero",
        description: `"${task.description.slice(0, 60)}…" asignada a ${assignee?.name ?? "el equipo"}.`,
        variant: "success",
      });
    }, 600);
  };

  return (
    <Panel
      title="Tareas sugeridas por IA"
      subtitle="Detectadas en la transcripción de la call"
    >
      <ul className="space-y-3">
        {tasks.map((task) => (
          <li
            key={task.id}
            className="rounded-lg border border-border/60 bg-muted/15 p-3 dark:border-white/[0.08]"
          >
            <p className="text-sm leading-snug">{task.description}</p>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-2">
                <label className="text-2xs text-muted-foreground">
                  Responsable
                </label>
                <select
                  className="h-8 rounded-md border border-border bg-background px-2 text-xs"
                  value={assignments[task.id]}
                  onChange={(e) =>
                    setAssignments((prev) => ({
                      ...prev,
                      [task.id]: e.target.value,
                    }))
                  }
                >
                  {SUGGESTED_TASK_ASSIGNEES.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
                <span className="rounded-full bg-violet-500/15 px-2 py-0.5 text-2xs text-violet-700 dark:text-violet-300">
                  <Sparkles className="mr-1 inline h-3 w-3" />
                  {PRIORITY_LABEL[task.suggestedPriority]}
                </span>
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="gap-1.5"
                disabled={addingId === task.id}
                onClick={() => handleAdd(task)}
              >
                <Kanban className="h-3.5 w-3.5" />
                {addingId === task.id ? "Agregando…" : "Agregar al tablero"}
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </Panel>
  );
}
