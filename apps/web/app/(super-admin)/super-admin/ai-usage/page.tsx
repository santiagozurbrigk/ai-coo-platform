import { UsageTable } from "@/components/super-admin";
import { mockAiUsage } from "@/mocks";

export default function SuperAdminAiUsagePage() {
  return <UsageTable rows={mockAiUsage} />;
}
