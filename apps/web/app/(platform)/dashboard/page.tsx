import { DashboardOverview } from "@/components/dashboard";
import { mockDashboard } from "@/mocks";

export default function DashboardPage() {
  return <DashboardOverview data={mockDashboard} />;
}
