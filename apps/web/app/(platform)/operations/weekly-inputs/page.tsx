import { WeeklyInputForm, WeeklyInputsList } from "@/components/operations";
import { mockWeeklyInputs } from "@/mocks";

export default function WeeklyInputsPage() {
  return (
    <div className="space-y-8">
      <WeeklyInputForm />
      <WeeklyInputsList inputs={mockWeeklyInputs} />
    </div>
  );
}
