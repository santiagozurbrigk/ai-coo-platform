"use client";

import { useEffect, useMemo, useRef } from "react";
import { Edit3, Layers, Sparkles } from "lucide-react";
import { PromptInputBox } from "@/components/ui/ai-prompt-box";
import { useAgentData } from "@/providers/agent-data-provider";
import { AgentEmptyState } from "./agent-empty-state";
import { ChatMessage } from "./chat-message";

export function AgentModule({
  conversationId,
  filterProjectId,
  filterStageId,
}: {
  conversationId?: string | null;
  filterProjectId?: string | null;
  filterStageId?: string | null;
}) {
  const {
    workspace,
    messages,
    isLoading,
    isSending,
    inputValue,
    setInputValue,
    sendMessage,
  } = useAgentData();

  const scrollRef = useRef<HTMLDivElement>(null);

  const conversation = useMemo(
    () => workspace.conversations.find((c) => c.id === conversationId) ?? null,
    [workspace.conversations, conversationId]
  );

  const currentProject = useMemo(() => {
    const pid = filterProjectId ?? conversation?.projectId;
    return workspace.projects.find((p) => p.id === pid) ?? conversation?.project ?? null;
  }, [workspace.projects, filterProjectId, conversation]);

  const currentStage = useMemo(() => {
    const sid = filterStageId ?? conversation?.stageId;
    return workspace.stages.find((s) => s.id === sid) ?? conversation?.stage ?? null;
  }, [workspace.stages, filterStageId, conversation]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, isSending]);

  const placeholder = currentStage
    ? `Preguntale sobre "${currentStage.name}"...`
    : currentProject
      ? `Preguntale sobre "${currentProject.name}"...`
      : "Preguntale algo a tu agente...";

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex shrink-0 items-center justify-between border-b border-border px-6 py-3">
        <div className="flex min-w-0 items-center gap-3">
          {currentProject ? (
            <span className="text-xs text-muted-foreground">
              {currentProject.name} /
            </span>
          ) : null}
          {currentStage ? (
            <div className="flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-blue-400" />
              <span className="text-xs text-blue-400/70">{currentStage.name}</span>
            </div>
          ) : null}
          <h2 className="truncate text-sm font-medium text-foreground">
            {conversation?.title || "Nueva conversación"}
          </h2>
        </div>
        <button
          type="button"
          className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Editar título"
        >
          <Edit3 className="h-3.5 w-3.5" />
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-6 py-4">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Cargando…</p>
        ) : messages.length === 0 ? (
          <AgentEmptyState onSuggestion={setInputValue} />
        ) : (
          messages.map((msg) => (
            <ChatMessage
              key={msg.id}
              role={msg.role}
              content={msg.content}
              actionType={msg.actionType}
              actionRefId={msg.actionRefId}
            />
          ))
        )}
        {isSending ? (
          <div className="flex gap-3">
            <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-violet-500/30 bg-violet-600/20">
              <Sparkles className="h-3.5 w-3.5 animate-pulse text-violet-400" />
            </div>
            <div className="chat-message-assistant rounded-2xl border px-4 py-3 text-sm text-muted-foreground">
              Pensando…
            </div>
          </div>
        ) : null}
      </div>

      <div className="shrink-0 border-t border-border px-6 py-4">
        <PromptInputBox
          value={inputValue}
          onValueChange={setInputValue}
          onSend={(msg) =>
            void sendMessage(msg, {
              conversationId,
              projectId: filterProjectId ?? conversation?.projectId,
              stageId: filterStageId ?? conversation?.stageId,
            })
          }
          isLoading={isSending}
          placeholder={placeholder}
        />
      </div>
    </div>
  );
}
