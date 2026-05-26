import { TeamInputForm } from "@/components/operations/team-input-form";
import { TeamInputsList } from "@/components/operations/team-inputs-list";
import { PageHeader } from "@/components/shared/page-header";
import { mockTeamInputs } from "@/mocks/operations";

export default function TeamInputsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Team Inputs"
        description="Contexto intencional para la IA y el liderazgo"
      />
      <TeamInputForm />
      <TeamInputsList inputs={mockTeamInputs} />
    </div>
  );
}
