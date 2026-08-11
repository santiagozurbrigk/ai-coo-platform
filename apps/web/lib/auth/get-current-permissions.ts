import { createClient } from "@/lib/supabase/server";
import { permissionsFromRow } from "@/lib/team/mapper";
import { emptyPermissions } from "@/constants/permission-modules";
import type { PermissionModuleId } from "@/constants/permission-modules";
import type { PermissionLevel } from "@/types/team";

/** Módulos add-on disponibles por org */
export const ADD_ON_IDS = [
  "operaciones",
  "producto",
  "ejecutivo",
  "inteligencia",
] as const;
export type AddOnId = (typeof ADD_ON_IDS)[number];

export type UserPermissions = {
  role: string;
  isFounder: boolean;
  modules: Record<PermissionModuleId, PermissionLevel>;
  /** Módulos add-on activados para esta org */
  enabledAddOns: AddOnId[];
};

export async function getCurrentUserPermissions(): Promise<UserPermissions> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { role: "viewer", isFounder: false, modules: emptyPermissions(), enabledAddOns: [] };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, custom_role_id, organization_id")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) {
    return { role: "viewer", isFounder: false, modules: emptyPermissions(), enabledAddOns: [] };
  }

  // Leer add-ons habilitados para la org
  let enabledAddOns: AddOnId[] = [];
  if (profile.organization_id) {
    const { data: orgRow } = await supabase
      .from("organizations")
      .select("enabled_add_ons")
      .eq("id", profile.organization_id as string)
      .maybeSingle();
    const raw = (orgRow?.enabled_add_ons as string[] | null) ?? [];
    enabledAddOns = raw.filter((id): id is AddOnId =>
      ADD_ON_IDS.includes(id as AddOnId)
    );
  }

  const isFounder = profile.role === "founder";

  if (isFounder) {
    const full = emptyPermissions();
    for (const key of Object.keys(full) as PermissionModuleId[]) {
      full[key] = "full";
    }
    return { role: "founder", isFounder: true, modules: full, enabledAddOns };
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
    "enabledAddOns:",
    enabledAddOns,
    "modules:",
    modules
  );

  return { role: profile.role, isFounder: false, modules, enabledAddOns };
}
