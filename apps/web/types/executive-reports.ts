/**
 * Las tres cadencias de la §06 del documento fuente. Ver
 * `lib/executive-reports/cadences.ts` para qué mira cada una.
 */
export type ReportPeriod = "daily" | "weekly" | "monthly";

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
