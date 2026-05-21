import type { WeeklyInput } from "@/types/operations";

export const mockWeeklyInputs: WeeklyInput[] = [
  {
    id: "wi1",
    department: "sales",
    type: "text",
    author: "Alex Rivera",
    submittedAt: "2026-05-20T09:00:00Z",
    preview: "Pipeline fuerte — 3 agendamientos desde DM de Instagram esta semana...",
  },
  {
    id: "wi2",
    department: "delivery",
    type: "audio",
    author: "Jordan Lee",
    submittedAt: "2026-05-19T16:30:00Z",
    preview: "Nota de voz · 1:42 — retrasos en onboarding Módulo 2",
  },
  {
    id: "wi3",
    department: "operations",
    type: "form",
    author: "Sam Ortiz",
    submittedAt: "2026-05-18T11:00:00Z",
    preview: "Formulario: capacidad — delivery al 85% de utilización",
  },
  {
    id: "wi4",
    department: "founder",
    type: "text",
    author: "Fundador",
    submittedAt: "2026-05-17T08:00:00Z",
    preview: "Foco próxima semana: reducir dependencia del fundador en QA de ventas...",
  },
];
