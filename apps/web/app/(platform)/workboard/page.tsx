import { WorkboardShell } from "@/components/workboard";
import { loadWorkboardPageDataAction } from "@/app/workboard/actions";
import { WorkboardProvider } from "@/providers/workboard-provider";

export default async function WorkboardPage() {
  const { tasks, members } = await loadWorkboardPageDataAction();

  return (
    <WorkboardProvider initialTasks={tasks} members={members}>
      <WorkboardShell />
    </WorkboardProvider>
  );
}
