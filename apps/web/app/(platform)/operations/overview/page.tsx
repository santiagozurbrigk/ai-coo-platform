import { getWeeklyReportAction } from "@/app/operations/actions";
import { OperationsOverview } from "@/components/operations/operations-overview";
import { PageHeader } from "@/components/shared/page-header";

export default async function OperationsOverviewPage() {
  const weeklyReport = await getWeeklyReportAction();

  return (
    <div className="space-y-6">
      <PageHeader description="Salud operativa y capacidad del equipo" />
      <OperationsOverview weeklyReport={weeklyReport} />
    </div>
  );
}
