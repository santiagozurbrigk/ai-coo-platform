import { REPORT_CADENCES } from "@/lib/executive-reports/cadences";
import type { ExecutiveReport } from "@/types/executive-reports";
import { ReportCard } from "./report-card";

/**
 * Historial de reportes, agrupado por cadencia.
 *
 * Se agrupa y no se mezcla por fecha a propósito: los diarios son muchos más
 * que los semanales y los mensuales, así que una lista cronológica única los
 * enterraría. Y son tres lecturas distintas, no la misma con distinta fecha.
 */
export function ReportsGrid({ reports }: { reports: ExecutiveReport[] }) {
  return (
    <div className="space-y-8">
      {REPORT_CADENCES.map((cadence) => {
        const delGrupo = reports.filter((r) => r.period === cadence.id);
        if (delGrupo.length === 0) return null;

        return (
          <section key={cadence.id} className="space-y-3">
            <div className="flex items-baseline justify-between gap-3">
              <h3 className="text-sm font-medium">
                {cadence.label}{" "}
                <span className="text-muted-foreground">· {cadence.title}</span>
              </h3>
              <p className="text-xs text-muted-foreground">
                {delGrupo.length} {delGrupo.length === 1 ? "reporte" : "reportes"}
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {delGrupo.map((report) => (
                <ReportCard key={report.id} report={report} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
