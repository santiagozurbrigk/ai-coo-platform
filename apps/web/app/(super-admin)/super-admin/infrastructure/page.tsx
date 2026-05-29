import { InfrastructurePage } from "@/components/super-admin";
import { loadInfrastructureStats } from "@/lib/super-admin/queries";

export default async function SuperAdminInfrastructurePage() {
  const stats = await loadInfrastructureStats();
  return <InfrastructurePage stats={stats} />;
}
