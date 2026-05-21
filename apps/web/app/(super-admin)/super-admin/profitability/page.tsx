import { ProfitabilityCards, OrgTable } from "@/components/super-admin";
import { mockOrganizations } from "@/mocks";

export default function SuperAdminProfitabilityPage() {
  return (
    <div className="space-y-8">
      <ProfitabilityCards />
      <OrgTable organizations={mockOrganizations} />
    </div>
  );
}
