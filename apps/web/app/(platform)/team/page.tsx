import { TeamOverview } from "@/components/team/team-overview";
import { mockTeamMembers } from "@/mocks";

export default function TeamPage() {
  return <TeamOverview members={mockTeamMembers} />;
}
