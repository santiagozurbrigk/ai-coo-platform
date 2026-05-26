"use client";

import { ModuleSubnav } from "@/components/shared/client";
import { useHashTab } from "@/lib/hooks/use-hash-tab";
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

export function TeamOverview({ members }: { members: TeamMember[] }) {
  const activeTab = useHashTab(DEFAULT_TAB);
  const { customRoles } = usePlatformData();
  const root = paths.platform.team.root;

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
          <p className="text-sm text-muted-foreground rounded-lg border border-border/60 bg-muted/20 p-4">
            Los miembros del equipo los crea el administrador del sistema. Cuando
            estén dados de alta, podrás asignar aquí los roles personalizados que
            definas.
          </p>
        </div>
      ) : (
        <>
          <TeamMembersTable members={members} customRoles={customRoles} />
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
