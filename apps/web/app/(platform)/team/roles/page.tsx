import { RolesGrid } from "@/components/team";
import { mockRoles } from "@/mocks";

export default function TeamRolesPage() {
  return <RolesGrid roles={mockRoles} />;
}
