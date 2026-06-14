import { TeamOverview } from "@/components/team/team-overview";
import { getTeamPageContextAction } from "@/app/team/actions";
import { mockTeamMembers } from "@/mocks";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export default async function TeamPage() {
  if (isSupabaseConfigured()) {
    const ctx = await getTeamPageContextAction();
    const members = ctx.members.length ? ctx.members : mockTeamMembers;

    return (
      <TeamOverview
        members={members}
        roles={ctx.roles}
        invitations={ctx.invitations}
        canManage={ctx.canManage}
        canEditRates={ctx.canEditRates}
      />
    );
  }

  return (
    <TeamOverview
      members={mockTeamMembers}
      roles={[]}
      invitations={[]}
      canManage={false}
      canEditRates={false}
    />
  );
}
