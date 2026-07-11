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
import type { AgentStatus } from "@/lib/agent/types";
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
  responseRevealMessageId: string | null;
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
  onRevealComplete: () => void;
  retryLastMessage: () => Promise<void>;
  createStage: (input: { name: string; description?: string }) => Promise<void>;
  deleteConversation: (id: string) => Promise<void>;
  deleteStage: (id: string) => Promise<void>;
  startNewConversation: () => void;
};

const AgentDataCtx = createContext<AgentDataContextValue | null>(null);

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
  const pageContext = useOptionalPageContext()?.pageContext ?? null;
  const resolvedConversationId = conversationId ?? null;
  const resolvedFilterStageId = filterStageId ?? null;

  const skipLoadForConversationRef = useRef<string | null>(null);
  const initialLoadDoneRef = useRef(false);
  const isSendingRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastSendRef = useRef<{ content: string; flags?: AgentFlags; conversationId: string | null } | null>(null);
  const completeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [workspace, setWorkspace] = useState<AgentWorkspaceData>({
    stages: [],
    conversations: [],
  });
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [responseRevealMessageId, setResponseRevealMessageId] = useState<string | null>(null);
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
      setResponseRevealMessageId(null);
      return;
    }
    const rows = await listAgentMessagesAction(id);
    setMessages(rows);
    setResponseRevealMessageId(null);
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
    setAgentStatus("cancelled");
    clearCompleteTimer();
    setTimeout(() => setAgentStatus("idle"), 1200);
  }, [clearCompleteTimer]);

  const onRevealComplete = useCallback(() => {
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
      setResponseRevealMessageId(null);
      setAgentStatus("thinking");
      clearCompleteTimer();

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

        const payload = (await res.json()) as
          | { conversationId: string; messages: AgentMessage[]; openCanvas: boolean }
          | { error: string };

        if (!res.ok) {
          throw new Error("error" in payload ? payload.error : "Error al enviar");
        }

        if (!("conversationId" in payload)) {
          throw new Error("Respuesta inválida del agente");
        }

        setMessages(payload.messages);
        const assistantId =
          [...payload.messages].reverse().find((message) => message.role === "assistant")?.id ??
          null;

        setAgentStatus("generating");
        setResponseRevealMessageId(assistantId);

        const navigatedAway =
          !resolvedConversationId ||
          resolvedConversationId !== payload.conversationId;

        if (navigatedAway) {
          skipLoadForConversationRef.current = payload.conversationId;
          router.replace(paths.platform.agent.conversation(payload.conversationId), {
            scroll: false,
          });
        }

        void refresh();
        return {
          conversationId: payload.conversationId,
          openCanvas: payload.openCanvas,
        };
      } catch (error) {
        if (controller.signal.aborted) {
          setAgentStatus("cancelled");
          setTimeout(() => setAgentStatus("idle"), 1200);
          return { conversationId: null, openCanvas: false };
        }

        setMessages((prev) =>
          prev.filter((message) => !message.id.startsWith("optimistic-"))
        );
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
    setResponseRevealMessageId(null);
    setAgentStatus("idle");
  }, [resolvedFilterStageId, router]);

  useEffect(() => () => clearCompleteTimer(), [clearCompleteTimer]);

  const value = useMemo(
    () => ({
      conversationId: resolvedConversationId,
      filterStageId: resolvedFilterStageId,
      workspace,
      messages,
      responseRevealMessageId,
      agentStatus,
      isLoading,
      isSending,
      inputValue,
      setInputValue,
      refresh,
      loadConversation,
      sendMessage,
      cancelSend,
      onRevealComplete,
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
      responseRevealMessageId,
      agentStatus,
      isLoading,
      isSending,
      inputValue,
      refresh,
      loadConversation,
      sendMessage,
      cancelSend,
      onRevealComplete,
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
