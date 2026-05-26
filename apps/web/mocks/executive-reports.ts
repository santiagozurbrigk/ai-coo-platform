import type { ExecutiveReport } from "@/types/executive-reports";

export const mockExecutiveReports: ExecutiveReport[] = [
  {
    id: "er1",
    title: "Semana 20 — Inteligencia operativa",
    period: "weekly",
    weekLabel: "12 – 18 may 2026",
    generatedAt: "2026-05-19T06:00:00Z",
    executiveSummary:
      "La operación se mantuvo estable con ventas por encima de la capacidad de delivery. El riesgo principal es el cuello de botella en onboarding antes de la cohorte de junio.",
    risks: [
      "Tiempos de respuesta en delivery en alza",
      "El fundador aún revisa el 40% de los guiones de ventas",
    ],
    bottlenecks: [
      "Onboarding Módulo 2 — retraso promedio 3,2 días",
      "Cola de follow-up de ventas los fines de semana",
    ],
    recommendations: [
      "Actualizar SOP de onboarding antes de la intake de junio",
      "Reforzar cobertura del equipo de ventas en fin de semana",
    ],
    departments: [
      { name: "Ventas", status: "healthy" },
      { name: "Delivery", status: "watch" },
      { name: "Operaciones", status: "healthy" },
      { name: "Fundador", status: "critical" },
    ],
  },
  {
    id: "er2",
    title: "Abril 2026 — Ejecutivo mensual",
    period: "monthly",
    weekLabel: "Abril 2026",
    generatedAt: "2026-05-01T06:00:00Z",
    executiveSummary:
      "Mes fuerte en ingresos. La madurez operativa mejora; persisten brechas de documentación en delivery.",
    risks: ["Deuda de documentación en delivery"],
    bottlenecks: ["Reportes manuales en 2 departamentos"],
    recommendations: ["Automatizar recordatorios de inputs semanales"],
    departments: [
      { name: "Ventas", status: "healthy" },
      { name: "Delivery", status: "watch" },
      { name: "Operaciones", status: "healthy" },
      { name: "Fundador", status: "watch" },
    ],
  },
];

export function getReportById(id: string): ExecutiveReport | undefined {
  return mockExecutiveReports.find((r) => r.id === id);
}
