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
  logTaskTimeAction,
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

type TaskUpdatePatch = Partial<{
  title: string;
  description: string;
  status: TaskStatus;
  area: TaskArea;
  priority: TaskPriority;
  assigneeId: string | null;
  dueDate: string | null;
  tags: string[];
  estimatedMinutes: number;
}>;

type WorkboardContextValue = {
  tasks: WorkboardTask[];
  members: WorkboardMember[];
  areaFilter: string;
  setAreaFilter: (v: string) => void;
  view: "board" | "calendar" | "time";
  setView: (v: "board" | "calendar" | "time") => void;
  selectedTask: WorkboardTask | null;
  setSelectedTask: (task: WorkboardTask | null) => void;
  pendingCompleteTask: WorkboardTask | null;
  pendingCompletePatch: TaskUpdatePatch | null;
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
  updateTask: (taskId: string, patch: TaskUpdatePatch) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  confirmCompleteWithTime: (minutes: number, note?: string) => Promise<void>;
  skipTimeAndComplete: () => Promise<void>;
  cancelComplete: () => void;
  upsertTaskInState: (task: WorkboardTask) => void;
};

const WorkboardContext = createContext<WorkboardContextValue | null>(null);

function applyTaskPatch(
  prev: WorkboardTask,
  patch: TaskUpdatePatch
): WorkboardTask {
  return {
    ...prev,
    ...patch,
    dueDate:
      patch.dueDate !== undefined
        ? (patch.dueDate ?? undefined)
        : prev.dueDate,
    assigneeId:
      patch.assigneeId !== undefined ? patch.assigneeId : prev.assigneeId,
  };
}

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
  const [view, setView] = useState<"board" | "calendar" | "time">("board");
  const [selectedTask, setSelectedTask] = useState<WorkboardTask | null>(null);
  const [pendingCompleteTask, setPendingCompleteTask] =
    useState<WorkboardTask | null>(null);
  const [pendingCompletePatch, setPendingCompletePatch] =
    useState<TaskUpdatePatch | null>(null);
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

  const performMove = useCallback(
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

  const finalizeComplete = useCallback(
    async (minutes?: number, note?: string) => {
      if (!pendingCompleteTask) return;

      setIsSaving(true);
      try {
        if (minutes != null && minutes > 0) {
          await logTaskTimeAction({
            taskId: pendingCompleteTask.id,
            actualMinutes: minutes,
            estimatedMinutes: pendingCompleteTask.estimatedMinutes,
            note,
          });
        }

        if (pendingCompletePatch) {
          const updated = await updateWorkboardTaskAction({
            taskId: pendingCompleteTask.id,
            ...pendingCompletePatch,
            status: "done",
          });
          upsertTaskInState(updated);
        } else {
          await performMove(pendingCompleteTask.id, "done");
        }

        setPendingCompleteTask(null);
        setPendingCompletePatch(null);
        setSelectedTask(null);
      } finally {
        setIsSaving(false);
      }
    },
    [pendingCompleteTask, pendingCompletePatch, performMove, upsertTaskInState]
  );

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

      if (status === "done") {
        setPendingCompleteTask(prev);
        setPendingCompletePatch(null);
        return;
      }

      await performMove(taskId, status);
    },
    [tasks, performMove]
  );

  const updateTask = useCallback(
    async (taskId: string, patch: TaskUpdatePatch) => {
      const prev = tasks.find((t) => t.id === taskId);
      if (!prev) return;

      if (patch.status === "done" && prev.status !== "done") {
        setPendingCompleteTask(applyTaskPatch(prev, patch));
        setPendingCompletePatch(patch);
        return;
      }

      setIsSaving(true);
      try {
        const updated = await updateWorkboardTaskAction({ taskId, ...patch });
        upsertTaskInState(updated);
      } finally {
        setIsSaving(false);
      }
    },
    [tasks, upsertTaskInState]
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

  const confirmCompleteWithTime = useCallback(
    async (minutes: number, note?: string) => {
      await finalizeComplete(minutes, note);
    },
    [finalizeComplete]
  );

  const skipTimeAndComplete = useCallback(async () => {
    await finalizeComplete();
  }, [finalizeComplete]);

  const cancelComplete = useCallback(() => {
    setPendingCompleteTask(null);
    setPendingCompletePatch(null);
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
      pendingCompleteTask,
      pendingCompletePatch,
      isSaving,
      createTask,
      moveTask,
      updateTask,
      deleteTask,
      confirmCompleteWithTime,
      skipTimeAndComplete,
      cancelComplete,
      upsertTaskInState,
    }),
    [
      tasks,
      members,
      areaFilter,
      view,
      selectedTask,
      pendingCompleteTask,
      pendingCompletePatch,
      isSaving,
      createTask,
      moveTask,
      updateTask,
      deleteTask,
      confirmCompleteWithTime,
      skipTimeAndComplete,
      cancelComplete,
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
