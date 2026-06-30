import { TeamOverview } from "@/components/team/team-overview";
import { getTeamPageContextAction } from "@/app/team/actions";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export default async function TeamPage() {
  if (!isSupabaseConfigured()) {
    return (
      <TeamOverview
        members={[]}
        roles={[]}
        invitations={[]}
        canManage={false}
        canEditRates={false}
      />
    );
  }

  const ctx = await getTeamPageContextAction();

  return (
    <TeamOverview
      members={ctx.members}
      roles={ctx.roles}
      invitations={ctx.invitations}
      canManage={ctx.canManage}
      canEditRates={ctx.canEditRates}
    />
  );
}
