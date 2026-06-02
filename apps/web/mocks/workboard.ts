import { mockTeamMembers } from "@/mocks/team";
import type { TaskArea, WorkboardColumn } from "@/types/workboard";

function member(id: string) {
  const m = mockTeamMembers.find((t) => t.id === id);
  if (!m) return undefined;
  const parts = m.name.split(" ");
  const initials =
    parts.length >= 2
      ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
      : m.name.slice(0, 2).toUpperCase();
  return { id: m.id, name: m.name, initials };
}

export const TASK_AREA_LABELS: Record<TaskArea, string> = {
  marketing: "Marketing",
  ventas: "Ventas",
  operaciones: "Operaciones",
  finanzas: "Finanzas",
  clientes: "Clientes",
  general: "General",
};

export const TASK_AREA_OPTIONS = (
  Object.entries(TASK_AREA_LABELS) as [TaskArea, string][]
).map(([value, label]) => ({ value, label }));

export const initialWorkboardColumns: WorkboardColumn[] = [
  {
    id: "todo",
    title: "Por hacer",
    tasks: [
      {
        id: "t1",
        title: "Revisar calendario de contenido Q2",
        description: "Validar reels y stories de las próximas 2 semanas",
        area: "marketing",
        priority: "high",
        assignee: member("u2"),
        dueDate: "2026-05-28",
        tags: ["Contenido", "Instagram"],
      },
      {
        id: "t2",
        title: "Actualizar script de DM de calificación",
        description: "Alinear con el nuevo pitch de ventas",
        area: "ventas",
        priority: "medium",
        assignee: member("u3"),
        dueDate: "2026-05-30",
        tags: ["Setter", "Scripts"],
      },
      {
        id: "t3",
        title: "Documentar proceso de onboarding",
        description: "Borrador para SOP de delivery",
        area: "operaciones",
        priority: "medium",
        assignee: member("u4"),
        tags: ["SOP"],
      },
    ],
  },
  {
    id: "in-progress",
    title: "En progreso",
    tasks: [
      {
        id: "t4",
        title: "Análisis de gastos abril",
        description: "Categorizar suscripciones y costos fijos",
        area: "finanzas",
        priority: "high",
        assignee: member("u1"),
        dueDate: "2026-05-25",
        tags: ["Finanzas"],
      },
      {
        id: "t5",
        title: "Seguimiento cohorte mayo — semana 2",
        description: "Check-in con clientes en fase de implementación",
        area: "clientes",
        priority: "high",
        assignee: member("u2"),
        dueDate: "2026-05-27",
        tags: ["Delivery"],
      },
    ],
  },
  {
    id: "review",
    title: "En revisión",
    tasks: [
      {
        id: "t6",
        title: "Landing de campaña orgánica",
        description: "Revisión de copy y CTA antes de publicar",
        area: "marketing",
        priority: "medium",
        assignee: member("u1"),
        tags: ["Landing"],
      },
    ],
  },
  {
    id: "done",
    title: "Hecho",
    tasks: [
      {
        id: "t7",
        title: "Sync integración Calendly",
        description: "Verificar webhooks y última sincronización",
        area: "ventas",
        priority: "low",
        assignee: member("u3"),
        tags: ["Integraciones"],
      },
      {
        id: "t8",
        title: "Input semanal del equipo",
        description: "Consolidar respuestas de operadores",
        area: "operaciones",
        priority: "low",
        assignee: member("u4"),
        tags: ["Team Input"],
      },
    ],
  },
];
