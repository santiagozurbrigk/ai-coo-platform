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

export type AgentMessageActionType = "created_sop" | "created_document" | "graph_proposals";

export type AgentMessageAttachment = {
  name: string;
  url: string;
  type: string;
  /** Size in bytes, if known */
  sizeBytes?: number;
};

// ---------- Graph proposals ----------

export type GraphProposalEntityType =
  | "customer_avatar"
  | "product"
  | "value_ladder_step"
  | "sales_framework"
  | "value_proposition";

export type GraphProposalStatus = "pending" | "approved" | "rejected";

export type GraphProposal = {
  id: string;
  organizationId: string;
  conversationId: string;
  messageId: string | null;
  entityType: GraphProposalEntityType;
  action: "create" | "update";
  entityId: string | null;
  payload: Record<string, unknown>;
  status: GraphProposalStatus;
  createdAt: string;
};

// ---------- Message ----------

export type AgentMessage = {
  id: string;
  conversationId: string;
  organizationId: string;
  role: "user" | "assistant";
  content: string;
  attachments: AgentMessageAttachment[] | null;
  actionType: AgentMessageActionType | null;
  actionRefId: string | null;
  /** Serialized extended thinking blocks from Claude (JSON array of { text }) */
  thinkingContent: string | null;
  /** Long-form canvas content extracted from the response */
  canvasContent: string | null;
  /** Graph proposals attached to this message (populated when actionType === "graph_proposals") */
  graphProposals: GraphProposal[] | null;
  createdAt: string;
};

export type AgentFlags = {
  useWebSearch?: boolean;
  useThink?: boolean;
  useCanvas?: boolean;
};

export type AgentWorkspaceData = {
  stages: BusinessStage[];
  conversations: AgentConversation[];
};
