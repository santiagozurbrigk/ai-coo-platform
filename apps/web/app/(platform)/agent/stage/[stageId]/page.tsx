import { AgentShell } from "@/components/agent/agent-shell";

export default async function AgentStagePage({
  params,
}: {
  params: Promise<{ stageId: string }>;
}) {
  const { stageId } = await params;
  return <AgentShell filterStageId={stageId} />;
}
