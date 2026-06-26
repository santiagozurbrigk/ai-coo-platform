import { FileText } from "lucide-react";
import { ReportDetail } from "@/components/executive-reports";
import { EmptyState } from "@/components/shared/empty-state";
import { getLatestExecutiveReportAction } from "@/app/executive-reports/actions";

export default async function ExecutiveReportsWeeklyPage() {
  const report = await getLatestExecutiveReportAction("weekly");

  if (!report) {
    return (
      <EmptyState
        icon={<FileText className="h-8 w-8" />}
        title="Todavía no hay reportes ejecutivos semanales"
        description="El reporte semanal se genera automáticamente los lunes a la mañana en base a la actividad real de la semana. Volvé a revisar después de la primera corrida."
      />
    );
  }

  return <ReportDetail report={report} />;
}
