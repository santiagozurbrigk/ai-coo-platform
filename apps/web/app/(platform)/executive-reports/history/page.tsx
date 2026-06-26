import { FileText } from "lucide-react";
import { ReportsGrid } from "@/components/executive-reports";
import { EmptyState } from "@/components/shared/empty-state";
import { listExecutiveReportsAction } from "@/app/executive-reports/actions";

export default async function ExecutiveReportsHistoryPage() {
  const reports = await listExecutiveReportsAction();

  if (reports.length === 0) {
    return (
      <EmptyState
        icon={<FileText className="h-8 w-8" />}
        title="Todavía no hay reportes ejecutivos"
        description="Cuando se genere el primer reporte semanal o mensual va a aparecer en este historial."
      />
    );
  }

  return <ReportsGrid reports={reports} />;
}
