import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@ai-coo/ui";
import { getReportCadence } from "@/lib/executive-reports/cadences";
import { formatRelativeTime } from "@/lib/format";
import { paths } from "@/routes";
import type { ExecutiveReport } from "@/types/executive-reports";

/** Color del punto de cadencia. Diario más tenue: es el de menor peso. */
const CADENCE_DOT: Record<string, string> = {
  daily: "bg-muted-foreground/40",
  weekly: "bg-primary",
  monthly: "bg-primary",
};

export function ReportCard({ report }: { report: ExecutiveReport }) {
  const cadence = getReportCadence(report.period);

  return (
    <Link
      href={paths.platform.executiveReports.detail(report.id)}
      className="group flex flex-col rounded-2xl border border-border bg-card p-4 transition-colors hover:border-primary/40 dark:border-glass dark:bg-glass"
    >
      <div className="flex items-start justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className={cn("h-1.5 w-1.5 rounded-full", CADENCE_DOT[report.period])} />
          {cadence.label}
        </span>
        <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
      </div>

      <p className="mt-2 text-sm font-medium">{report.weekLabel}</p>
      <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
        {report.executiveSummary}
      </p>

      {report.generatedAt ? (
        <p className="mt-3 text-xs text-muted-foreground">
          Generado {formatRelativeTime(report.generatedAt)}
        </p>
      ) : null}
    </Link>
  );
}
