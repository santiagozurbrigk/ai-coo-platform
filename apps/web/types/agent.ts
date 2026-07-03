export type BusinessStage = {
  id: string;
  organizationId: string;
  name: string;
  description: string | null;
  orderIndex: number;
  isActive: boolean;
  createdAt: string;
};

export type AgentConversation = {
  id: string;
  organizationId: string;
  title: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AgentMessageActionType = "created_sop" | "created_document";

export type AgentMessageAttachment = {
  name: string;
  url: string;
  type: string;
};

export type AgentMessage = {
  id: string;
  conversationId: string;
  organizationId: string;
  role: "user" | "assistant";
  content: string;
  attachments: AgentMessageAttachment[] | null;
  actionType: AgentMessageActionType | null;
  actionRefId: string | null;
  createdAt: string;
};

export type AgentWorkspaceData = {
  stages: BusinessStage[];
  conversations: AgentConversation[];
};
