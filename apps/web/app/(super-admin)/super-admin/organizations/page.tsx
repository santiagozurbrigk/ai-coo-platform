import { OrganizationsList } from "@/components/super-admin";
import { loadOrganizationsList } from "@/lib/super-admin/queries";

export default async function SuperAdminOrganizationsPage() {
  const organizations = await loadOrganizationsList();
  return <OrganizationsList organizations={organizations} />;
}
