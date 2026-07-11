"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { resolveAgentFlags } from "@/lib/agent/canvas-intent";
import { parseSseBuffer } from "@/lib/agent/sse";
import { useStreamTypewriter } from "@/lib/agent/use-stream-typewriter";
import type { AgentStatus } from "@/lib/agent/types";
import { usePrefersReducedMotion } from "@ai-coo/ui";
import {
  createBusinessStageAction,
  deleteAgentConversationAction,
  deleteBusinessStageAction,
  listAgentMessagesAction,
  listAgentWorkspaceAction,
} from "@/app/agent/actions";
import { useOptionalPageContext } from "@/providers/page-context-provider";
import { paths } from "@/routes/paths";
import type {
  AgentConversation,
  AgentFlags,
  AgentMessage,
  AgentWorkspaceData,
  BusinessStage,
} from "@/types/agent";

type SendMessageResult = {
  conversationId: string | null;
  openCanvas: boolean;
};

type AgentDataContextValue = {
  conversationId: string | null;
  filterStageId: string | null;
  workspace: AgentWorkspaceData;
  messages: AgentMessage[];
  streamingMessageId: string | null;
  streamingDisplayedText: string;
  agentStatus: AgentStatus;
  isLoading: boolean;
  isSending: boolean;
  inputValue: string;
  setInputValue: (v: string) => void;
  refresh: () => Promise<void>;
  loadConversation: (conversationId: string | null) => Promise<void>;
  sendMessage: (
    content: string,
    opts?: { conversationId?: string | null; contextStageId?: string | null; flags?: AgentFlags }
  ) => Promise<SendMessageResult>;
  cancelSend: () => void;
  retryLastMessage: () => Promise<void>;
  createStage: (input: { name: string; description?: string }) => Promise<void>;
  deleteConversation: (id: string) => Promise<void>;
  deleteStage: (id: string) => Promise<void>;
  startNewConversation: () => void;
};

const AgentDataCtx = createContext<AgentDataContextValue | null>(null);

function buildOptimisticAssistantMessage(
  id: string,
  conversationId: string | null
): AgentMessage {
  return {
    id,
    conversationId: conversationId ?? "pending",
    organizationId: "",
    role: "assistant",
    content: "",
    attachments: null,
    actionType: null,
    actionRefId: null,
    thinkingContent: null,
    canvasContent: null,
    graphProposals: null,
    createdAt: new Date().toISOString(),
  };
}

function buildOptimisticUserMessage(
  content: string,
  conversationId: string | null
): AgentMessage {
  return {
    id: `optimistic-${crypto.randomUUID()}`,
    conversationId: conversationId ?? "pending",
    organizationId: "",
    role: "user",
    content,
    attachments: null,
    actionType: null,
    actionRefId: null,
    thinkingContent: null,
    canvasContent: null,
    graphProposals: null,
    createdAt: new Date().toISOString(),
  };
}

export function AgentDataProvider({
  children,
  conversationId,
  filterStageId,
}: {
  children: ReactNode;
  conversationId?: string | null;
  filterStageId?: string | null;
}) {
  const router = useRouter();
  const reducedMotion = usePrefersReducedMotion();
  const pageContext = useOptionalPageContext()?.pageContext ?? null;
  const resolvedConversationId = conversationId ?? null;
  const resolvedFilterStageId = filterStageId ?? null;

  const skipLoadForConversationRef = useRef<string | null>(null);
  const initialLoadDoneRef = useRef(false);
  const isSendingRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastSendRef = useRef<{ content: string; flags?: AgentFlags; conversationId: string | null } | null>(null);
  const completeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const streamTypewriter = useStreamTypewriter({ instant: reducedMotion });
  const {
    displayedText: streamingDisplayedText,
    start: startStreamTypewriter,
    appendBuffer: appendStreamBuffer,
    markStreamEnded: markStreamEnded,
    waitForCatchUp: waitForStreamCatchUp,
    snapToBuffer: snapStreamToBuffer,
    reset: resetStreamTypewriter,
    getTextSnapshot,
  } = streamTypewriter;

  const [workspace, setWorkspace] = useState<AgentWorkspaceData>({
    stages: [],
    conversations: [],
  });
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
  const [agentStatus, setAgentStatus] = useState<AgentStatus>("idle");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const clearCompleteTimer = useCallback(() => {
    if (completeTimerRef.current) {
      clearTimeout(completeTimerRef.current);
      completeTimerRef.current = null;
    }
  }, []);

  const refresh = useCallback(async () => {
    const data = await listAgentWorkspaceAction();
    setWorkspace(data);
  }, []);

  const loadConversation = useCallback(async (id: string | null) => {
    if (!id) {
      setMessages([]);
      setStreamingMessageId(null);
      return;
    }
    const rows = await listAgentMessagesAction(id);
    setMessages(rows);
    setStreamingMessageId(null);
  }, []);

  useEffect(() => {
    const skipId = skipLoadForConversationRef.current;
    if (skipId && skipId === resolvedConversationId) {
      skipLoadForConversationRef.current = null;
      return;
    }

    let cancelled = false;
    (async () => {
      if (!initialLoadDoneRef.current) {
        setIsLoading(true);
      }
      await refresh();
      if (resolvedConversationId) {
        await loadConversation(resolvedConversationId);
      } else if (!isSendingRef.current) {
        setMessages([]);
      }
      if (!cancelled) {
        setIsLoading(false);
        initialLoadDoneRef.current = true;
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [resolvedConversationId, refresh, loadConversation]);

  const cancelSend = useCallback(() => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    isSendingRef.current = false;
    setIsSending(false);
    setStreamingMessageId(null);
    resetStreamTypewriter();
    setAgentStatus("cancelled");
    clearCompleteTimer();
    setTimeout(() => setAgentStatus("idle"), 1200);
  }, [clearCompleteTimer, resetStreamTypewriter]);

  const markComplete = useCallback(() => {
    setAgentStatus("complete");
    clearCompleteTimer();
    completeTimerRef.current = setTimeout(() => {
      setAgentStatus("idle");
      completeTimerRef.current = null;
    }, 1000);
  }, [clearCompleteTimer]);

  const sendMessage = useCallback(
    async (
      content: string,
      opts?: { conversationId?: string | null; contextStageId?: string | null; flags?: AgentFlags }
    ): Promise<SendMessageResult> => {
      const trimmed = content.trim();
      if (!trimmed) return { conversationId: null, openCanvas: false };

      abortControllerRef.current?.abort();
      const controller = new AbortController();
      abortControllerRef.current = controller;

      const targetConversationId =
        opts?.conversationId ?? resolvedConversationId ?? null;

      const flags = resolveAgentFlags(trimmed, opts?.flags);
      lastSendRef.current = { content: trimmed, flags, conversationId: targetConversationId };

      setInputValue("");
      setMessages((prev) => [
        ...prev,
        buildOptimisticUserMessage(trimmed, targetConversationId),
      ]);
      setIsSending(true);
      isSendingRef.current = true;
      setStreamingMessageId(null);
      setAgentStatus("thinking");
      clearCompleteTimer();
      startStreamTypewriter();

      const streamingId = `streaming-${crypto.randomUUID()}`;
      let receivedDelta = false;
      let receivedDone = false;
      let resultConversationId: string | null = targetConversationId;
      let openCanvas = false;

      try {
        const res = await fetch("/api/agent/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            conversationId: targetConversationId,
            content: trimmed,
            contextStageId: opts?.contextStageId ?? resolvedFilterStageId ?? null,
            pageContext,
            flags,
          }),
        });

        if (controller.signal.aborted) {
          return { conversationId: null, openCanvas: false };
        }

        const reader = res.body?.getReader();
        if (!reader) {
          throw new Error("Stream no disponible");
        }

        const decoder = new TextDecoder();
        let buffer = "";
        let streamError: string | null = null;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          if (controller.signal.aborted) {
            await reader.cancel();
            break;
          }

          buffer += decoder.decode(value, { stream: true });
          const parsed = parseSseBuffer(buffer);
          buffer = parsed.rest;

          for (const evt of parsed.events) {
            if (evt.event === "delta" && evt.data.type === "text") {
              const chunk = String(evt.data.content ?? "");
              if (!chunk) continue;

              if (!receivedDelta) {
                receivedDelta = true;
                setAgentStatus("generating");
                setStreamingMessageId(streamingId);
                setMessages((prev) => [
                  ...prev,
                  buildOptimisticAssistantMessage(streamingId, resultConversationId),
                ]);
              }

              appendStreamBuffer(chunk);
            }

            if (evt.event === "tool_start" && !receivedDelta) {
              receivedDelta = true;
              setAgentStatus("generating");
              setStreamingMessageId(streamingId);
              setMessages((prev) => {
                if (prev.some((message) => message.id === streamingId)) return prev;
                return [
                  ...prev,
                  buildOptimisticAssistantMessage(streamingId, resultConversationId),
                ];
              });
            }

            if (evt.event === "done") {
              receivedDone = true;
              resultConversationId = String(evt.data.conversationId ?? resultConversationId);
              openCanvas = Boolean(evt.data.openCanvas);
            }

            if (evt.event === "error") {
              streamError = String(evt.data.message ?? "Error al enviar");
            }
          }
        }

        if (streamError) {
          throw new Error(streamError);
        }

        if (!receivedDone) {
          markStreamEnded();
          await waitForStreamCatchUp();
          snapStreamToBuffer();

          if (receivedDelta) {
            const { buffered } = getTextSnapshot();
            setMessages((prev) =>
              prev.map((message) =>
                message.id === streamingId
                  ? { ...message, content: buffered || message.content }
                  : message
              )
            );
            setStreamingMessageId(null);
            resetStreamTypewriter();
            markComplete();
            void refresh();
            return {
              conversationId: resultConversationId ?? targetConversationId,
              openCanvas: false,
            };
          }

          if (!res.ok) {
            throw new Error("Error al enviar");
          }
          throw new Error("Stream terminó sin respuesta completa");
        }

        if (!res.ok && !receivedDelta) {
          throw new Error("Error al enviar");
        }

        if (!resultConversationId) {
          throw new Error("Respuesta inválida del agente");
        }

        markStreamEnded();
        await waitForStreamCatchUp();
        snapStreamToBuffer();

        const finalMessages = await listAgentMessagesAction(resultConversationId);
        setMessages(finalMessages);
        setStreamingMessageId(null);
        resetStreamTypewriter();
        markComplete();

        const navigatedAway =
          !resolvedConversationId ||
          resolvedConversationId !== resultConversationId;

        if (navigatedAway) {
          skipLoadForConversationRef.current = resultConversationId;
          router.replace(paths.platform.agent.conversation(resultConversationId), {
            scroll: false,
          });
        }

        void refresh();
        return {
          conversationId: resultConversationId,
          openCanvas,
        };
      } catch (error) {
        if (controller.signal.aborted) {
          setStreamingMessageId(null);
          resetStreamTypewriter();
          setAgentStatus("cancelled");
          setTimeout(() => setAgentStatus("idle"), 1200);
          return { conversationId: null, openCanvas: false };
        }

        setMessages((prev) =>
          prev.filter(
            (message) =>
              !message.id.startsWith("optimistic-") &&
              !message.id.startsWith("streaming-")
          )
        );
        setStreamingMessageId(null);
        resetStreamTypewriter();
        setAgentStatus("error");
        throw error;
      } finally {
        if (abortControllerRef.current === controller) {
          abortControllerRef.current = null;
        }
        isSendingRef.current = false;
        setIsSending(false);
      }
    },
    [
      resolvedConversationId,
      resolvedFilterStageId,
      pageContext,
      refresh,
      router,
      clearCompleteTimer,
      markComplete,
      startStreamTypewriter,
      appendStreamBuffer,
      markStreamEnded,
      waitForStreamCatchUp,
      snapStreamToBuffer,
      resetStreamTypewriter,
      getTextSnapshot,
    ]
  );

  const retryLastMessage = useCallback(async () => {
    const last = lastSendRef.current;
    if (!last) return;
    setAgentStatus("idle");
    await sendMessage(last.content, {
      conversationId: last.conversationId,
      flags: last.flags,
    });
  }, [sendMessage]);

  const createStage = useCallback(
    async (input: { name: string; description?: string }) => {
      await createBusinessStageAction(input);
      await refresh();
      router.refresh();
    },
    [refresh, router]
  );

  const deleteConversation = useCallback(
    async (id: string) => {
      await deleteAgentConversationAction(id);
      await refresh();
      if (resolvedConversationId === id) {
        router.push(
          resolvedFilterStageId
            ? paths.platform.agent.stage(resolvedFilterStageId)
            : paths.platform.agent.root
        );
      }
    },
    [resolvedConversationId, resolvedFilterStageId, refresh, router]
  );

  const deleteStage = useCallback(
    async (id: string) => {
      await deleteBusinessStageAction(id);
      await refresh();
      router.refresh();
      if (resolvedFilterStageId === id) {
        router.push(paths.platform.agent.root);
      }
    },
    [resolvedFilterStageId, refresh, router]
  );

  const startNewConversation = useCallback(() => {
    skipLoadForConversationRef.current = null;
    router.push(
      resolvedFilterStageId
        ? paths.platform.agent.stage(resolvedFilterStageId)
        : paths.platform.agent.root
    );
    setMessages([]);
    setStreamingMessageId(null);
    setAgentStatus("idle");
  }, [resolvedFilterStageId, router]);

  useEffect(() => () => clearCompleteTimer(), [clearCompleteTimer]);

  const value = useMemo(
    () => ({
      conversationId: resolvedConversationId,
      filterStageId: resolvedFilterStageId,
      workspace,
      messages,
      streamingMessageId,
      streamingDisplayedText: streamingDisplayedText,
      agentStatus,
      isLoading,
      isSending,
      inputValue,
      setInputValue,
      refresh,
      loadConversation,
      sendMessage,
      cancelSend,
      retryLastMessage,
      createStage,
      deleteConversation,
      deleteStage,
      startNewConversation,
    }),
    [
      resolvedConversationId,
      resolvedFilterStageId,
      workspace,
      messages,
      streamingMessageId,
      streamingDisplayedText,
      agentStatus,
      isLoading,
      isSending,
      inputValue,
      refresh,
      loadConversation,
      sendMessage,
      cancelSend,
      retryLastMessage,
      createStage,
      deleteConversation,
      deleteStage,
      startNewConversation,
    ]
  );

  return (
    <AgentDataCtx.Provider value={value}>{children}</AgentDataCtx.Provider>
  );
}

export function useAgentData() {
  const ctx = useContext(AgentDataCtx);
  if (!ctx) {
    throw new Error("useAgentData must be used within AgentDataProvider");
  }
  return ctx;
}

export type { AgentConversation, AgentFlags, BusinessStage };
