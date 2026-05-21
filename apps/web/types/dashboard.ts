export type DashboardRisk = {
  id: string;
  title: string;
  severity: "high" | "medium" | "low";
  department: string;
};

export type DashboardOpportunity = {
  id: string;
  title: string;
  impact: string;
};

export type DashboardMetric = {
  id: string;
  label: string;
  value: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
};

export type DashboardData = {
  executiveSummary: string;
  risks: DashboardRisk[];
  opportunities: DashboardOpportunity[];
  weeklyChanges: string[];
  revenueMetrics: DashboardMetric[];
  salesMetrics: DashboardMetric[];
  operationalMetrics: DashboardMetric[];
  aiRecommendation: string;
};
