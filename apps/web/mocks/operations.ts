import type { TeamInput } from "@/types/operations";

export const mockTeamInputs: TeamInput[] = [
  {
    id: "wi1",
    department: "operations",
    type: "text",
    importance: "high",
    author: "Sam Ortiz",
    submittedAt: "2026-05-21T09:00:00Z",
    preview:
      "El proceso de onboarding está tardando más de lo esperado esta semana",
  },
  {
    id: "wi2",
    department: "operations",
    type: "text",
    importance: "medium",
    author: "Jordan Lee",
    submittedAt: "2026-05-20T16:30:00Z",
    preview: "Tuvimos un problema técnico menor con la plataforma el martes",
  },
  {
    id: "wi3",
    department: "sales",
    type: "text",
    importance: "low",
    author: "Equipo de ventas",
    submittedAt: "2026-05-20T11:00:00Z",
    preview: "Varios leads mencionaron el mismo competidor esta semana",
  },
  {
    id: "wi4",
    department: "founder",
    type: "text",
    importance: "high",
    author: "Fundador",
    submittedAt: "2026-05-17T08:00:00Z",
    preview: "Foco próxima semana: reducir dependencia del fundador en QA de ventas...",
  },
];

/** @deprecated */
export const mockWeeklyInputs = mockTeamInputs;
