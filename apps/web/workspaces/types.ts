/**
 * Workspaces — architectural placeholder for multi-workspace support.
 * Not functional in Phase 0. UI will use a default workspace only.
 */

export interface WorkspaceContext {
  workspaceId: string;
  organizationId: string;
  name: string;
  slug: string;
  isDefault: boolean;
}

export const DEFAULT_WORKSPACE_ID = "default" as const;
