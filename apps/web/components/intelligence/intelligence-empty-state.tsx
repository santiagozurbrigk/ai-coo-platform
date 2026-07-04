"use client";

import { Brain } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { GenerateWeeklyPipelineButton } from "@/components/operations/generate-weekly-pipeline-button";

export function IntelligenceEmptyState({ isFounder = false }: { isFounder?: boolean }) {
  return (
    <div className="space-y-4">
      <EmptyState
        icon={<Brain className="h-8 w-8" />}
        title="Todavía no hay suficientes datos para generar insights"
        description="El análisis cruzado con IA corre automáticamente dos veces al día. Como fundador, también podés dispararlo manualmente cuando haya actividad en ventas, operaciones o finanzas."
      />
      <div className="flex justify-center">
        <GenerateWeeklyPipelineButton isFounder={isFounder} />
      </div>
    </div>
  );
}
