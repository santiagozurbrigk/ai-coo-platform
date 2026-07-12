import { AI_MODELS, callClaudeText } from "@/lib/ai/anthropic";

export type AgentChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const MESSAGE_COUNT_THRESHOLD = 20;
const TOKEN_THRESHOLD = 40_000;
const KEEP_RECENT_MESSAGES = 6;

function estimateTokens(messages: AgentChatMessage[]): number {
  return messages.reduce(
    (sum, message) => sum + Math.ceil(message.content.length / 4),
    0
  );
}

function serializeMessages(messages: AgentChatMessage[]): string {
  return messages
    .map((message) => `${message.role.toUpperCase()}: ${message.content}`)
    .join("\n\n");
}

export async function compactConversationMessages(
  organizationId: string,
  messages: AgentChatMessage[]
): Promise<AgentChatMessage[]> {
  const tokenEstimate = estimateTokens(messages);
  const shouldCompact =
    messages.length > MESSAGE_COUNT_THRESHOLD ||
    tokenEstimate > TOKEN_THRESHOLD;

  if (!shouldCompact || messages.length <= KEEP_RECENT_MESSAGES) {
    return messages;
  }

  const oldMessages = messages.slice(0, -KEEP_RECENT_MESSAGES);
  const recentMessages = messages.slice(-KEEP_RECENT_MESSAGES);

  const summary = await callClaudeText({
    organizationId,
    task: "agent_simple",
    model: AI_MODELS.HAIKU,
    feature: "agent_conversation_compaction",
    system:
      "You summarize conversation history for another AI assistant. Respond only with the summary text.",
    messages: [
      {
        role: "user",
        content: [
          "Summarize this conversation history concisely, preserving key decisions, context established, and important facts mentioned.",
          "Write in third person.",
          "Max 400 words.",
          "",
          serializeMessages(oldMessages),
        ].join("\n"),
      },
    ],
    maxTokens: 700,
  });

  if (!summary?.trim()) {
    return messages;
  }

  const compacted: AgentChatMessage[] = [
    {
      role: "user",
      content: `[Conversation summary]\n\n${summary.trim()}`,
    },
    {
      role: "assistant",
      content: "Understood, I have the context from our previous conversation.",
    },
    ...recentMessages,
  ];

  console.log("[agent] compacting conversation", {
    originalLength: messages.length,
    compactedLength: compacted.length,
    tokenEstimate,
  });

  return compacted;
}
