import { ReportsGrid } from "@/components/executive-reports";
import { mockExecutiveReports } from "@/mocks";

export default function ExecutiveReportsWeeklyPage() {
  const weekly = mockExecutiveReports.filter((r) => r.period === "weekly");
  return <ReportsGrid reports={weekly} />;
}
