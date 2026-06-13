import type { UserRole } from "@ai-coo/types";

export type TeamMember = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: "active" | "away" | "inactive";
  lastLogin: string;
  hourlyRate?: number;
  hourlyRateCurrency?: string;
};

export type RoleDefinition = {
  role: UserRole;
  label: string;
  description: string;
  permissions: string[];
};

export type PermissionLevel = "none" | "view" | "full";

export type CustomRole = {
  id: string;
  name: string;
  description?: string;
  permissions: Record<string, PermissionLevel>;
};

export type TeamMemberWithRole = TeamMember & {
  customRoleId?: string | null;
};
