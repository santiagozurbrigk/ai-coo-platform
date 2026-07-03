export type DashboardRisk = {
  id: string;
  title: string;
  description: string;
  suggestedAction: string;
  severity: "high" | "medium" | "low";
  department: string;
};

export type DashboardOpportunity = {
  id: string;
  title: string;
  description: string;
  impact: string;
};

export type DashboardMetric = {
  id: string;
  label: string;
  value: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  /** 0–100 para barras de progreso en métricas operacionales */
  progress?: number;
  /** Serie real para sparkline; omitir si no hay histórico suficiente */
  sparklineData?: number[];
  sparklineColor?: string;
};

export type DashboardWeeklyChange = {
  id: string;
  label: string;
  direction: "up" | "down" | "neutral";
};

export type DashboardAiRecommendation = {
  id: string;
  text: string;
  category: string;
};

export type DashboardData = {
  executiveSummary: string;
  risks: DashboardRisk[];
  opportunities: DashboardOpportunity[];
  weeklyChanges: DashboardWeeklyChange[];
  revenueMetrics: DashboardMetric[];
  salesMetrics: DashboardMetric[];
  operationalMetrics: DashboardMetric[];
  dashboardOperationalMetrics: DashboardMetric[];
  aiRecommendations: DashboardAiRecommendation[];
  /** Sin datos reales ni mock cargado — mostrar empty state */
  isEmpty?: boolean;
  /** Sin reporte semanal — link a inputs */
  weeklyReportCtaHref?: string;
};
