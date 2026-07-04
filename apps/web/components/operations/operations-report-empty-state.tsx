import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@ai-coo/ui";
import { Panel } from "@/components/shared/panel";
import { GenerateWeeklyPipelineButton } from "@/components/operations/generate-weekly-pipeline-button";
import { paths } from "@/routes";

export function OperationsReportEmptyState({
  isFounder = false,
}: {
  isFounder?: boolean;
}) {
  return (
    <Panel title="Reporte ejecutivo">
      <div className="flex flex-col items-start gap-4 py-4">
        <p className="text-sm text-muted-foreground">
          Completá los inputs semanales del equipo para generar tu reporte ejecutivo
          con IA, o generá uno ahora si ya hay actividad en la plataforma.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button asChild className="bg-violet-600 hover:bg-violet-700">
            <Link href={paths.platform.operations.weeklyInputs}>
              Ir a inputs semanales
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <GenerateWeeklyPipelineButton isFounder={isFounder} />
        </div>
        {isFounder ? (
          <p className="text-xs text-muted-foreground">
            &quot;Generar reporte ahora&quot; ejecuta el mismo pipeline que el cron semanal
            (Operaciones, reporte ejecutivo e Inteligencia).
          </p>
        ) : null}
      </div>
    </Panel>
  );
}
