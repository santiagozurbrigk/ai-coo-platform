import { CalendarRange } from "lucide-react";
import { ReportDetail } from "@/components/executive-reports";
import { EmptyState } from "@/components/shared/empty-state";
import { getLatestExecutiveReportAction } from "@/app/executive-reports/actions";

export default async function ExecutiveReportsMonthlyPage() {
  const report = await getLatestExecutiveReportAction("monthly");

  if (!report) {
    return (
      <EmptyState
        icon={<CalendarRange className="h-8 w-8" />}
        title="Todavía no hay reportes ejecutivos mensuales"
        description="El reporte mensual se genera el día 1 de cada mes y analiza la tendencia sobre los reportes semanales reales del mes anterior."
      />
    );
  }

  return <ReportDetail report={report} />;
}
