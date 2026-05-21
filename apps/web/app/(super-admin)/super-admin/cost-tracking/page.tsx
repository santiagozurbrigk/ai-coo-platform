import { UsageTable, ProfitabilityCards } from "@/components/super-admin";
import { mockAiUsage } from "@/mocks";

export default function SuperAdminCostTrackingPage() {
  return (
    <div className="space-y-8">
      <ProfitabilityCards />
      <UsageTable rows={mockAiUsage} />
    </div>
  );
}
