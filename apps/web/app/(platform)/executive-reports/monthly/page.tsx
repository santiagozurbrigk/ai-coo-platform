import { ReportsGrid } from "@/components/executive-reports";
import { mockExecutiveReports } from "@/mocks";

export default function ExecutiveReportsMonthlyPage() {
  const monthly = mockExecutiveReports.filter((r) => r.period === "monthly");
  return <ReportsGrid reports={monthly} />;
}
