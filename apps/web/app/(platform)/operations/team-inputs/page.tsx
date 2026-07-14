import { MessageSquarePlus } from "lucide-react";
import { TeamInputForm } from "@/components/operations/team-input-form";
import { TeamInputsList } from "@/components/operations/team-inputs-list";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { getWeeklyInputsAction } from "@/app/operations/actions";
import { mapWeeklyInputRowsToTeamInputs } from "@/lib/operations/weekly-input-mapper";
import { formatWeekRange, getCurrentWeekStart } from "@/lib/operations/weekly-utils";

export default async function TeamInputsPage() {
  const weekStart = getCurrentWeekStart();
  const rows = await getWeeklyInputsAction(weekStart);
  const inputs = mapWeeklyInputRowsToTeamInputs(rows);

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <PageHeader description="Contexto intencional para la IA y el liderazgo" />
        <p className="text-sm text-muted-foreground">{formatWeekRange(weekStart)}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <TeamInputForm />
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">
            Inputs de esta semana ({inputs.length})
          </h3>
          {inputs.length > 0 ? (
            <TeamInputsList inputs={inputs} />
          ) : (
            <EmptyState
              icon={<MessageSquarePlus className="h-7 w-7" />}
              title="Sin inputs esta semana"
              description="Lo que cargues queda disponible para la IA en sus análisis."
            />
          )}
        </div>
      </div>
    </div>
  );
}
