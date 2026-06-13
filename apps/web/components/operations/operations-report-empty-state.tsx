import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@ai-coo/ui";
import { Panel } from "@/components/shared/panel";
import { paths } from "@/routes";

export function OperationsReportEmptyState() {
  return (
    <Panel title="Reporte ejecutivo">
      <div className="flex flex-col items-start gap-4 py-4">
        <p className="text-sm text-muted-foreground">
          Completá los inputs semanales del equipo para generar tu reporte ejecutivo
          con IA.
        </p>
        <Button asChild className="bg-violet-600 hover:bg-violet-700">
          <Link href={paths.platform.operations.weeklyInputs}>
            Ir a inputs semanales
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </Panel>
  );
}
