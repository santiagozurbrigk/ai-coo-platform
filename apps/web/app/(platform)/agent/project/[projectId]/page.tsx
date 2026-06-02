import { AgentShell } from "@/components/agent/agent-shell";

export default async function AgentProjectPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  return <AgentShell filterProjectId={projectId} />;
}
