import type { DashboardData } from "@/types/dashboard";

export const mockDashboard: DashboardData = {
  executiveSummary:
    "Los ingresos subieron 8,3% semana a semana. Los tiempos de respuesta en ventas mejoraron, pero delivery muestra señales tempranas de sobrecarga. Dos SOPs requieren actualización según los inputs del equipo.",
  risks: [
    {
      id: "r1",
      title: "Tiempo de respuesta en delivery +18%",
      severity: "high",
      department: "Delivery",
    },
    {
      id: "r2",
      title: "3 conversaciones en fantasma tras mencionar precio",
      severity: "medium",
      department: "Ventas",
    },
    {
      id: "r3",
      title: "SOP de onboarding marcado como desactualizado",
      severity: "low",
      department: "Operaciones",
    },
  ],
  opportunities: [
    {
      id: "o1",
      title: "Setter Alex — 42% de agendamiento",
      impact: "Replicar framework de guiones en todo el equipo",
    },
    {
      id: "o2",
      title: "Sync de ManyChat estable",
      impact: "Habilitar análisis más profundo del embudo la próxima semana",
    },
  ],
  weeklyChanges: [
    "12 inputs semanales nuevos de 4 departamentos",
    "Reporte ejecutivo generado automáticamente el lunes 6:00",
    "2 sincronizaciones completadas (Notion, Fathom)",
  ],
  revenueMetrics: [
    { id: "m1", label: "MRR", value: "$84.2K", trend: "up", trendValue: "+8,3%" },
    { id: "m2", label: "Ingresos nuevos", value: "$12.4K", trend: "up", trendValue: "+2,1%" },
  ],
  salesMetrics: [
    { id: "s1", label: "Tasa de agendamiento", value: "34,2%", trend: "up", trendValue: "+4,1%" },
    { id: "s2", label: "Conv. activas", value: "128", trend: "neutral" },
  ],
  operationalMetrics: [
    { id: "o1", label: "Carga del equipo", value: "72%", trend: "down", trendValue: "-5%" },
    { id: "o2", label: "Cuellos de botella", value: "4", trend: "up", trendValue: "+1" },
  ],
  aiRecommendation:
    "Prioriza actualizar el SOP de onboarding antes de la próxima cohorte de junio. Redistribuye el 15% de los follow-ups de setters para equilibrar la capacidad outlier de Alex.",
};
