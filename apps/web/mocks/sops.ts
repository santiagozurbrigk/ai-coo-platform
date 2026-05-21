import type { Sop } from "@/types/sops";

export const mockSops: Sop[] = [
  {
    id: "sop1",
    title: "DM Instagram — Flujo de calificación",
    department: "sales",
    status: "active",
    lastUpdated: "10 may 2026",
    goal: "Estandarizar la calificación del setter antes de enviar calendario",
  },
  {
    id: "sop2",
    title: "Onboarding cliente — Módulo 1",
    department: "delivery",
    status: "outdated",
    lastUpdated: "14 feb 2026",
    goal: "Primeros 7 días post-compra",
  },
  {
    id: "sop3",
    title: "Input semanal de operaciones",
    department: "operations",
    status: "active",
    lastUpdated: "22 abr 2026",
    goal: "Captura de contexto del equipo en menos de 2 minutos",
  },
  {
    id: "sop4",
    title: "Fathom → Motor de contexto",
    department: "operations",
    status: "draft",
    lastUpdated: "18 may 2026",
    goal: "Pipeline de ingestión de transcripciones",
  },
];

export function getSopById(id: string): Sop | undefined {
  return mockSops.find((s) => s.id === id);
}
