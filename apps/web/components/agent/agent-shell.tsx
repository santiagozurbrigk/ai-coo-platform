"use client";

import { AgentDataProvider } from "@/providers/agent-data-provider";
import { AgentModule } from "./agent-module";
import { AgentSidebar } from "./agent-sidebar";

export function AgentShell({
  conversationId,
  filterStageId,
}: {
  conversationId?: string | null;
  filterStageId?: string | null;
}) {
  return (
    <AgentDataProvider
      conversationId={conversationId}
      filterStageId={filterStageId}
    >
      <div className="agent-shell">
        <AgentSidebar filterStageId={filterStageId} />
        <AgentModule
          conversationId={conversationId}
          filterStageId={filterStageId}
        />
      </div>
    </AgentDataProvider>
  );
}
