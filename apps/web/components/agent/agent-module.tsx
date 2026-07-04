"use client";

import { useEffect, useMemo, useRef } from "react";
import { Edit3, Layers, Sparkles } from "lucide-react";
import { OtcMascot } from "@ai-coo/ui";
import { PromptInputBox } from "@/components/ui/ai-prompt-box";
import { useAgentData } from "@/providers/agent-data-provider";
import { AgentEmptyState } from "./agent-empty-state";
import { ChatMessage } from "./chat-message";

export function AgentModule() {
  const {
    conversationId,
    filterStageId,
    workspace,
    messages,
    responseRevealMessageId,
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

  const currentStage = useMemo(() => {
    if (!filterStageId) return null;
    return workspace.stages.find((s) => s.id === filterStageId) ?? null;
  }, [workspace.stages, filterStageId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, isSending]);

  const placeholder = currentStage
    ? `Preguntale sobre "${currentStage.name}"...`
    : "Preguntale algo a tu agente...";

  const showEmptyState = !isLoading && messages.length === 0 && !isSending;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex shrink-0 items-center justify-between border-b border-border bg-transparent px-6 py-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-violet-500/30 bg-violet-600/15">
            <Sparkles className="h-4 w-4 text-violet-500 dark:text-violet-400" />
          </div>
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

      <div
        ref={scrollRef}
        className="flex-1 space-y-4 overflow-y-auto bg-transparent px-6 py-4"
      >
        {isLoading && messages.length === 0 ? (
          <p className="text-sm text-muted-foreground">Cargando…</p>
        ) : showEmptyState ? (
          <AgentEmptyState onSuggestion={setInputValue} />
        ) : (
          messages.map((msg) => (
            <ChatMessage
              key={msg.id}
              role={msg.role}
              content={msg.content}
              actionType={msg.actionType}
              actionRefId={msg.actionRefId}
              animateReveal={msg.id === responseRevealMessageId}
            />
          ))
        )}
        {isSending ? <ThinkingIndicator /> : null}
      </div>

      <div className="shrink-0 border-t border-border px-6 py-4">
        <PromptInputBox
          value={inputValue}
          onValueChange={setInputValue}
          onSend={(msg) =>
            void sendMessage(msg, {
              conversationId,
              contextStageId: filterStageId,
            })
          }
          isLoading={isSending}
          placeholder={placeholder}
        />
      </div>
    </div>
  );
}

function ThinkingIndicator() {
  return (
    <div className="flex gap-3" aria-label="El agente está pensando">
      <div className="mt-0.5 h-7 w-7 shrink-0" aria-hidden />
      <div className="chat-message-assistant flex items-center rounded-2xl border px-4 py-2.5">
        <span className="sr-only">Pensando</span>
        <OtcMascot size={44} />
      </div>
    </div>
  );
}
