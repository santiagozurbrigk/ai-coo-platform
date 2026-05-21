import type { ExecutiveReport } from "@/types/executive-reports";
import { ReportCard } from "./report-card";

export function ReportsGrid({ reports }: { reports: ExecutiveReport[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {reports.map((report) => (
        <ReportCard key={report.id} report={report} />
      ))}
    </div>
  );
}
