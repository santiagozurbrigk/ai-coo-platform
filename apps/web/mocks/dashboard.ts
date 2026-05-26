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
      title: "Tasa de agendamiento al 34,2%",
      impact: "Optimizar guiones y follow-up del equipo de ventas",
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
    { id: "s1", label: "Conversaciones totales", value: "342", trend: "up", trendValue: "+12" },
    { id: "s2", label: "Tasa de agendamiento", value: "34,2%", trend: "up", trendValue: "+4,1%" },
    { id: "s3", label: "Tiempo de respuesta", value: "22 min", trend: "down", trendValue: "-3 min" },
    { id: "s4", label: "Tasa de fantasma", value: "18,5%", trend: "down", trendValue: "-2,3%" },
    { id: "s5", label: "Conv. activas", value: "128", trend: "neutral" },
    { id: "s6", label: "Sin responder", value: "17", trend: "down", trendValue: "-3" },
  ],
  operationalMetrics: [
    { id: "o1", label: "Carga del equipo", value: "72%", trend: "down", trendValue: "-5%" },
    { id: "o2", label: "Cuellos de botella", value: "4", trend: "up", trendValue: "+1" },
  ],
  aiRecommendation:
    "Prioriza actualizar el SOP de onboarding antes de la próxima cohorte de junio. Refuerza el follow-up del equipo de ventas los fines de semana para reducir conversaciones sin responder.",
};
