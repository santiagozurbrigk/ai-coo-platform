import type {
  DashboardAiRecommendation,
  DashboardRisk,
} from "@/types/dashboard";
import type {
  OperationsBottleneck,
  OperationsOverviewData,
  OperationsRecommendation,
  OperationsRisk,
  OperationsRiskLevel,
} from "@/types/operations-overview";
import type { WeeklyReportRow } from "@/types/operations";
import { DB_DEPARTMENT_LABELS } from "./weekly-utils";

function asRiskLevel(value: unknown): OperationsRiskLevel {
  const v = String(value ?? "").toLowerCase();
  if (v === "high" || v === "medium" || v === "low") return v;
  return "medium";
}

function mapAreaToOperationsArea(
  area: string
): OperationsBottleneck["department"] {
  const lower = area.toLowerCase();
  if (lower.includes("venta") || lower === "sales") return "sales";
  if (lower.includes("deliver")) return "delivery";
  if (lower.includes("market")) return "marketing";
  return "operations";
}

export function weeklyReportToOperationsOverview(
  report: WeeklyReportRow,
  departmentsFallback: OperationsOverviewData["departments"]
): OperationsOverviewData {
  const risks = (report.risks ?? []) as Array<{
    title?: string;
    description?: string;
    level?: string;
  }>;

  const bottlenecks = (report.bottlenecks ?? []) as Array<{
    area?: string;
    description?: string;
  }>;

  const recommendations = (report.recommendations ?? []) as Array<{
    title?: string;
    description?: string;
    priority?: string;
  }>;

  const executiveParagraphs = (report.executive_summary ?? "")
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  return {
    executiveReport:
      executiveParagraphs.length > 0
        ? executiveParagraphs
        : ["Reporte generado sin resumen ejecutivo."],
    risks: risks.map((risk, index) => ({
      id: `wr-risk-${index}`,
      title: risk.title ?? "Riesgo detectado",
      description: risk.description ?? "",
      level: asRiskLevel(risk.level),
      suggestedAction: "Revisar en el workboard o inputs del equipo",
    })),
    bottlenecks: bottlenecks.map((item, index) => ({
      id: `wr-bn-${index}`,
      department: mapAreaToOperationsArea(item.area ?? "operaciones"),
      title: item.area ?? "Área",
      description: item.description ?? "",
      impact: "medium" as const,
    })),
    departments: departmentsFallback,
    recommendations: recommendations.map((rec, index) => ({
      id: `wr-rec-${index}`,
      title: rec.title ?? "Recomendación",
      description: rec.description ?? "",
      priority: asRiskLevel(rec.priority),
      department: "Operaciones",
    })),
  };
}

export function weeklyReportToDashboardRisks(
  report: WeeklyReportRow
): DashboardRisk[] {
  const risks = (report.risks ?? []) as Array<{
    title?: string;
    description?: string;
    level?: string;
  }>;

  return risks.slice(0, 3).map((risk, index) => ({
    id: `wr-dash-risk-${index}`,
    title: risk.title ?? "Riesgo",
    description: risk.description ?? "",
    suggestedAction: "Ver detalle en Operaciones",
    severity: asRiskLevel(risk.level),
    department: "Operaciones",
  }));
}

export function weeklyReportToDashboardRecommendations(
  report: WeeklyReportRow
): DashboardAiRecommendation[] {
  const recommendations = (report.recommendations ?? []) as Array<{
    title?: string;
    description?: string;
    priority?: string;
  }>;

  return recommendations.slice(0, 3).map((rec, index) => ({
    id: `wr-dash-rec-${index}`,
    text: [rec.title, rec.description].filter(Boolean).join(" — "),
    category: DB_DEPARTMENT_LABELS.operaciones,
  }));
}
