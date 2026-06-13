"use client";

import { useState } from "react";
import type React from "react";
import { CalendarDays, Clock, Kanban, Plus } from "lucide-react";
import { FilterPills } from "@/components/marketing/filter-pills";
import { TASK_AREA_OPTIONS } from "@/lib/workboard/constants";
import { WORKBOARD_STATUSES, STATUS_LABELS } from "@/lib/workboard/constants";
import { useWorkboard } from "@/providers/workboard-provider";
import type { TaskArea, TaskPriority, TaskStatus } from "@/types/workboard";
import { WorkboardCalendar } from "./workboard-calendar";
import { WorkboardKanban } from "./workboard-kanban";
import { LogTimeModal } from "./log-time-modal";
import { WorkboardTaskDetailDialog } from "./workboard-task-detail-dialog";
import { WorkboardTimeReport } from "./workboard-time-report";
import { WorkboardSprintHeader } from "./workboard-sprint-header";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
  Label,
  Textarea,
} from "@ai-coo/ui";

const AREA_FILTER_OPTIONS = [
  { value: "all", label: "Todas las áreas" },
  ...TASK_AREA_OPTIONS.map((o) => ({ value: o.value, label: o.label })),
];

const VIEW_OPTIONS = [
  { value: "board", label: "Tablero" },
  { value: "calendar", label: "Calendario" },
  { value: "time", label: "Tiempo por persona" },
];

export function WorkboardShell() {
  const {
    areaFilter,
    setAreaFilter,
    view,
    setView,
    members,
    createTask,
    isSaving,
    pendingCompleteTask,
    confirmCompleteWithTime,
    skipTimeAndComplete,
  } = useWorkboard();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<TaskStatus>("todo");
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    area: "general" as TaskArea,
    priority: "medium" as TaskPriority,
    assigneeId: "",
    dueDate: "",
    tags: "",
  });

  const emptyMembers = members.length === 0;

  async function handleAddTask() {
    if (!newTask.title.trim()) return;
    await createTask({
      title: newTask.title,
      description: newTask.description,
      status: selectedStatus,
      area: newTask.area,
      priority: newTask.priority,
      assigneeId: newTask.assigneeId || null,
      dueDate: newTask.dueDate || null,
      tags: newTask.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    });
    setNewTask({
      title: "",
      description: "",
      area: "general",
      priority: "medium",
      assigneeId: "",
      dueDate: "",
      tags: "",
    });
    setIsAddOpen(false);
  }

  return (
    <div className="workboard-surface space-y-4">
      {emptyMembers ? (
        <p className="rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
          Invitá miembros a tu organización para asignar tareas. Mientras tanto,
          cualquier usuario con acceso al tablero puede crear y mover tareas sin
          importar su rol.
        </p>
      ) : null}

      {view !== "time" ? (
        <WorkboardSprintHeader
          areaFilter={areaFilter}
          onAreaFilterChange={setAreaFilter}
        />
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <FilterPills
            options={VIEW_OPTIONS}
            value={view}
            onChange={(v) => setView(v as "board" | "calendar" | "time")}
          />
          {view === "time" ? (
            <FilterPills
              options={AREA_FILTER_OPTIONS}
              value={areaFilter}
              onChange={setAreaFilter}
            />
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden text-xs text-muted-foreground sm:inline">
            {view === "board" ? (
              <span className="inline-flex items-center gap-1">
                <Kanban className="h-3.5 w-3.5" /> Vista tablero
              </span>
            ) : view === "calendar" ? (
              <span className="inline-flex items-center gap-1">
                <CalendarDays className="h-3.5 w-3.5" /> Vista calendario
              </span>
            ) : (
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" /> Tiempo por persona
              </span>
            )}
          </span>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-1.5 h-4 w-4" />
                Nueva tarea
              </Button>
            </DialogTrigger>
            <AddTaskDialogContent
              newTask={newTask}
              setNewTask={setNewTask}
              selectedStatus={selectedStatus}
              setSelectedStatus={setSelectedStatus}
              members={members}
              isSaving={isSaving}
              onSubmit={() => void handleAddTask()}
              onCancel={() => setIsAddOpen(false)}
            />
          </Dialog>
        </div>
      </div>

      {view === "board" ? (
        <WorkboardKanban />
      ) : view === "calendar" ? (
        <WorkboardCalendar />
      ) : (
        <WorkboardTimeReport />
      )}
      <LogTimeModal
        open={Boolean(pendingCompleteTask)}
        taskId={pendingCompleteTask?.id ?? ""}
        taskTitle={pendingCompleteTask?.title ?? ""}
        estimatedMinutes={pendingCompleteTask?.estimatedMinutes}
        onConfirm={async (minutes, note) => {
          await confirmCompleteWithTime(minutes, note);
        }}
        onSkip={async () => {
          await skipTimeAndComplete();
        }}
      />
      <WorkboardTaskDetailDialog />
    </div>
  );
}

function AddTaskDialogContent({
  newTask,
  setNewTask,
  selectedStatus,
  setSelectedStatus,
  members,
  isSaving,
  onSubmit,
  onCancel,
}: {
  newTask: {
    title: string;
    description: string;
    area: TaskArea;
    priority: TaskPriority;
    assigneeId: string;
    dueDate: string;
    tags: string;
  };
  setNewTask: React.Dispatch<
    React.SetStateAction<typeof newTask>
  >;
  selectedStatus: TaskStatus;
  setSelectedStatus: (s: TaskStatus) => void;
  members: { id: string; name: string }[];
  isSaving: boolean;
  onSubmit: () => void;
  onCancel: () => void;
}) {
  return (
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle>Nueva tarea</DialogTitle>
        <DialogDescription>
          Todos los miembros del equipo pueden crear y gestionar tareas.
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4 py-2">
        <div className="space-y-2">
          <Label htmlFor="wb-title">Título</Label>
          <Input
            id="wb-title"
            placeholder="¿Qué hay que hacer?"
            value={newTask.title}
            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="wb-desc">Descripción</Label>
          <Textarea
            id="wb-desc"
            placeholder="Detalles opcionales"
            value={newTask.description}
            onChange={(e) =>
              setNewTask({ ...newTask, description: e.target.value })
            }
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="wb-status">Estado</Label>
            <select
              id="wb-status"
              className="h-9 w-full rounded-md border border-border bg-background px-2 text-sm"
              value={selectedStatus}
              onChange={(e) =>
                setSelectedStatus(e.target.value as TaskStatus)
              }
            >
              {WORKBOARD_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABELS[s]}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="wb-area">Área</Label>
            <select
              id="wb-area"
              className="h-9 w-full rounded-md border border-border bg-background px-2 text-sm"
              value={newTask.area}
              onChange={(e) =>
                setNewTask({ ...newTask, area: e.target.value as TaskArea })
              }
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
            <Label htmlFor="wb-priority">Prioridad</Label>
            <select
              id="wb-priority"
              className="h-9 w-full rounded-md border border-border bg-background px-2 text-sm"
              value={newTask.priority}
              onChange={(e) =>
                setNewTask({
                  ...newTask,
                  priority: e.target.value as TaskPriority,
                })
              }
            >
              <option value="low">Baja</option>
              <option value="medium">Media</option>
              <option value="high">Alta</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="wb-assignee">Responsable</Label>
            <select
              id="wb-assignee"
              className="h-9 w-full rounded-md border border-border bg-background px-2 text-sm"
              value={newTask.assigneeId}
              onChange={(e) =>
                setNewTask({ ...newTask, assigneeId: e.target.value })
              }
            >
              <option value="">Sin asignar</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="wb-due">Fecha límite</Label>
          <Input
            id="wb-due"
            type="date"
            value={newTask.dueDate}
            onChange={(e) =>
              setNewTask({ ...newTask, dueDate: e.target.value })
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="wb-tags">Etiquetas (separadas por coma)</Label>
          <Input
            id="wb-tags"
            value={newTask.tags}
            onChange={(e) => setNewTask({ ...newTask, tags: e.target.value })}
          />
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button disabled={isSaving} onClick={onSubmit}>
          {isSaving ? "Creando…" : "Crear tarea"}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
