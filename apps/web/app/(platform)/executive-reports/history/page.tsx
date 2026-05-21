import { ReportsGrid } from "@/components/executive-reports";
import { mockExecutiveReports } from "@/mocks";

export default function ExecutiveReportsHistoryPage() {
  return <ReportsGrid reports={mockExecutiveReports} />;
}
