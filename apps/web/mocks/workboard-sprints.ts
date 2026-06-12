import type { WorkboardSprint } from "@/types/workboard";

export const mockWorkboardSprints: WorkboardSprint[] = [
  {
    id: "sprint-3",
    name: "Sprint 3",
    startDate: "2026-06-09",
    endDate: "2026-06-23",
    completedTasks: 14,
    totalTasks: 22,
    goal: "Optimizar funnel de ventas y onboarding",
    areaFocus: "ventas",
  },
  {
    id: "sprint-2",
    name: "Sprint 2",
    startDate: "2026-05-26",
    endDate: "2026-06-08",
    completedTasks: 18,
    totalTasks: 20,
    goal: "Lanzamiento contenido Q2",
    areaFocus: "marketing",
  },
  {
    id: "sprint-1",
    name: "Sprint 1",
    startDate: "2026-05-12",
    endDate: "2026-05-25",
    completedTasks: 16,
    totalTasks: 18,
    goal: "Estabilizar delivery post-lanzamiento",
    areaFocus: "operaciones",
  },
];

export const CURRENT_SPRINT_ID = "sprint-3";
