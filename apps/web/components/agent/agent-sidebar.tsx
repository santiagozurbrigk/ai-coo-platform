"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ChevronRight, Layers, Plus, Trash2 } from "lucide-react";
import { cn } from "@ai-coo/ui";
import { useAgentData } from "@/providers/agent-data-provider";
import { paths } from "@/routes/paths";
import type { BusinessStage } from "@/types/agent";
import { ConversationHistory } from "./conversation-history";
import { CreateStageModal } from "./create-stage-modal";
import { SidebarSection } from "./sidebar-section";

export function AgentSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const {
    filterStageId,
    workspace,
    startNewConversation,
    createStage,
    deleteConversation,
    deleteStage,
  } = useAgentData();

  const [stageOpen, setStageOpen] = useState(false);

  return (
    <>
      <aside data-tour="agent-sidebar" className="agent-sidebar">
        <button
          type="button"
          onClick={startNewConversation}
          className="mb-2 flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <Plus className="h-3.5 w-3.5" />
          Nueva conversación
        </button>

        <SidebarSection
          title="ETAPAS DE NEGOCIO"
          onAdd={() => setStageOpen(true)}
          items={workspace.stages}
          renderItem={(stage) => (
            <StageItem
              key={stage.id}
              stage={stage}
              isActive={pathname === paths.platform.agent.stage(stage.id)}
              onClick={() => router.push(paths.platform.agent.stage(stage.id))}
              onDelete={(id) => void deleteStage(id)}
            />
          )}
        />

        <ConversationHistory
          conversations={workspace.conversations}
          onDelete={(id) => void deleteConversation(id)}
        />
      </aside>

      <CreateStageModal
        open={stageOpen}
        onOpenChange={setStageOpen}
        onSubmit={createStage}
      />
    </>
  );
}

function StageItem({
  stage,
  isActive,
  onClick,
  onDelete,
}: {
  stage: BusinessStage;
  isActive: boolean;
  onClick: () => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div
      className={cn(
        "group flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs transition-colors",
        isActive
          ? "bg-muted text-foreground"
          : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
      )}
    >
      <button
        type="button"
        onClick={onClick}
        className="flex min-w-0 flex-1 items-center gap-2 text-left"
      >
        <Layers className="h-3 w-3 shrink-0 text-blue-400/60" />
        <span className="flex-1 truncate">{stage.name}</span>
        {stage.isActive ? (
          <span className="rounded-full bg-blue-500/15 px-1.5 py-0.5 text-[9px] text-blue-400">
            Activa
          </span>
        ) : null}
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onDelete(stage.id);
        }}
        className="rounded p-0.5 text-muted-foreground opacity-0 transition-all hover:text-foreground group-hover:opacity-100"
        aria-label="Eliminar etapa"
      >
        <Trash2 className="h-3 w-3" />
      </button>
      <ChevronRight className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-40" />
    </div>
  );
}
