import type {
  AgentConversation,
  AgentMessage,
  BusinessStage,
} from "@/types/agent";

export type BusinessStageRow = {
  id: string;
  organization_id: string;
  name: string;
  description: string | null;
  order_index: number;
  is_active: boolean;
  created_at: string;
};

export type AgentConversationRow = {
  id: string;
  organization_id: string;
  project_id: string | null;
  stage_id: string | null;
  title: string | null;
  created_at: string;
  updated_at: string;
};

export type AgentMessageRow = {
  id: string;
  conversation_id: string;
  organization_id: string;
  role: string;
  content: string;
  attachments: unknown;
  action_type: string | null;
  action_ref_id: string | null;
  created_at: string;
};

export function rowToStage(row: BusinessStageRow): BusinessStage {
  return {
    id: row.id,
    organizationId: row.organization_id,
    name: row.name,
    description: row.description,
    orderIndex: row.order_index,
    isActive: row.is_active,
    createdAt: row.created_at,
  };
}

export function rowToConversation(row: AgentConversationRow): AgentConversation {
  return {
    id: row.id,
    organizationId: row.organization_id,
    title: row.title,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function rowToMessage(row: AgentMessageRow): AgentMessage {
  return {
    id: row.id,
    conversationId: row.conversation_id,
    organizationId: row.organization_id,
    role: row.role as "user" | "assistant",
    content: row.content,
    attachments: Array.isArray(row.attachments)
      ? (row.attachments as AgentMessage["attachments"])
      : null,
    actionType: row.action_type as AgentMessage["actionType"],
    actionRefId: row.action_ref_id,
    createdAt: row.created_at,
  };
}
