/**
 * Shared domain types — aligned with SYSTEM_ARCHITECTURE.md
 * Phase 0: structural placeholders for mock data and future API contracts.
 */

export type OrganizationStatus = "active" | "inactive" | "suspended";

export type UserRole =
  | "founder"
  | "admin"
  | "project_manager"
  | "setter"
  | "operator"
  | "viewer";

export type ConversationStatus = "active" | "ghosted" | "booked" | "closed";

export type SopStatus = "active" | "outdated" | "draft";

export type IntegrationStatus = "connected" | "not_connected" | "syncing";

export type AiJobStatus = "pending" | "processing" | "complete" | "failed";

export type WeeklyInputType = "text" | "audio" | "form";

export type Department =
  | "sales"
  | "delivery"
  | "operations"
  | "founder";

/** Reserved — multi-workspace support (not implemented in Phase 0) */
export interface Workspace {
  id: string;
  organizationId: string;
  name: string;
  slug: string;
  isDefault: boolean;
}
