export type ReportPeriod = "weekly" | "monthly";

export type ExecutiveReport = {
  id: string;
  title: string;
  period: ReportPeriod;
  weekLabel: string;
  generatedAt: string;
  executiveSummary: string;
  risks: string[];
  bottlenecks: string[];
  recommendations: string[];
  departments: { name: string; status: "healthy" | "watch" | "critical" }[];
};
