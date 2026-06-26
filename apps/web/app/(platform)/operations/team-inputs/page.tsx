import { MessageSquarePlus } from "lucide-react";
import { TeamInputForm } from "@/components/operations/team-input-form";
import { TeamInputsList } from "@/components/operations/team-inputs-list";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { getWeeklyInputsAction } from "@/app/operations/actions";
import { mapWeeklyInputRowsToTeamInputs } from "@/lib/operations/weekly-input-mapper";

export default async function TeamInputsPage() {
  const rows = await getWeeklyInputsAction();
  const inputs = mapWeeklyInputRowsToTeamInputs(rows);

  return (
    <div className="space-y-8">
      <PageHeader description="Contexto intencional para la IA y el liderazgo" />
      <TeamInputForm />
      {inputs.length > 0 ? (
        <TeamInputsList inputs={inputs} />
      ) : (
        <EmptyState
          icon={<MessageSquarePlus className="h-8 w-8" />}
          title="Todavía no hay inputs esta semana"
          description="Enviá el primer input desde el formulario de arriba. Lo que cargues queda disponible para la IA en sus análisis."
        />
      )}
    </div>
  );
}
