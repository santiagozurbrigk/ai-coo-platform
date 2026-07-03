"use client";

import { useEffect, useState } from "react";
import {
  Badge,
  Button,
  cn,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  NotchedCard,
  Textarea,
} from "@ai-coo/ui";
import {
  assignTaskToLaunchAction,
  assignTaskToSprintAction,
} from "@/app/workboard/actions";
import {
  STATUS_COLORS,
  STATUS_LABELS,
  TASK_AREA_LABELS,
  TASK_AREA_OPTIONS,
  WORKBOARD_STATUSES,
} from "@/lib/workboard/constants";
import { getAreaClasses, getPriorityClasses, PRIORITY_LABELS } from "@/lib/workboard/styles";
import { useWorkboard } from "@/providers/workboard-provider";
import type { TaskArea, TaskPriority, TaskStatus } from "@/types/workboard";
import { WorkboardTaskResources } from "./workboard-task-resources";

export function WorkboardTaskDetailDialog() {
  const {
    selectedTask,
    setSelectedTask,
    members,
    sprints,
    launches,
    updateTask,
    deleteTask,
    assignTaskToSprint,
    upsertTaskInState,
    isSaving,
  } = useWorkboard();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<TaskStatus>("todo");
  const [area, setArea] = useState<TaskArea>("general");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [assigneeId, setAssigneeId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [tags, setTags] = useState("");
  const [sprintId, setSprintId] = useState("");
  const [launchId, setLaunchId] = useState("");

  useEffect(() => {
    if (!selectedTask) return;
    setTitle(selectedTask.title);
    setDescription(selectedTask.description);
    setStatus(selectedTask.status);
    setArea(selectedTask.area);
    setPriority(selectedTask.priority);
    setAssigneeId(selectedTask.assigneeId ?? "");
    setDueDate(selectedTask.dueDate ?? "");
    setTags(selectedTask.tags.join(", "));
    setSprintId(selectedTask.sprintId ?? "");
    setLaunchId(selectedTask.launchId ?? "");
  }, [selectedTask]);

  if (!selectedTask) return null;

  const statusStyle = STATUS_COLORS[status];

  async function handleSave() {
    const completing =
      status === "done" && selectedTask!.status !== "done";
    await updateTask(selectedTask!.id, {
      title,
      description,
      status,
      area,
      priority,
      assigneeId: assigneeId || null,
      dueDate: dueDate || null,
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    });
    if (!completing) {
      setSelectedTask(null);
    }
  }

  async function handleDelete() {
    await deleteTask(selectedTask!.id);
  }

  return (
    <Dialog
      open={Boolean(selectedTask)}
      onOpenChange={(open) => !open && setSelectedTask(null)}
    >
      <DialogContent className="flex max-h-[min(90vh,720px)] max-w-lg flex-col gap-0 overflow-hidden p-0">
        <DialogHeader className="shrink-0">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <DialogTitle>Detalle de tarea</DialogTitle>
            <Badge
              variant="outline"
              className={cn("shrink-0 text-xs", getAreaClasses(area))}
            >
              {TASK_AREA_LABELS[area]}
            </Badge>
          </div>
          <DialogDescription className="sr-only">
            Formulario de edición de la tarea seleccionada.
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
          <NotchedCard
            tab={
              <span className="inline-flex items-center gap-1.5">
                <span
                  className={cn("inline-block h-1.5 w-1.5 rounded-full", statusStyle.dot)}
                />
                {STATUS_LABELS[status]}
              </span>
            }
            className="shadow-none"
          >
            <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="detail-title">Título</Label>
            <Input
              id="detail-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="detail-desc">Descripción</Label>
            <Textarea
              id="detail-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="detail-status">Estado</Label>
              <select
                id="detail-status"
                className="h-9 w-full rounded-md border border-border bg-background px-2 text-sm"
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
              >
                {WORKBOARD_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="detail-area">Área</Label>
              <select
                id="detail-area"
                className="h-9 w-full rounded-md border border-border bg-background px-2 text-sm"
                value={area}
                onChange={(e) => setArea(e.target.value as TaskArea)}
              >
                {TASK_AREA_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="detail-priority">Prioridad</Label>
              <select
                id="detail-priority"
                className="h-9 w-full rounded-md border border-border bg-background px-2 text-sm"
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
              >
                <option value="low">{PRIORITY_LABELS.low}</option>
                <option value="medium">{PRIORITY_LABELS.medium}</option>
                <option value="high">{PRIORITY_LABELS.high}</option>
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="detail-assignee">Responsable</Label>
            <select
              id="detail-assignee"
              className="h-9 w-full rounded-md border border-border bg-background px-2 text-sm"
              value={assigneeId}
              onChange={(e) => setAssigneeId(e.target.value)}
            >
              <option value="">Sin asignar</option>
              {members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="detail-sprint">Sprint</Label>
            <select
              id="detail-sprint"
              className="h-9 w-full rounded-md border border-border bg-background px-2 text-sm"
              value={sprintId}
              disabled={isSaving}
              onChange={(e) => {
                const next = e.target.value;
                setSprintId(next);
                void assignTaskToSprint(
                  selectedTask.id,
                  next ? next : null
                );
              }}
            >
              <option value="">Sin sprint</option>
              {sprints.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                  {s.status === "active" ? " (activo)" : ""}
                </option>
              ))}
            </select>
          </div>
          {launches.length > 0 ? (
            <div className="space-y-2">
              <Label htmlFor="detail-launch">Lanzamiento</Label>
              <select
                id="detail-launch"
                className="h-9 w-full rounded-md border border-border bg-background px-2 text-sm"
                value={launchId}
                disabled={isSaving}
                onChange={(e) => {
                  const next = e.target.value;
                  setLaunchId(next);
                  void assignTaskToLaunchAction(
                    selectedTask.id,
                    next ? next : null
                  ).then((updated) => {
                    upsertTaskInState(updated);
                  });
                }}
              >
                <option value="">Sin lanzamiento</option>
                {launches.map((launch) => (
                  <option key={launch.id} value={launch.id}>
                    {launch.name}
                  </option>
                ))}
              </select>
            </div>
          ) : null}
          <div className="space-y-2">
            <Label htmlFor="detail-due">Fecha límite</Label>
            <Input
              id="detail-due"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="detail-tags">Etiquetas</Label>
            <Input
              id="detail-tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="Separadas por coma"
            />
          </div>
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            <span
              className={cn(
                "rounded-md border px-2 py-0.5",
                getPriorityClasses(priority)
              )}
            >
              Prioridad: {PRIORITY_LABELS[priority]}
            </span>
            {selectedTask.assignee ? (
              <span>Asignado: {selectedTask.assignee.name}</span>
            ) : null}
          </div>
          <WorkboardTaskResources
            taskId={selectedTask.id}
            task={selectedTask}
            onTaskUpdated={upsertTaskInState}
            disabled={isSaving}
          />
            </div>
          </NotchedCard>
        </div>

        <DialogFooter className="shrink-0 gap-2 sm:justify-between">
          <Button
            type="button"
            variant="outline"
            className="text-destructive hover:text-destructive"
            disabled={isSaving}
            onClick={() => void handleDelete()}
          >
            Eliminar
          </Button>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setSelectedTask(null)}
            >
              Cerrar
            </Button>
            <Button type="button" disabled={isSaving} onClick={() => void handleSave()}>
              {isSaving ? "Guardando…" : "Guardar cambios"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
