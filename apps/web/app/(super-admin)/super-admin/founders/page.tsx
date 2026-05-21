import { FoundersTable } from "@/components/super-admin";
import { mockFounders } from "@/mocks";

export default function SuperAdminFoundersPage() {
  return <FoundersTable founders={mockFounders} />;
}
