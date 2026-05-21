import type { UserRole } from "@ai-coo/types";

export type TeamMember = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: "active" | "away" | "inactive";
  lastLogin: string;
};

export type RoleDefinition = {
  role: UserRole;
  label: string;
  description: string;
  permissions: string[];
};
