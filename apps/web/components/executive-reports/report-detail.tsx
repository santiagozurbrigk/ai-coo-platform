import { AiCard, Badge } from "@ai-coo/ui";
import { es } from "@/lib/locale/es";
import { Panel } from "@/components/shared/panel";
import type { ExecutiveReport } from "@/types/executive-reports";

const DEPT_STATUS: Record<string, "success" | "warning" | "destructive"> = {
  healthy: "success",
  watch: "warning",
  critical: "destructive",
};

const DEPT_LABEL: Record<string, string> = {
  healthy: es.status.department.healthy,
  watch: es.status.department.watch,
  critical: es.status.department.critical,
};

export function ReportDetail({ report }: { report: ExecutiveReport }) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="secondary" className="capitalize">
          {report.period === "weekly" ? "Semanal" : "Mensual"}
        </Badge>
        <span className="text-sm text-muted-foreground">{report.weekLabel}</span>
      </div>

      <AiCard title="Resumen ejecutivo" confidence={0.93}>
        {report.executiveSummary}
      </AiCard>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Riesgos">
          <ul className="space-y-2 text-sm text-muted-foreground">
            {report.risks.map((r, i) => (
              <li key={i} className="flex gap-2 before:content-['•'] before:text-destructive">
                {r}
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title="Cuellos de botella">
          <ul className="space-y-2 text-sm text-muted-foreground">
            {report.bottlenecks.map((b, i) => (
              <li key={i} className="flex gap-2 before:content-['•'] before:text-warning">
                {b}
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <Panel title="Recomendaciones">
        <ul className="space-y-2">
          {report.recommendations.map((rec, i) => (
            <li key={i} className="text-sm rounded-md bg-muted/30 px-3 py-2">
              {rec}
            </li>
          ))}
        </ul>
      </Panel>

      <Panel title="Vista por departamento">
        <div className="flex flex-wrap gap-2">
          {report.departments.map((d) => (
            <div
              key={d.name}
              className="flex items-center gap-2 rounded-md border border-border px-3 py-2"
            >
              <span className="text-sm font-medium">{d.name}</span>
              <Badge variant={DEPT_STATUS[d.status]}>{DEPT_LABEL[d.status]}</Badge>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
