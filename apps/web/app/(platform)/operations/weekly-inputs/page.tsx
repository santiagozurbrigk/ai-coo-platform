import { WeeklyInputForm } from "@/components/operations/weekly-input-form";
import { WeeklyInputsList } from "@/components/operations/weekly-inputs-list";
import { PageHeader } from "@/components/shared/page-header";
import { mockTeamInputs } from "@/mocks/operations";

export default function WeeklyInputsPage() {
  return (
    <div className="space-y-8">
      <PageHeader description="Contexto semanal por departamento para reportes ejecutivos" />
      <WeeklyInputForm />
      <WeeklyInputsList inputs={mockTeamInputs} showEmptyState />
    </div>
  );
}
