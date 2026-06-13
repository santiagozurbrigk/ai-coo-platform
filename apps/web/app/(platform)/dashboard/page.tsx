import { getWeeklyReportAction } from "@/app/operations/actions";
import { DashboardPageContent } from "@/components/dashboard/dashboard-page-content";

export default async function DashboardPage() {
  const weeklyReport = await getWeeklyReportAction();

  return <DashboardPageContent weeklyReport={weeklyReport} />;
}
