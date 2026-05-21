import { TeamMembersTable } from "@/components/team";
import { mockTeamMembers } from "@/mocks";

export default function TeamMembersPage() {
  return <TeamMembersTable members={mockTeamMembers} />;
}
