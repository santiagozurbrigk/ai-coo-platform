"use client";

import { FileText } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { GenerateWeeklyPipelineButton } from "@/components/operations/generate-weekly-pipeline-button";

export function ExecutiveReportEmptyState({
  period,
  isFounder = false,
}: {
  period: "weekly" | "monthly";
  isFounder?: boolean;
}) {
  const isWeekly = period === "weekly";

  return (
    <div className="space-y-4">
      <EmptyState
        icon={<FileText className="h-8 w-8" />}
        title={
          isWeekly
            ? "Todavía no hay reportes ejecutivos semanales"
            : "Todavía no hay reportes ejecutivos mensuales"
        }
        description={
          isWeekly
            ? "El reporte semanal se genera automáticamente los lunes, o podés generarlo ahora si ya hay datos de la semana."
            : "El reporte mensual se genera el día 1 de cada mes a partir de los reportes semanales. Primero necesitás al menos un reporte semanal."
        }
      />
      {isWeekly ? (
        <div className="flex justify-center">
          <GenerateWeeklyPipelineButton isFounder={isFounder} />
        </div>
      ) : null}
    </div>
  );
}
