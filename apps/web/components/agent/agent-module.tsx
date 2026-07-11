"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Edit3, Layers, Sparkles } from "lucide-react";
import { cn, usePrefersReducedMotion } from "@ai-coo/ui";
import { PromptInputBox } from "@/components/ui/ai-prompt-box";
import { useAgentData } from "@/providers/agent-data-provider";
import { useToast } from "@/providers/toast-provider";
import { AgentEmptyState } from "./agent-empty-state";
import { ChatMessage } from "./chat-message";
import { CanvasPanel } from "./canvas-panel";
import { GraphCanvasPanel } from "./graph-canvas-panel";
import type { GraphProposal } from "@/types/agent";
import { detectCanvasIntent } from "@/lib/agent/canvas-intent";

type CanvasVersion = { id: string; content: string; timestamp: string };

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

  const { push } = useToast();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Canvas panel state
  const [canvasVersions, setCanvasVersions] = useState<CanvasVersion[]>([]);
  const [showCanvas, setShowCanvas] = useState(false);
  const [canvasPending, setCanvasPending] = useState(false);

  // Graph canvas: collect pending proposals from all messages
  const pendingProposals = useMemo<GraphProposal[]>(() => {
    return messages.flatMap((m) =>
      m.graphProposals?.filter((p) => p.status === "pending") ?? []
    );
  }, [messages]);

  const showGraphCanvas =
    showCanvas && pendingProposals.length > 0 && conversationId != null;

  const conversation = useMemo(
    () => workspace.conversations.find((c) => c.id === conversationId) ?? null,
    [workspace.conversations, conversationId]
  );

  const currentStage = useMemo(() => {
    if (!filterStageId) return null;
    return workspace.stages.find((s) => s.id === filterStageId) ?? null;
  }, [workspace.stages, filterStageId]);

  // Auto-populate canvas panel when new messages with canvas content arrive
  // Also auto-open graph canvas when new pending proposals arrive
  useEffect(() => {
    let hasPendingProposals = false;
    for (const msg of messages) {
      if (msg.role === "assistant" && msg.canvasContent) {
        setCanvasVersions((prev) => {
          const alreadyExists = prev.some((v) => v.id === msg.id);
          if (alreadyExists) return prev;
          return [
            ...prev,
            { id: msg.id, content: msg.canvasContent!, timestamp: msg.createdAt },
          ];
        });
        setShowCanvas(true);
        setCanvasPending(false);
      }
      if (msg.graphProposals?.some((p) => p.status === "pending")) {
        hasPendingProposals = true;
      }
    }
    if (hasPendingProposals) {
      setShowCanvas(true);
    }
  }, [messages]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, isSending]);

  useEffect(() => {
    if (!isSending && canvasPending && canvasVersions.length === 0) {
      setCanvasPending(false);
    }
  }, [isSending, canvasPending, canvasVersions.length]);

  const placeholder = currentStage
    ? `Preguntale sobre "${currentStage.name}"...`
    : "Preguntale algo a tu agente...";

  const showEmptyState = !isLoading && messages.length === 0 && !isSending;

  return (
    <div className="flex min-h-0 flex-1">
      {/* Main chat area */}
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
                thinkingContent={msg.thinkingContent}
                attachments={msg.attachments}
                graphProposals={msg.graphProposals}
              />
            ))
          )}
          {isSending ? <ThinkingIndicator /> : null}
        </div>

        <div className="shrink-0 border-t border-border px-6 py-4">
          <PromptInputBox
            value={inputValue}
            onValueChange={setInputValue}
            onSend={(msg, _files, flags) => {
              const willUseCanvas = Boolean(
                flags?.useCanvas || detectCanvasIntent(msg)
              );
              if (willUseCanvas) {
                setShowCanvas(true);
                setCanvasPending(true);
              }
              void (async () => {
                try {
                  const result = await sendMessage(msg, {
                    conversationId,
                    contextStageId: filterStageId,
                    flags,
                  });

                  if (result.openCanvas) {
                    setShowCanvas(true);
                    setCanvasPending(true);
                  }
                } catch {
                  setCanvasPending(false);
                  push({
                    title: "No se pudo enviar el mensaje",
                    description:
                      "Revisá tu conexión o la API de Claude e intentá de nuevo.",
                    variant: "default",
                  });
                }
              })();
            }}
            isLoading={isSending}
            placeholder={placeholder}
          />
        </div>
      </div>

      {/* Canvas side panel: graph preview (pending proposals) OR markdown canvas */}
      {showGraphCanvas && conversationId ? (
        <div className="w-[480px] shrink-0">
          <GraphCanvasPanel
            conversationId={conversationId}
            pendingProposals={pendingProposals}
            onClose={() => setShowCanvas(false)}
          />
        </div>
      ) : showCanvas && (canvasVersions.length > 0 || canvasPending) ? (
        <div className="w-[420px] shrink-0">
          <CanvasPanel
            versions={canvasVersions}
            isLoading={canvasPending && canvasVersions.length === 0}
            onClose={() => {
              setShowCanvas(false);
              setCanvasPending(false);
            }}
          />
        </div>
      ) : null}
    </div>
  );
}

function ThinkingIndicator() {
  const reducedMotion = usePrefersReducedMotion();
  const dotTransition = {
    duration: 0.8,
    repeat: Infinity,
    repeatType: "reverse" as const,
    ease: "easeInOut" as const,
  };

  return (
    <div className="flex gap-3" aria-label="El agente está pensando">
      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-violet-500/30 bg-violet-600/20">
        {reducedMotion ? (
          <Sparkles className="h-3.5 w-3.5 text-violet-400" />
        ) : (
          <motion.div
            animate={{ opacity: [0.55, 1, 0.55], scale: [0.96, 1.04, 0.96] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
          >
            <Sparkles className="h-3.5 w-3.5 text-violet-400" />
          </motion.div>
        )}
      </div>
      <div className="chat-message-assistant rounded-2xl border px-4 py-3">
        <div className="flex h-5 items-center gap-1.5">
          {[0, 1, 2].map((index) => {
            const className = cn(
              "h-1.5 w-1.5 rounded-full bg-violet-400/80",
              reducedMotion && "bg-violet-400/60"
            );

            return reducedMotion ? (
              <span key={index} className={className} />
            ) : (
              <motion.span
                key={index}
                className={className}
                animate={{ y: [0, -3, 0], opacity: [0.45, 1, 0.45] }}
                transition={{ ...dotTransition, delay: index * 0.14 }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
