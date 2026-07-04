import { FileText } from "lucide-react";
import { ExecutiveReportEmptyState } from "@/components/executive-reports/executive-report-empty-state";
import { ReportDetail } from "@/components/executive-reports";
import { getLatestExecutiveReportAction } from "@/app/executive-reports/actions";
import { getCurrentProfile } from "@/lib/auth/bootstrap";

export default async function ExecutiveReportsWeeklyPage() {
  const [report, profile] = await Promise.all([
    getLatestExecutiveReportAction("weekly"),
    getCurrentProfile(),
  ]);

  if (!report) {
    return (
      <ExecutiveReportEmptyState
        period="weekly"
        isFounder={profile?.role === "founder"}
      />
    );
  }

  return <ReportDetail report={report} />;
}
