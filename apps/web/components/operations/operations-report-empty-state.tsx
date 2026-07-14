import Link from "next/link";
import { ArrowRight, ClipboardList, Sparkles } from "lucide-react";
import { Button, cn } from "@ai-coo/ui";
import { GenerateWeeklyPipelineButton } from "@/components/operations/generate-weekly-pipeline-button";
import { paths } from "@/routes";

const STEPS = [
  {
    icon: ClipboardList,
    label: "Completá los inputs semanales",
    description: "Al menos 2 departamentos para activar el reporte.",
    href: paths.platform.operations.weeklyInputs,
  },
  {
    icon: Sparkles,
    label: "Generá el reporte con IA",
    description: "El sistema analiza inputs, métricas y actividad.",
    href: null,
  },
];

export function OperationsReportEmptyState({
  isFounder = false,
}: {
  isFounder?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-border/60 bg-muted/20 p-6 dark:bg-glass dark:border-glass">
      <div className="space-y-5">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold">Sin reporte ejecutivo esta semana</h3>
          <p className="text-sm text-muted-foreground">
            Completá los inputs del equipo para que la IA genere tu análisis operacional semanal.
          </p>
        </div>

        <ol className="space-y-3">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <li key={i} className="flex items-start gap-3">
                <span className={cn(
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                  i === 0
                    ? "bg-violet-500/15 text-violet-600 dark:text-violet-400"
                    : "bg-muted text-muted-foreground"
                )}>
                  {i + 1}
                </span>
                <div className="space-y-0.5 pt-0.5">
                  <p className="text-sm font-medium leading-tight">{step.label}</p>
                  <p className="text-xs text-muted-foreground">{step.description}</p>
                </div>
              </li>
            );
          })}
        </ol>

        <div className="flex flex-wrap gap-2">
          <Button asChild className="bg-violet-600 hover:bg-violet-700">
            <Link href={paths.platform.operations.weeklyInputs}>
              Ir a inputs semanales
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          {isFounder ? <GenerateWeeklyPipelineButton isFounder={isFounder} /> : null}
        </div>

        {isFounder ? (
          <p className="text-xs text-muted-foreground">
            "Generar reporte ahora" ejecuta el mismo pipeline que el cron semanal
            (Operaciones, reporte ejecutivo e Inteligencia).
          </p>
        ) : null}
      </div>
    </div>
  );
}
