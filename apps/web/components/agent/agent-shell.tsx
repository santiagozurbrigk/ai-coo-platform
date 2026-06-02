"use client";

import { AgentDataProvider } from "@/providers/agent-data-provider";
import { AgentModule } from "./agent-module";
import { AgentSidebar } from "./agent-sidebar";

export function AgentShell({
  conversationId,
  filterProjectId,
  filterStageId,
}: {
  conversationId?: string | null;
  filterProjectId?: string | null;
  filterStageId?: string | null;
}) {
  return (
    <AgentDataProvider
      conversationId={conversationId}
      filterProjectId={filterProjectId}
      filterStageId={filterStageId}
    >
      <div className="flex h-full min-h-[calc(100vh-7rem)] w-full">
        <AgentSidebar
          filterProjectId={filterProjectId}
          filterStageId={filterStageId}
        />
        <AgentModule
          conversationId={conversationId}
          filterProjectId={filterProjectId}
          filterStageId={filterStageId}
        />
      </div>
    </AgentDataProvider>
  );
}
