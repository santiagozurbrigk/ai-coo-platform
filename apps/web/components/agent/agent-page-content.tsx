"use client";

import { useEffect, useRef } from "react";
import { Sparkles } from "lucide-react";
import { useFloatingChat } from "@/providers/floating-chat-provider";
import { AgentEmptyState } from "./agent-empty-state";
import { ChatMessage } from "./chat-message";
import { PromptInputBox } from "./prompt-input-box";

export function AgentPageContent() {
  const {
    messages,
    inputValue,
    setInputValue,
    sendFromAgent,
    isLoading,
    needsAgentReply,
    clearNeedsAgentReply,
    runAgentReply,
    markMessagesRead,
  } = useFloatingChat();

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    markMessagesRead();
  }, [markMessagesRead]);

  useEffect(() => {
    if (!needsAgentReply || isLoading) return;
    clearNeedsAgentReply();
    void runAgentReply();
  }, [needsAgentReply, isLoading, clearNeedsAgentReply, runAgentReply]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, isLoading]);

  return (
    <div className="flex h-full min-h-[calc(100vh-7rem)] flex-col">
      <div className="flex shrink-0 items-center gap-3 border-b border-border px-6 py-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-full border border-violet-500/30 bg-violet-600/20">
          <Sparkles className="h-4 w-4 text-violet-400" />
        </div>
        <div>
          <h1 className="text-sm font-semibold text-foreground">
            Agente de negocio
          </h1>
          <p className="text-xs text-muted-foreground">
            Con acceso a todo el contexto de tu negocio
          </p>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 space-y-4 overflow-y-auto px-6 py-4"
      >
        {messages.length === 0 ? (
          <AgentEmptyState />
        ) : (
          messages.map((msg) => (
            <ChatMessage key={msg.id} role={msg.role} content={msg.content} />
          ))
        )}
        {isLoading ? (
          <div className="flex gap-3">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-violet-500/30 bg-violet-600/20">
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
          onChange={setInputValue}
          onSend={(msg) => void sendFromAgent(msg)}
          isLoading={isLoading}
          placeholder="Preguntale algo a tu agente..."
        />
      </div>
    </div>
  );
}
