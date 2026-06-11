import type { DashboardData } from "@/types/dashboard";

export const mockDashboard: DashboardData = {
  executiveSummary:
    "Esta semana tuviste 47 conversaciones activas, tu tasa de booking subió 8% vs semana anterior, y se detectaron 2 riesgos operacionales. Los ingresos recurrentes se mantienen estables con 3 nuevos clientes en el programa de coaching premium.",
  risks: [
    {
      id: "r1",
      title: "Setter Juan lleva 3 días sin responder conversaciones",
      description:
        "12 leads en bandeja sin respuesta desde el viernes. Riesgo de pérdida por ghosting.",
      suggestedAction: "Revisar bandeja de Juan y reasignar leads críticos",
      severity: "high",
      department: "Ventas",
    },
    {
      id: "r2",
      title: "Tiempo de respuesta en delivery +18%",
      description:
        "El equipo de onboarding tardó 4,2 h de promedio en responder tickets esta semana.",
      suggestedAction: "Revisar carga del equipo en Operaciones",
      severity: "medium",
      department: "Delivery",
    },
    {
      id: "r3",
      title: "SOP de onboarding marcado como desactualizado",
      description:
        "El proceso no refleja el nuevo módulo de comunidad lanzado en mayo.",
      suggestedAction: "Actualizar SOP antes de la cohorte de junio",
      severity: "low",
      department: "Operaciones",
    },
  ],
  opportunities: [
    {
      id: "o1",
      title: "Booking rate 23% arriba del promedio histórico",
      description:
        "La tasa de agendamiento llegó al 34,2% esta semana, el mejor registro del trimestre.",
      impact: "Optimizar guiones y duplicar el flujo que está funcionando",
    },
    {
      id: "o2",
      title: "Sync de ManyChat estable",
      description:
        "100% de mensajes entrantes sincronizados sin errores en 7 días.",
      impact: "Habilitar análisis más profundo del embudo la próxima semana",
    },
    {
      id: "o3",
      title: "3 testimonios nuevos en Discord",
      description:
        "Clientes del programa avanzado compartieron resultados en el canal #wins.",
      impact: "Usar en contenido de marketing y landing de ventas",
    },
  ],
  weeklyChanges: [
    { id: "wc1", label: "Booking rate +8%", direction: "up" },
    { id: "wc2", label: "Response time -12 min", direction: "down" },
    { id: "wc3", label: "MRR +$4.200", direction: "up" },
    { id: "wc4", label: "Ghosting rate -2,3%", direction: "down" },
    { id: "wc5", label: "Inputs semanales: 12 de 16 equipos", direction: "neutral" },
  ],
  revenueMetrics: [
    { id: "m1", label: "MRR", value: "$84.2K", trend: "up", trendValue: "+8,3%" },
    {
      id: "m2",
      label: "Nuevos clientes",
      value: "7",
      trend: "up",
      trendValue: "+3 vs mes ant.",
    },
    {
      id: "m3",
      label: "Churn del mes",
      value: "2,1%",
      trend: "down",
      trendValue: "-0,4 pp",
    },
  ],
  salesMetrics: [
    {
      id: "s-booking",
      label: "Tasa de agendamiento",
      value: "34,2%",
      trend: "up",
      trendValue: "+8%",
    },
    {
      id: "s-active",
      label: "Conversaciones activas",
      value: "47",
      trend: "up",
      trendValue: "+12",
    },
    {
      id: "s-ghost",
      label: "Tasa de fantasma",
      value: "18,5%",
      trend: "down",
      trendValue: "-2,3%",
    },
  ],
  operationalMetrics: [
    { id: "o1", label: "Carga del equipo", value: "72%", trend: "down", trendValue: "-5%" },
    { id: "o2", label: "Cuellos de botella", value: "4", trend: "up", trendValue: "+1" },
  ],
  dashboardOperationalMetrics: [
    {
      id: "dop1",
      label: "Tasks completadas",
      value: "34/42",
      progress: 81,
      trend: "up",
      trendValue: "+6",
    },
    {
      id: "dop2",
      label: "Inputs semanales recibidos",
      value: "12/16",
      progress: 75,
      trend: "neutral",
      trendValue: "4 pendientes",
    },
  ],
  aiRecommendations: [
    {
      id: "rec1",
      text: "Revisá las últimas 5 conversaciones de María — su tiempo de respuesta subió 40%.",
      category: "Ventas",
    },
    {
      id: "rec2",
      text: "Actualizá el SOP de onboarding antes de la cohorte de junio (12 clientes nuevos).",
      category: "Operaciones",
    },
    {
      id: "rec3",
      text: "Programá follow-up automático los fines de semana para reducir ghosting post-precio.",
      category: "Automatización",
    },
  ],
};
