import { createClient } from "@/lib/supabase/server";
import { permissionsFromRow } from "@/lib/team/mapper";
import { emptyPermissions } from "@/constants/permission-modules";
import type { PermissionModuleId } from "@/constants/permission-modules";
import type { PermissionLevel } from "@/types/team";

export type UserPermissions = {
  role: string;
  isFounder: boolean;
  modules: Record<PermissionModuleId, PermissionLevel>;
};

export async function getCurrentUserPermissions(): Promise<UserPermissions> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { role: "viewer", isFounder: false, modules: emptyPermissions() };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, custom_role_id, team_roles(permissions)")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) {
    return { role: "viewer", isFounder: false, modules: emptyPermissions() };
  }

  const isFounder = profile.role === "founder";

  if (isFounder) {
    const full = emptyPermissions();
    for (const key of Object.keys(full) as PermissionModuleId[]) {
      full[key] = "full";
    }
    return { role: "founder", isFounder: true, modules: full };
  }

  const teamRole = Array.isArray(profile.team_roles)
    ? profile.team_roles[0]
    : profile.team_roles;

  const modules = permissionsFromRow(
    (teamRole as { permissions: Record<string, string> } | null)?.permissions ??
      null
  );

  return { role: profile.role, isFounder: false, modules };
}
