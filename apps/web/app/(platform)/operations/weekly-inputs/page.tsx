import {
  getWeeklyCompletionStatus,
  getWeeklyInputsAction,
} from "@/app/operations/actions";
import { getCurrentWeekStart } from "@/lib/operations/weekly-utils";
import { WeeklyInputsPageContent } from "@/components/operations/weekly-inputs-page-content";

export default async function WeeklyInputsPage() {
  const weekStart = getCurrentWeekStart();
  const [initialInputs, completion] = await Promise.all([
    getWeeklyInputsAction(weekStart),
    getWeeklyCompletionStatus(weekStart),
  ]);

  return (
    <WeeklyInputsPageContent
      initialInputs={initialInputs}
      initialCompleted={completion.completed}
      initialInputCount={completion.completed.length}
      weekStart={weekStart}
    />
  );
}
