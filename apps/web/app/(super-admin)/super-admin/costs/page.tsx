import { AiCostDashboardContent } from "@/components/super-admin/ai-cost-dashboard-content";
import { loadAiCostDashboard } from "@/lib/super-admin/queries";

export default async function SuperAdminCostsPage() {
  const data = await loadAiCostDashboard();
  return <AiCostDashboardContent data={data} />;
}
