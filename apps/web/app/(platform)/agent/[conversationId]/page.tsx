import { AgentShell } from "@/components/agent/agent-shell";

export default async function AgentConversationPage({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const { conversationId } = await params;
  return <AgentShell conversationId={conversationId} />;
}
