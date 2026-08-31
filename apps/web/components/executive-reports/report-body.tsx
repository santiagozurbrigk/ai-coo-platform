import { AlertTriangle, Info, ListChecks, TrendingDown } from "lucide-react";
import { cn } from "@ai-coo/ui";
import { getReportCadence, isStale } from "@/lib/executive-reports/cadences";
import { formatRelativeTime } from "@/lib/format";
import type { ExecutiveReport } from "@/types/executive-reports";

/**
 * El cuerpo de un reporte ejecutivo.
 *
 * Se usa igual en el panel de la topbar y en la página de detalle: el mismo
 * reporte no debería leerse distinto según por dónde se entró.
 *
 * ⭐ **Cada cadencia se lee distinto y la UI lo dice.** El pulso diario lleva
 * su advertencia arriba de todo, porque el documento fuente es explícito en que
 * no se decide con un solo día de datos. Sin ese aviso, un mal martes parece un
 * problema estructural.
 */

const DEPT_STATUS: Record<string, { dot: string; label: string }> = {
  healthy: { dot: "bg-emerald-500", label: "Sano" },
  watch: { dot: "bg-amber-500", label: "Mirar" },
  critical: { dot: "bg-red-500", label: "Crítico" },
};

function ItemList({
  items,
  icon,
  emptyLabel,
  accent,
}: {
  items: string[];
  icon: React.ReactNode;
  emptyLabel: string;
  accent: string;
}) {
  if (items.length === 0) {
    return <p className="text-xs text-muted-foreground">{emptyLabel}</p>;
  }

  return (
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2 text-sm">
          <span className={cn("mt-0.5 shrink-0", accent)}>{icon}</span>
          <span className="min-w-0 text-muted-foreground">{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function ReportBody({
  report,
  compact = false,
}: {
  report: ExecutiveReport;
  /** En el panel se ajusta la densidad; en la página de detalle respira más. */
  compact?: boolean;
}) {
  const cadence = getReportCadence(report.period);
  const stale = isStale(report.period, report.generatedAt);

  return (
    <div className={cn("space-y-5", compact && "space-y-4")}>
      {/* Cabecera: de cuándo es y si quedó viejo */}
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <span className="text-sm font-medium">{report.weekLabel}</span>
        {report.generatedAt ? (
          <span className="text-xs text-muted-foreground">
            · generado {formatRelativeTime(report.generatedAt)}
          </span>
        ) : null}
        {stale ? (
          <span className="inline-flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
            <AlertTriangle className="h-3 w-3" />
            el último {cadence.label.toLowerCase()} quedó viejo
          </span>
        ) : null}
      </div>

      {/* ⭐ La advertencia del pulso diario, arriba de los números */}
      {cadence.caution ? (
        <p className="flex items-start gap-2 rounded-xl border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>{cadence.caution}</span>
        </p>
      ) : null}

      <p className={cn("text-sm leading-relaxed", compact && "text-sm")}>
        {report.executiveSummary}
      </p>

      <div className={cn("grid gap-5", !compact && "sm:grid-cols-2")}>
        <section className="space-y-2">
          <h4 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Riesgos
          </h4>
          <ItemList
            items={report.risks}
            icon={<AlertTriangle className="h-3.5 w-3.5" />}
            accent="text-red-500"
            emptyLabel="Ninguno detectado en este período."
          />
        </section>

        <section className="space-y-2">
          <h4 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Cuellos de botella
          </h4>
          <ItemList
            items={report.bottlenecks}
            icon={<TrendingDown className="h-3.5 w-3.5" />}
            accent="text-amber-500"
            emptyLabel="Ninguno detectado en este período."
          />
        </section>
      </div>

      {/*
        El pulso diario no trae recomendaciones por diseño, así que su sección
        directamente no se dibuja en vez de mostrarse vacía: un bloque
        "Recomendaciones — ninguna" se leería como que la IA no encontró nada,
        cuando en realidad no se le pidió.
      */}
      {report.period !== "daily" ? (
        <section className="space-y-2">
          <h4 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Recomendaciones
          </h4>
          <ItemList
            items={report.recommendations}
            icon={<ListChecks className="h-3.5 w-3.5" />}
            accent="text-primary"
            emptyLabel="Sin recomendaciones para este período."
          />
        </section>
      ) : null}

      {report.departments.length > 0 ? (
        <section className="space-y-2">
          <h4 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Por departamento
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {report.departments.map((dept) => {
              const status = DEPT_STATUS[dept.status] ?? DEPT_STATUS.watch;
              return (
                <span
                  key={dept.name}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1 text-xs"
                  title={status.label}
                >
                  <span className={cn("h-1.5 w-1.5 rounded-full", status.dot)} />
                  {dept.name}
                </span>
              );
            })}
          </div>
        </section>
      ) : null}
    </div>
  );
}
