"use client";

import { AgentModule } from "./agent-module";
import { AgentSidebar } from "./agent-sidebar";

export function AgentShell() {
  return (
    <div className="agent-shell">
      <AgentSidebar />
      <AgentModule />
    </div>
  );
}
