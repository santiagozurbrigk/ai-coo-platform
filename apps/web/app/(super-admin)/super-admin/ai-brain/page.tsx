import { BrainDashboard } from "@/components/ai-brain/brain-dashboard";
import { loadAiBrainDashboard } from "@/lib/super-admin/queries";

export default async function AiBrainDashboardPage() {
  const data = await loadAiBrainDashboard();
  return (
    <BrainDashboard
      health={data.health}
      breakdown={data.breakdown}
      coverage={data.coverage}
      insights={[]}
      recent={data.recent}
      statusCounts={data.statusCounts}
      phase2Note
    />
  );
}
