import type { PermissionModuleId } from "@/constants/permission-modules";
import { emptyPermissions } from "@/constants/permission-modules";
import { displayName } from "@/lib/workboard/mapper";
import type {
  CustomRole,
  PermissionLevel,
  TeamInvitation,
  TeamMember,
} from "@/types/team";
import type { UserRole } from "@ai-coo/types";

export type ProfileRow = {
  id: string;
  full_name: string | null;
  email: string;
  role: string;
  avatar_url?: string | null;
  is_active?: boolean | null;
  last_login_at?: string | null;
  hourly_rate?: number | null;
  hourly_rate_currency?: string | null;
  custom_role_id?: string | null;
  created_at?: string;
  team_roles?: { name: string; permissions: Record<string, string> } | { name: string; permissions: Record<string, string> }[] | null;
};

export type TeamRoleRow = {
  id: string;
  organization_id: string;
  name: string;
  description: string | null;
  permissions: Record<string, string> | null;
  is_default: boolean;
  created_at: string;
  updated_at: string;
};

export type TeamInvitationRow = {
  id: string;
  email: string;
  role: string;
  status: string;
  expires_at: string;
  created_at: string;
  custom_role_id: string | null;
  invited_by: string | null;
  profiles?: { full_name: string | null } | { full_name: string | null }[] | null;
  team_roles?: { name: string } | { name: string }[] | null;
};

const VALID_ROLES = new Set([
  "founder",
  "admin",
  "project_manager",
  "setter",
  "operator",
  "viewer",
]);

function normalizePermissionLevel(value: string | undefined): PermissionLevel {
  if (value === "full") return "full";
  if (value === "view" || value === "read") return "view";
  return "none";
}

export function permissionsFromRow(
  raw: Record<string, string> | null | undefined
): Record<PermissionModuleId, PermissionLevel> {
  const base = emptyPermissions();
  if (!raw) return base;

  for (const [key, value] of Object.entries(raw)) {
    if (key in base) {
      base[key as PermissionModuleId] = normalizePermissionLevel(value);
    }
  }
  return base;
}

export function permissionsToRow(
  permissions: Record<string, PermissionLevel>
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(permissions)) {
    if (value !== "none") out[key] = value;
  }
  return out;
}

export function rowToTeamMember(row: ProfileRow): TeamMember {
  const teamRole = Array.isArray(row.team_roles)
    ? row.team_roles[0]
    : row.team_roles;

  const isActive = row.is_active !== false;

  return {
    id: row.id,
    name: displayName(row.full_name, row.email),
    email: row.email,
    role: (VALID_ROLES.has(row.role) ? row.role : "viewer") as UserRole,
    status: isActive ? "active" : "inactive",
    lastLogin: row.last_login_at ?? null,
    hourlyRate: row.hourly_rate != null ? Number(row.hourly_rate) : undefined,
    hourlyRateCurrency: row.hourly_rate_currency ?? "USD",
    avatarUrl: row.avatar_url ?? undefined,
    customRoleId: row.custom_role_id ?? null,
    customRoleName: teamRole?.name ?? null,
    isActive,
  };
}

export function rowToCustomRole(row: TeamRoleRow): CustomRole {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? undefined,
    permissions: permissionsFromRow(row.permissions),
    isDefault: row.is_default,
  };
}

export function rowToTeamInvitation(row: TeamInvitationRow): TeamInvitation {
  const invitedByRaw = row.profiles;
  const invitedBy = Array.isArray(invitedByRaw)
    ? invitedByRaw[0]
    : invitedByRaw;

  const teamRole = Array.isArray(row.team_roles)
    ? row.team_roles[0]
    : row.team_roles;

  return {
    id: row.id,
    email: row.email,
    role: row.role as UserRole,
    status: row.status as TeamInvitation["status"],
    expiresAt: row.expires_at,
    createdAt: row.created_at,
    customRoleId: row.custom_role_id,
    customRoleName: teamRole?.name ?? null,
    invitedByName: invitedBy?.full_name ?? null,
  };
}
