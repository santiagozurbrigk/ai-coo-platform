import type { SuggestedCallTask } from "@/types/business-context";

export const SUGGESTED_TASK_ASSIGNEES = [
  { id: "m1", name: "Valentina Ruiz" },
  { id: "m2", name: "Juan Pérez" },
  { id: "m3", name: "María López" },
  { id: "m4", name: "Santiago Zurbrigk" },
] as const;

const TASKS_BY_DOCUMENT: Record<string, SuggestedCallTask[]> = {
  doc1: [
    {
      id: "st1",
      description: "Enviar email de bienvenida y accesos a Laura Gómez",
      suggestedAssigneeId: "m3",
      suggestedAssigneeName: "María López",
      suggestedPriority: "high",
    },
    {
      id: "st2",
      description: "Actualizar CRM con objeción de tiempo resuelta",
      suggestedAssigneeId: "m2",
      suggestedAssigneeName: "Juan Pérez",
      suggestedPriority: "medium",
    },
    {
      id: "st3",
      description: "Agregar testimonio de Laura al script de closing",
      suggestedAssigneeId: "m1",
      suggestedAssigneeName: "Valentina Ruiz",
      suggestedPriority: "low",
    },
    {
      id: "st4",
      description: "Programar check-in de onboarding día 3",
      suggestedAssigneeId: "m3",
      suggestedAssigneeName: "María López",
      suggestedPriority: "high",
    },
  ],
  doc2: [
    {
      id: "st5",
      description: "Documentar prioridad Q3: 50 clientes activos en Notion",
      suggestedAssigneeId: "m4",
      suggestedAssigneeName: "Santiago Zurbrigk",
      suggestedPriority: "high",
    },
    {
      id: "st5b",
      description: "Crear SOP de onboarding automatizado",
      suggestedAssigneeId: "m3",
      suggestedAssigneeName: "María López",
      suggestedPriority: "medium",
    },
    {
      id: "st5c",
      description: "Revisar headcount plan con finanzas",
      suggestedAssigneeId: "m4",
      suggestedAssigneeName: "Santiago Zurbrigk",
      suggestedPriority: "medium",
    },
  ],
  doc7: [
    {
      id: "st6",
      description: "Follow-up con lead que mencionó competidor",
      suggestedAssigneeId: "m2",
      suggestedAssigneeName: "Juan Pérez",
      suggestedPriority: "high",
    },
    {
      id: "st7",
      description: "Actualizar battlecard de diferenciación",
      suggestedAssigneeId: "m1",
      suggestedAssigneeName: "Valentina Ruiz",
      suggestedPriority: "medium",
    },
  ],
};

export function getSuggestedTasksForDocument(
  documentId: string
): SuggestedCallTask[] {
  return TASKS_BY_DOCUMENT[documentId] ?? [];
}
