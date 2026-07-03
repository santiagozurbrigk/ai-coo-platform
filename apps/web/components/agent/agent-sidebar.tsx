"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ChevronRight, Layers, Plus, Trash2 } from "lucide-react";
import { cn } from "@ai-coo/ui";
import { useAgentData } from "@/providers/agent-data-provider";
import { paths } from "@/routes/paths";
import type { AgentProject, BusinessStage } from "@/types/agent";
import { ConversationHistory } from "./conversation-history";
import { CreateProjectModal } from "./create-project-modal";
import { CreateStageModal } from "./create-stage-modal";
import { SidebarSection } from "./sidebar-section";

const PROJECT_COLORS: Record<string, string> = {
  violet: "bg-violet-500",
  blue: "bg-blue-500",
  green: "bg-green-500",
  amber: "bg-amber-500",
  red: "bg-red-500",
};

export function AgentSidebar({
  filterProjectId,
  filterStageId,
}: {
  filterProjectId?: string | null;
  filterStageId?: string | null;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const {
    workspace,
    filteredConversations,
    startNewConversation,
    createProject,
    createStage,
    deleteConversation,
    deleteProject,
  } = useAgentData();

  const [projectOpen, setProjectOpen] = useState(false);
  const [stageOpen, setStageOpen] = useState(false);

  const conversations = filteredConversations({
    projectId: filterProjectId,
    stageId: filterStageId,
  });

  const selectedStage =
    workspace.stages.find((stage) => stage.id === filterStageId) ?? null;
  const projects = filterStageId
    ? workspace.projects.filter((project) => project.stageId === filterStageId)
    : workspace.projects;

  return (
    <>
      <aside className="agent-sidebar">
        <button
          type="button"
          onClick={() => void startNewConversation({ projectId: filterProjectId, stageId: filterStageId })}
          className="mb-2 flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <Plus className="h-3.5 w-3.5" />
          Nueva conversación
        </button>

        <ConversationHistory
          conversations={conversations}
          onDelete={(id) => void deleteConversation(id)}
        />

        <SidebarSection
          title="PROYECTOS"
          onAdd={selectedStage ? () => setProjectOpen(true) : undefined}
          items={projects}
          renderItem={(project) => (
            <ProjectItem
              project={project}
              isActive={pathname === paths.platform.agent.project(project.id)}
              onClick={() => router.push(paths.platform.agent.project(project.id))}
              onDelete={(id) => void deleteProject(id)}
            />
          )}
        />

        <SidebarSection
          title="ETAPAS DE NEGOCIO"
          onAdd={() => setStageOpen(true)}
          items={workspace.stages}
          renderItem={(stage) => (
            <StageItem
              stage={stage}
              isActive={pathname === paths.platform.agent.stage(stage.id)}
              onClick={() => router.push(paths.platform.agent.stage(stage.id))}
            />
          )}
        />
      </aside>

      <CreateProjectModal
        open={projectOpen}
        onOpenChange={setProjectOpen}
        stageName={selectedStage?.name ?? null}
        onSubmit={(input) =>
          selectedStage
            ? createProject({ ...input, stageId: selectedStage.id })
            : Promise.resolve()
        }
      />
      <CreateStageModal
        open={stageOpen}
        onOpenChange={setStageOpen}
        onSubmit={createStage}
      />
    </>
  );
}

function ProjectItem({
  project,
  isActive,
  onClick,
  onDelete,
}: {
  project: AgentProject;
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
        <div
          className={cn(
            "h-2 w-2 shrink-0 rounded-sm",
            PROJECT_COLORS[project.color] ?? "bg-violet-500"
          )}
        />
        <span className="flex-1 truncate">{project.name}</span>
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onDelete(project.id);
        }}
        className="rounded p-0.5 text-muted-foreground opacity-0 transition-all hover:text-foreground group-hover:opacity-100"
        aria-label="Eliminar proyecto"
      >
        <Trash2 className="h-3 w-3" />
      </button>
      <ChevronRight className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-40" />
    </div>
  );
}

function StageItem({
  stage,
  isActive,
  onClick,
}: {
  stage: BusinessStage;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs transition-colors",
        isActive
          ? "bg-muted text-foreground"
          : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
      )}
    >
      <Layers className="h-3 w-3 shrink-0 text-blue-400/60" />
      <span className="flex-1 truncate text-left">{stage.name}</span>
      {stage.isActive ? (
        <span className="rounded-full bg-blue-500/15 px-1.5 py-0.5 text-[9px] text-blue-400">
          Activa
        </span>
      ) : null}
    </button>
  );
}
