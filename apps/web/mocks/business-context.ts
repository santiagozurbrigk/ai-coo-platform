import type { ContextDocument } from "@/types/business-context";

export const mockDocuments: ContextDocument[] = [
  {
    id: "doc1",
    title: "Framework de ventas Q2 — High ticket",
    category: "sales",
    source: "Google Doc",
    summary: "Posicionamiento, manejo de objeciones y guiones de cierre para ofertas desde $5K.",
    updatedAt: "15 may 2026",
    linkedSops: ["sop1"],
  },
  {
    id: "doc2",
    title: "Llamada de visión del fundador — May 2026",
    category: "meetings",
    source: "Fathom",
    summary: "Transcripción: escalar delivery sin aumentar headcount; prioridades del AI COO.",
    updatedAt: "12 may 2026",
    linkedSops: [],
  },
  {
    id: "doc3",
    title: "Capacitación operadores — Semana 1",
    category: "training",
    source: "Notion",
    summary: "Ramp de nuevos: herramientas, normas de Slack, rutas de escalamiento.",
    updatedAt: "28 abr 2026",
    linkedSops: ["sop3"],
  },
  {
    id: "doc4",
    title: "Playbook de delivery v1",
    category: "operations",
    source: "PDF",
    summary: "Proceso legacy de delivery — parcialmente reemplazado por SOPs.",
    updatedAt: "1 mar 2026",
    linkedSops: ["sop2"],
  },
];

export function getDocumentById(id: string): ContextDocument | undefined {
  return mockDocuments.find((d) => d.id === id);
}
