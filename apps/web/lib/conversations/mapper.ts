import type {
  Conversation,
  ConversationAnalysis,
  ConversationTagId,
  SalesMessage,
} from "@/types/sales";
import type { ConversationStatus } from "@ai-coo/types";

export type ConversationRow = {
  id: string;
  organization_id: string;
  lead_name: string;
  status: ConversationStatus;
  tag: ConversationTagId | null;
  last_message: string;
  last_message_at: string;
  unread: boolean;
  messages: SalesMessage[];
  analysis: ConversationAnalysis;
  external_ref: string | null;
  created_at?: string;
  updated_at?: string;
};

export function rowToConversation(row: ConversationRow): Conversation {
  return {
    id: row.id,
    leadName: row.lead_name,
    status: row.status,
    tag: row.tag ?? undefined,
    lastMessage: row.last_message,
    lastMessageAt: row.last_message_at,
    unread: row.unread,
    messages: row.messages ?? [],
    analysis: row.analysis ?? {
      responseTimeMinutes: 0,
      ghostingRisk: "medium",
      bookingSignal: false,
      insights: [],
    },
  };
}

export function conversationToInsertRow(
  conv: Omit<Conversation, "id">,
  organizationId: string,
  externalRef?: string
): Omit<ConversationRow, "id" | "created_at" | "updated_at"> {
  return {
    organization_id: organizationId,
    lead_name: conv.leadName,
    status: conv.status,
    tag: conv.tag ?? null,
    last_message: conv.lastMessage,
    last_message_at: conv.lastMessageAt,
    unread: conv.unread,
    messages: conv.messages,
    analysis: conv.analysis,
    external_ref: externalRef ?? null,
  };
}

export function patchToConversationUpdateRow(
  patch: Partial<Pick<Conversation, "tag">>
): Partial<ConversationRow> {
  const row: Partial<ConversationRow> = {
    updated_at: new Date().toISOString(),
  };
  if (patch.tag !== undefined) {
    row.tag = patch.tag ?? null;
  }
  return row;
}
