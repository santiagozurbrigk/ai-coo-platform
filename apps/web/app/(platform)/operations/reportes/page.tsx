import { FileText, History, CalendarRange, CalendarDays } from "lucide-react";
import { ReportDetail, ReportsGrid } from "@/components/executive-reports";
import { ExecutiveReportEmptyState } from "@/components/executive-reports/executive-report-empty-state";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { ReportesPageTabs } from "@/components/operations/reportes-page-tabs";
import {
  getLatestExecutiveReportAction,
  listExecutiveReportsAction,
} from "@/app/executive-reports/actions";
import { getCurrentProfile } from "@/lib/auth/bootstrap";

export default async function ReportesPage() {
  const [weeklyReport, monthlyReport, allReports, profile] = await Promise.all([
    getLatestExecutiveReportAction("weekly"),
    getLatestExecutiveReportAction("monthly"),
    listExecutiveReportsAction(),
    getCurrentProfile(),
  ]);

  const isFounder = profile?.role === "founder";

  const weeklyContent = weeklyReport ? (
    <ReportDetail report={weeklyReport} />
  ) : (
    <ExecutiveReportEmptyState period="weekly" isFounder={isFounder} />
  );

  const monthlyContent = monthlyReport ? (
    <ReportDetail report={monthlyReport} />
  ) : (
    <ExecutiveReportEmptyState period="monthly" isFounder={isFounder} />
  );

  const historyContent =
    allReports.length > 0 ? (
      <ReportsGrid reports={allReports} />
    ) : (
      <EmptyState
        icon={<FileText className="h-8 w-8" />}
        title="Todavía no hay reportes"
        description="Cuando se genere el primer reporte semanal o mensual va a aparecer en este historial."
      />
    );

  return (
    <div className="space-y-4">
      <PageHeader description="Reportes ejecutivos generados con IA a partir de los inputs del equipo" />
      <ReportesPageTabs
        weeklyContent={weeklyContent}
        monthlyContent={monthlyContent}
        historyContent={historyContent}
      />
    </div>
  );
}
