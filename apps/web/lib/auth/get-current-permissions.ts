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
    .select("role, custom_role_id")
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

  let teamRolePermissions: Record<string, string> | null = null;
  if (profile.custom_role_id) {
    const { data: roleRow } = await supabase
      .from("team_roles")
      .select("permissions")
      .eq("id", profile.custom_role_id)
      .maybeSingle();
    teamRolePermissions =
      (roleRow?.permissions as Record<string, string> | null) ?? null;
  }

  const modules = permissionsFromRow(teamRolePermissions);

  console.log(
    "[Permissions] userId:",
    user.id,
    "role:",
    profile.role,
    "custom_role_id:",
    profile.custom_role_id,
    "modules:",
    modules
  );

  return { role: profile.role, isFounder: false, modules };
}
