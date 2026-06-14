import { WorkboardShell } from "@/components/workboard";
import { loadWorkboardPageDataAction } from "@/app/workboard/actions";
import { WorkboardProvider } from "@/providers/workboard-provider";

export default async function WorkboardPage() {
  const { tasks, members, sprints } = await loadWorkboardPageDataAction();
  const activeSprint = sprints.find((s) => s.status === "active");
  const initialSprintFilterId = activeSprint?.id ?? "all";

  return (
    <WorkboardProvider
      initialTasks={tasks}
      members={members}
      initialSprints={sprints}
      initialSprintFilterId={initialSprintFilterId}
    >
      <WorkboardShell />
    </WorkboardProvider>
  );
}
