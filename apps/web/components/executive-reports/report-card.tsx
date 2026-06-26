import Link from "next/link";
import { Badge, Card, CardContent, CardHeader, CardTitle } from "@ai-coo/ui";
import { paths } from "@/routes";
import type { ExecutiveReport } from "@/types/executive-reports";

export function ReportCard({ report }: { report: ExecutiveReport }) {
  return (
    <Link href={paths.platform.executiveReports.detail(report.id)}>
      <Card className="transition-colors hover:bg-muted/20 h-full">
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-base">{report.title}</CardTitle>
            <Badge variant="secondary">
              {report.period === "weekly" ? "Semanal" : "Mensual"}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">{report.weekLabel}</p>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {report.executiveSummary}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
