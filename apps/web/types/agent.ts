export type AgentProjectColor =
  | "violet"
  | "blue"
  | "green"
  | "amber"
  | "red";

export type AgentProject = {
  id: string;
  organizationId: string;
  stageId: string | null;
  name: string;
  description: string | null;
  color: AgentProjectColor;
  createdAt: string;
};

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
  projectId: string | null;
  stageId: string | null;
  title: string | null;
  createdAt: string;
  updatedAt: string;
  project?: Pick<AgentProject, "id" | "name" | "color" | "stageId"> | null;
  stage?: Pick<BusinessStage, "id" | "name"> | null;
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
  projects: AgentProject[];
  stages: BusinessStage[];
  conversations: AgentConversation[];
};
