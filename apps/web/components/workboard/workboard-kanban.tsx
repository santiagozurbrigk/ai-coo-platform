"use client";

import { useMemo, useState } from "react";
import { Calendar, MoreVertical, Tag } from "lucide-react";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  cn,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@ai-coo/ui";
import { TASK_AREA_LABELS } from "@/lib/workboard/constants";
import { filterTasksByArea, groupTasksIntoColumns } from "@/lib/workboard/group-tasks";
import { getAreaClasses, getPriorityClasses, PRIORITY_LABELS } from "@/lib/workboard/styles";
import { useWorkboard } from "@/providers/workboard-provider";
import type { TaskStatus, WorkboardTask } from "@/types/workboard";

export function WorkboardKanban() {
  const { tasks, areaFilter, moveTask, deleteTask, setSelectedTask } = useWorkboard();
  const [draggedTask, setDraggedTask] = useState<{
    task: WorkboardTask;
    status: TaskStatus;
  } | null>(null);

  const filtered = useMemo(
    () => filterTasksByArea(tasks, areaFilter),
    [tasks, areaFilter]
  );
  const columns = useMemo(() => groupTasksIntoColumns(filtered), [filtered]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (targetStatus: TaskStatus) => {
    if (!draggedTask) return;
    const { task, status: sourceStatus } = draggedTask;
    if (sourceStatus === targetStatus) {
      setDraggedTask(null);
      return;
    }
    void moveTask(task.id, targetStatus);
    setDraggedTask(null);
  };

  return (
    <div className="grid min-h-[calc(100vh-14rem)] grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      {columns.map((column) => (
        <div
          key={column.id}
          className="workboard-kanban-column flex min-h-[320px] flex-col rounded-xl border p-3"
          onDragOver={handleDragOver}
          onDrop={() => handleDrop(column.id as TaskStatus)}
        >
          <div className="mb-3 flex items-center gap-2 px-1">
            <h2 className="text-sm font-semibold text-foreground">{column.title}</h2>
            <Badge variant="secondary" className="rounded-full px-2">
              {column.tasks.length}
            </Badge>
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
                  onDragStart={() =>
                    setDraggedTask({ task, status: column.id as TaskStatus })
                  }
                  onClick={() => setSelectedTask(task)}
                  className={cn(
                    "cursor-pointer border-border transition-shadow hover:shadow-md",
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
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedTask(task);
                            }}
                          >
                            Ver detalle
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              void deleteTask(task.id);
                            }}
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
                          "text-[10px]",
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
                            className="flex h-6 w-6 items-center justify-center rounded-full border border-border bg-muted text-[10px] font-medium"
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
  );
}
