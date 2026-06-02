"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  createWorkboardTaskAction,
  deleteWorkboardTaskAction,
  moveWorkboardTaskAction,
  updateWorkboardTaskAction,
} from "@/app/workboard/actions";
import type {
  TaskArea,
  TaskPriority,
  TaskStatus,
  WorkboardMember,
  WorkboardTask,
} from "@/types/workboard";

type WorkboardContextValue = {
  tasks: WorkboardTask[];
  members: WorkboardMember[];
  areaFilter: string;
  setAreaFilter: (v: string) => void;
  view: "board" | "calendar";
  setView: (v: "board" | "calendar") => void;
  selectedTask: WorkboardTask | null;
  setSelectedTask: (task: WorkboardTask | null) => void;
  isSaving: boolean;
  createTask: (input: {
    title: string;
    description?: string;
    status: TaskStatus;
    area: TaskArea;
    priority: TaskPriority;
    assigneeId?: string | null;
    dueDate?: string | null;
    tags?: string[];
  }) => Promise<void>;
  moveTask: (taskId: string, status: TaskStatus) => Promise<void>;
  updateTask: (
    taskId: string,
    patch: Partial<{
      title: string;
      description: string;
      status: TaskStatus;
      area: TaskArea;
      priority: TaskPriority;
      assigneeId: string | null;
      dueDate: string | null;
      tags: string[];
    }>
  ) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  upsertTaskInState: (task: WorkboardTask) => void;
};

const WorkboardContext = createContext<WorkboardContextValue | null>(null);

export function WorkboardProvider({
  initialTasks,
  members,
  children,
}: {
  initialTasks: WorkboardTask[];
  members: WorkboardMember[];
  children: ReactNode;
}) {
  const [tasks, setTasks] = useState(initialTasks);
  const [areaFilter, setAreaFilter] = useState("all");
  const [view, setView] = useState<"board" | "calendar">("board");
  const [selectedTask, setSelectedTask] = useState<WorkboardTask | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const upsertTaskInState = useCallback((task: WorkboardTask) => {
    setTasks((prev) => {
      const idx = prev.findIndex((t) => t.id === task.id);
      if (idx === -1) return [...prev, task];
      const next = [...prev];
      next[idx] = task;
      return next;
    });
    setSelectedTask((prev) => (prev?.id === task.id ? task : prev));
  }, []);

  const createTask = useCallback(
    async (input: Parameters<WorkboardContextValue["createTask"]>[0]) => {
      setIsSaving(true);
      try {
        const created = await createWorkboardTaskAction(input);
        upsertTaskInState(created);
      } finally {
        setIsSaving(false);
      }
    },
    [upsertTaskInState]
  );

  const moveTask = useCallback(
    async (taskId: string, status: TaskStatus) => {
      const prev = tasks.find((t) => t.id === taskId);
      if (!prev || prev.status === status) return;

      setTasks((current) =>
        current.map((t) => (t.id === taskId ? { ...t, status } : t))
      );

      try {
        await moveWorkboardTaskAction({ taskId, status });
      } catch {
        if (prev) upsertTaskInState(prev);
      }
    },
    [tasks, upsertTaskInState]
  );

  const updateTask = useCallback(
    async (
      taskId: string,
      patch: Parameters<WorkboardContextValue["updateTask"]>[1]
    ) => {
      setIsSaving(true);
      try {
        const updated = await updateWorkboardTaskAction({ taskId, ...patch });
        upsertTaskInState(updated);
      } finally {
        setIsSaving(false);
      }
    },
    [upsertTaskInState]
  );

  const deleteTask = useCallback(async (taskId: string) => {
    setIsSaving(true);
    try {
      await deleteWorkboardTaskAction(taskId);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      setSelectedTask((prev) => (prev?.id === taskId ? null : prev));
    } finally {
      setIsSaving(false);
    }
  }, []);

  const value = useMemo(
    () => ({
      tasks,
      members,
      areaFilter,
      setAreaFilter,
      view,
      setView,
      selectedTask,
      setSelectedTask,
      isSaving,
      createTask,
      moveTask,
      updateTask,
      deleteTask,
      upsertTaskInState,
    }),
    [
      tasks,
      members,
      areaFilter,
      view,
      selectedTask,
      isSaving,
      createTask,
      moveTask,
      updateTask,
      deleteTask,
      upsertTaskInState,
    ]
  );

  return (
    <WorkboardContext.Provider value={value}>
      {children}
    </WorkboardContext.Provider>
  );
}

export function useWorkboard() {
  const ctx = useContext(WorkboardContext);
  if (!ctx) {
    throw new Error("useWorkboard debe usarse dentro de WorkboardProvider");
  }
  return ctx;
}
