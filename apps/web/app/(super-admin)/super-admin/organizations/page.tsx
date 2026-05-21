import { OrgTable } from "@/components/super-admin";
import { mockOrganizations } from "@/mocks";

export default function SuperAdminOrganizationsPage() {
  return <OrgTable organizations={mockOrganizations} />;
}
