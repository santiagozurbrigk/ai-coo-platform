import type {
  IntelligenceBottleneck,
  IntelligenceInsight,
  IntelligenceOpportunity,
  IntelligenceRecommendation,
  MemoryChunk,
} from "@/types/intelligence";

export const mockInsights: IntelligenceInsight[] = [
  {
    id: "i1",
    title: "Patrón de sobrecarga en delivery",
    body: "Los tiempos de respuesta correlacionan con el volumen del Módulo 2 — tendencia de 3 semanas.",
    confidence: 0.91,
    department: "Delivery",
    createdAt: "20 may 2026",
  },
  {
    id: "i2",
    title: "Divergencia de rendimiento entre setters",
    body: "El cuartil superior agenda 2,1× más que el inferior con la misma fuente de leads.",
    confidence: 0.87,
    department: "Ventas",
    createdAt: "19 may 2026",
  },
];

export const mockRecommendations: IntelligenceRecommendation[] = [
  {
    id: "rec1",
    priority: "high",
    title: "Actualizar SOP de onboarding",
    action: "Borrador desde inputs semanales + transcripción Fathom (doc2)",
  },
  {
    id: "rec2",
    priority: "medium",
    title: "Replicar estructura de guiones de Alex",
    action: "Extraer patrones al Contexto de negocio para capacitación del equipo",
  },
];

export const mockBottlenecks: IntelligenceBottleneck[] = [
  { id: "b1", area: "Onboarding Módulo 2", impact: "Retraso promedio 3,2 días", frequency: "Diario" },
  { id: "b2", area: "Cobertura setters fin de semana", impact: "Brechas de respuesta 24h+", frequency: "Semanal" },
];

export const mockOpportunities: IntelligenceOpportunity[] = [
  { id: "op1", title: "Subida de tasa de agendamiento", potential: "+6–9% si setters inferiores adoptan framework de Alex" },
  { id: "op2", title: "Reportes semanales automáticos", potential: "Ahorro ~4h/semana de tiempo del fundador" },
];

export const mockMemoryChunks: MemoryChunk[] = [
  { id: "mem1", label: "Framework ventas Q2", type: "documento", lastAccessed: "hace 2 h" },
  { id: "mem2", label: "SOP DM Instagram", type: "sop", lastAccessed: "hace 5 h" },
  { id: "mem3", label: "Reporte ejecutivo Semana 20", type: "reporte", lastAccessed: "hace 1 d" },
];
