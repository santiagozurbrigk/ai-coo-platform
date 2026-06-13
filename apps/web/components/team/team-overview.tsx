"use client";

import { useCallback, useEffect, useState } from "react";
import { ModuleSubnav } from "@/components/shared/client";
import { getTeamPageContextAction } from "@/app/team/actions";
import { useHashTab } from "@/lib/hooks/use-hash-tab";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { paths } from "@/routes";
import { usePlatformData } from "@/providers";
import type { TeamMember } from "@/types/team";
import { CustomRoleForm } from "./custom-role-form";
import { CustomRolesList } from "./custom-roles-list";
import { TeamMembersTable } from "./team-members-table";

const TABS = [
  { id: "miembros", label: "Miembros", hash: "miembros" },
  { id: "roles", label: "Roles", hash: "roles" },
] as const;

const DEFAULT_TAB = TABS[0].hash;

export function TeamOverview({
  members: initialMembers,
}: {
  members: TeamMember[];
}) {
  const activeTab = useHashTab(DEFAULT_TAB);
  const { customRoles } = usePlatformData();
  const root = paths.platform.team.root;

  const [members, setMembers] = useState(initialMembers);
  const [canEditRates, setCanEditRates] = useState(false);

  const refreshMembers = useCallback(async () => {
    if (!isSupabaseConfigured()) return;
    try {
      const ctx = await getTeamPageContextAction();
      if (ctx.members.length) setMembers(ctx.members);
      setCanEditRates(ctx.canEditRates);
    } catch {
      /* keep current */
    }
  }, []);

  useEffect(() => {
    void refreshMembers();
  }, [refreshMembers]);

  const navTabs = TABS.map((t) => ({
    label: t.label,
    href: `${root}#${t.hash}`,
  }));

  return (
    <div className="space-y-6">
      <ModuleSubnav
        tabs={navTabs}
        isTabActive={(href) => {
          const hash = href.split("#")[1] ?? DEFAULT_TAB;
          return activeTab === hash;
        }}
      />
      {activeTab === "roles" ? (
        <div className="space-y-8">
          <CustomRoleForm />
          <CustomRolesList roles={customRoles} />
          <p className="rounded-lg border border-border/60 bg-muted/20 p-4 text-sm text-muted-foreground">
            Los miembros del equipo los crea el administrador del sistema. Cuando
            estén dados de alta, podrás asignar aquí los roles personalizados que
            definas.
          </p>
        </div>
      ) : (
        <>
          <TeamMembersTable
            members={members}
            customRoles={customRoles}
            canEditRates={canEditRates}
            onRatesUpdated={() => void refreshMembers()}
          />
          {members.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Aún no hay miembros en tu espacio de trabajo.
            </p>
          )}
        </>
      )}
    </div>
  );
}
