"use client";

import { useMemo, useState } from "react";
import {
  Calendar,
  MoreVertical,
  Plus,
  Tag,
} from "lucide-react";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  cn,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Input,
  Label,
  Textarea,
} from "@ai-coo/ui";
import { FilterPills } from "@/components/marketing/filter-pills";
import {
  initialWorkboardColumns,
  TASK_AREA_LABELS,
  TASK_AREA_OPTIONS,
} from "@/mocks/workboard";
import { mockTeamMembers } from "@/mocks/team";
import type {
  TaskArea,
  TaskPriority,
  WorkboardColumn,
  WorkboardTask,
} from "@/types/workboard";

const AREA_FILTER_OPTIONS = [
  { value: "all", label: "Todas las áreas" },
  ...TASK_AREA_OPTIONS.map((o) => ({ value: o.value, label: o.label })),
];

const PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: "Baja",
  medium: "Media",
  high: "Alta",
};

function getPriorityClasses(priority: TaskPriority) {
  switch (priority) {
    case "high":
      return "border-red-500/25 bg-red-500/10 text-red-600 dark:text-red-400";
    case "medium":
      return "border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-400";
    case "low":
      return "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400";
    default:
      return "";
  }
}

function getAreaClasses(area: TaskArea) {
  const map: Record<TaskArea, string> = {
    marketing: "border-violet-500/30 bg-violet-500/10 text-violet-600 dark:text-violet-400",
    ventas: "border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400",
    operaciones: "border-orange-500/30 bg-orange-500/10 text-orange-600 dark:text-orange-400",
    finanzas: "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    clientes: "border-pink-500/30 bg-pink-500/10 text-pink-600 dark:text-pink-400",
    general: "border-border bg-muted text-muted-foreground",
  };
  return map[area];
}

function initialsFromName(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export function WorkboardKanban() {
  const [columns, setColumns] = useState<WorkboardColumn[]>(initialWorkboardColumns);
  const [areaFilter, setAreaFilter] = useState("all");
  const [draggedTask, setDraggedTask] = useState<{
    task: WorkboardTask;
    columnId: string;
  } | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedColumn, setSelectedColumn] = useState("todo");
  const [newTask, setNewTask] = useState<{
    title: string;
    description: string;
    area: TaskArea;
    priority: TaskPriority;
    assigneeId: string;
    dueDate: string;
    tags: string;
  }>({
    title: "",
    description: "",
    area: "general",
    priority: "medium",
    assigneeId: "",
    dueDate: "",
    tags: "",
  });

  const filteredColumns = useMemo(() => {
    if (areaFilter === "all") return columns;
    return columns.map((col) => ({
      ...col,
      tasks: col.tasks.filter((t) => t.area === areaFilter),
    }));
  }, [columns, areaFilter]);

  const handleDragStart = (task: WorkboardTask, columnId: string) => {
    setDraggedTask({ task, columnId });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (targetColumnId: string) => {
    if (!draggedTask) return;
    const { task, columnId: sourceColumnId } = draggedTask;
    if (sourceColumnId === targetColumnId) {
      setDraggedTask(null);
      return;
    }

    setColumns((prev) =>
      prev.map((col) => {
        if (col.id === sourceColumnId) {
          return { ...col, tasks: col.tasks.filter((t) => t.id !== task.id) };
        }
        if (col.id === targetColumnId) {
          return { ...col, tasks: [...col.tasks, task] };
        }
        return col;
      })
    );
    setDraggedTask(null);
  };

  const handleAddTask = () => {
    if (!newTask.title.trim()) return;

    const assigneeMember = mockTeamMembers.find(
      (m) => m.id === newTask.assigneeId
    );
    const assignee = assigneeMember
      ? {
          id: assigneeMember.id,
          name: assigneeMember.name,
          initials: initialsFromName(assigneeMember.name),
        }
      : undefined;

    const task: WorkboardTask = {
      id: `t-${Date.now()}`,
      title: newTask.title.trim(),
      description: newTask.description.trim(),
      area: newTask.area,
      priority: newTask.priority,
      assignee,
      dueDate: newTask.dueDate || undefined,
      tags: newTask.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    };

    setColumns((prev) =>
      prev.map((col) =>
        col.id === selectedColumn
          ? { ...col, tasks: [...col.tasks, task] }
          : col
      )
    );

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
  };

  const handleDeleteTask = (columnId: string, taskId: string) => {
    setColumns((prev) =>
      prev.map((col) =>
        col.id === columnId
          ? { ...col, tasks: col.tasks.filter((t) => t.id !== taskId) }
          : col
      )
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <FilterPills
          options={AREA_FILTER_OPTIONS}
          value={areaFilter}
          onChange={setAreaFilter}
        />
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="mr-1.5 h-4 w-4" />
              Nueva tarea
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Nueva tarea</DialogTitle>
              <DialogDescription>
                Agregá una tarea al tablero y asignalá un área del negocio.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="wb-title">Título</Label>
                <Input
                  id="wb-title"
                  placeholder="¿Qué hay que hacer?"
                  value={newTask.title}
                  onChange={(e) =>
                    setNewTask({ ...newTask, title: e.target.value })
                  }
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
                  <Label htmlFor="wb-column">Columna</Label>
                  <select
                    id="wb-column"
                    className="h-9 w-full rounded-md border border-border bg-background px-2 text-sm"
                    value={selectedColumn}
                    onChange={(e) => setSelectedColumn(e.target.value)}
                  >
                    {columns.map((col) => (
                      <option key={col.id} value={col.id}>
                        {col.title}
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
                      setNewTask({
                        ...newTask,
                        area: e.target.value as TaskArea,
                      })
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
                    {mockTeamMembers.map((m) => (
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
                  placeholder="Ej: Urgente, Instagram"
                  value={newTask.tags}
                  onChange={(e) =>
                    setNewTask({ ...newTask, tags: e.target.value })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAddTask}>Crear tarea</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid min-h-[calc(100vh-14rem)] grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {filteredColumns.map((column) => (
          <div
            key={column.id}
            className="flex min-h-[320px] flex-col rounded-xl border border-border bg-muted/20 p-3"
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(column.id)}
          >
            <div className="mb-3 flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-foreground">
                  {column.title}
                </h2>
                <Badge variant="secondary" className="rounded-full px-2">
                  {column.tasks.length}
                </Badge>
              </div>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto pr-1">
              {column.tasks.length === 0 ? (
                <p className="px-2 py-6 text-center text-xs text-muted-foreground">
                  Sin tareas
                </p>
              ) : (
                column.tasks.map((task) => (
                  <Card
                    key={task.id}
                    draggable
                    onDragStart={() => handleDragStart(task, column.id)}
                    className={cn(
                      "cursor-grab border-border active:cursor-grabbing",
                      draggedTask?.task.id === task.id && "opacity-50"
                    )}
                  >
                    <CardHeader className="pb-2 pt-4">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-sm font-medium leading-snug">
                          {task.title}
                        </CardTitle>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 shrink-0 p-0"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() =>
                                handleDeleteTask(column.id, task.id)
                              }
                            >
                              Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3 pb-4">
                      {task.description ? (
                        <p className="line-clamp-2 text-xs text-muted-foreground">
                          {task.description}
                        </p>
                      ) : null}

                      <Badge
                        variant="outline"
                        className={cn("text-[10px]", getAreaClasses(task.area))}
                      >
                        {TASK_AREA_LABELS[task.area]}
                      </Badge>

                      {task.tags.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {task.tags.map((tag) => (
                            <Badge
                              key={tag}
                              variant="outline"
                              className="gap-0.5 text-[10px] font-normal"
                            >
                              <Tag className="h-2.5 w-2.5" />
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      ) : null}

                      <div className="flex items-center justify-between gap-2 pt-1">
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[10px] capitalize",
                            getPriorityClasses(task.priority)
                          )}
                        >
                          {PRIORITY_LABELS[task.priority]}
                        </Badge>
                        <div className="flex items-center gap-2">
                          {task.dueDate ? (
                            <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              {new Date(task.dueDate).toLocaleDateString("es", {
                                day: "numeric",
                                month: "short",
                              })}
                            </span>
                          ) : null}
                          {task.assignee ? (
                            <span
                              className="flex h-6 w-6 items-center justify-center rounded-full border border-border bg-muted text-[10px] font-medium text-foreground"
                              title={task.assignee.name}
                            >
                              {task.assignee.initials}
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
