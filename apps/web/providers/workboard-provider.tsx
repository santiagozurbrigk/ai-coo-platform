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
  assignTaskToSprintAction,
  createWorkboardTaskAction,
  deleteWorkboardTaskAction,
  getSprintsAction,
  logTaskTimeAction,
  moveWorkboardTaskAction,
  updateWorkboardTaskAction,
} from "@/app/workboard/actions";
import { assigneesFromMemberIds } from "@/lib/workboard/mapper";
import type { LaunchPickerOption } from "@/types/launches";
import type {
  TaskArea,
  TaskPriority,
  TaskStatus,
  WorkboardMember,
  WorkboardSprint,
  WorkboardTask,
} from "@/types/workboard";

type TaskUpdatePatch = Partial<{
  title: string;
  description: string;
  status: TaskStatus;
  area: TaskArea;
  priority: TaskPriority;
  assigneeId: string | null;
  assigneeIds: string[];
  dueDate: string | null;
  tags: string[];
  estimatedMinutes: number;
  launchId: string | null;
}>;

type WorkboardContextValue = {
  tasks: WorkboardTask[];
  members: WorkboardMember[];
  sprints: WorkboardSprint[];
  launches: LaunchPickerOption[];
  sprintFilterId: string;
  setSprintFilterId: (id: string) => void;
  launchFilterId: string;
  setLaunchFilterId: (id: string) => void;
  assigneeFilterId: string;
  setAssigneeFilterId: (id: string) => void;
  refreshSprints: () => Promise<void>;
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
    assigneeIds?: string[];
    dueDate?: string | null;
    tags?: string[];
    launchId?: string | null;
  }) => Promise<void>;
  moveTask: (taskId: string, status: TaskStatus) => Promise<void>;
  updateTask: (taskId: string, patch: TaskUpdatePatch) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  confirmCompleteWithTime: (minutes: number, note?: string) => Promise<void>;
  skipTimeAndComplete: () => Promise<void>;
  cancelComplete: () => void;
  upsertTaskInState: (task: WorkboardTask) => void;
  assignTaskToSprint: (taskId: string, sprintId: string | null) => Promise<void>;
};

const WorkboardContext = createContext<WorkboardContextValue | null>(null);

function applyTaskPatch(
  prev: WorkboardTask,
  patch: TaskUpdatePatch,
  members: WorkboardMember[]
): WorkboardTask {
  const nextAssigneeIds =
    patch.assigneeIds !== undefined
      ? patch.assigneeIds
      : patch.assigneeId !== undefined
        ? patch.assigneeId
          ? [patch.assigneeId]
          : []
        : prev.assigneeIds ?? (prev.assigneeId ? [prev.assigneeId] : []);

  const memberMap = new Map(members.map((member) => [member.id, member]));
  const assignees = assigneesFromMemberIds(nextAssigneeIds, memberMap);

  return {
    ...prev,
    ...patch,
    dueDate:
      patch.dueDate !== undefined
        ? (patch.dueDate ?? undefined)
        : prev.dueDate,
    assigneeIds: nextAssigneeIds,
    assignees,
    assigneeId: nextAssigneeIds[0] ?? null,
    assignee: assignees[0],
  };
}

export function WorkboardProvider({
  initialTasks,
  members,
  initialSprints,
  initialSprintFilterId,
  launches,
  initialLaunchFilterId = "all",
  children,
}: {
  initialTasks: WorkboardTask[];
  members: WorkboardMember[];
  initialSprints: WorkboardSprint[];
  initialSprintFilterId: string;
  launches: LaunchPickerOption[];
  initialLaunchFilterId?: string;
  children: ReactNode;
}) {
  const [tasks, setTasks] = useState(initialTasks);
  const [sprints, setSprints] = useState(initialSprints);
  const [sprintFilterId, setSprintFilterId] = useState(initialSprintFilterId);
  const [launchFilterId, setLaunchFilterId] = useState(initialLaunchFilterId);
  const [assigneeFilterId, setAssigneeFilterId] = useState("all");
  const [areaFilter, setAreaFilter] = useState("all");
  const [view, setView] = useState<"board" | "calendar" | "time">("board");
  const [selectedTask, setSelectedTask] = useState<WorkboardTask | null>(null);
  const [pendingCompleteTask, setPendingCompleteTask] =
    useState<WorkboardTask | null>(null);
  const [pendingCompletePatch, setPendingCompletePatch] =
    useState<TaskUpdatePatch | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const refreshSprints = useCallback(async () => {
    const list = await getSprintsAction();
    setSprints(list);
  }, []);

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
        await refreshSprints();
      } finally {
        setIsSaving(false);
      }
    },
    [pendingCompleteTask, pendingCompletePatch, performMove, upsertTaskInState, refreshSprints]
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
        setPendingCompleteTask(applyTaskPatch(prev, patch, members));
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

  const assignTaskToSprint = useCallback(
    async (taskId: string, sprintId: string | null) => {
      setIsSaving(true);
      try {
        const updated = await assignTaskToSprintAction(taskId, sprintId);
        upsertTaskInState(updated);
        await refreshSprints();
      } finally {
        setIsSaving(false);
      }
    },
    [refreshSprints, upsertTaskInState]
  );

  const value = useMemo(
    () => ({
      tasks,
      members,
      sprints,
      launches,
      sprintFilterId,
      setSprintFilterId,
      launchFilterId,
      setLaunchFilterId,
      assigneeFilterId,
      setAssigneeFilterId,
      refreshSprints,
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
      assignTaskToSprint,
    }),
    [
      tasks,
      members,
      sprints,
      launches,
      sprintFilterId,
      launchFilterId,
      assigneeFilterId,
      refreshSprints,
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
      assignTaskToSprint,
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
