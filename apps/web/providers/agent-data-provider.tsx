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
import {
  createBusinessStageAction,
  deleteAgentConversationAction,
  deleteBusinessStageAction,
  listAgentMessagesAction,
  listAgentWorkspaceAction,
  sendAgentMessageAction,
} from "@/app/agent/actions";
import { paths } from "@/routes/paths";
import type {
  AgentConversation,
  AgentFlags,
  AgentMessage,
  AgentWorkspaceData,
  BusinessStage,
} from "@/types/agent";

type AgentDataContextValue = {
  conversationId: string | null;
  filterStageId: string | null;
  workspace: AgentWorkspaceData;
  messages: AgentMessage[];
  responseRevealMessageId: string | null;
  isLoading: boolean;
  isSending: boolean;
  inputValue: string;
  setInputValue: (v: string) => void;
  refresh: () => Promise<void>;
  loadConversation: (conversationId: string | null) => Promise<void>;
  sendMessage: (
    content: string,
    opts?: { conversationId?: string | null; contextStageId?: string | null; flags?: AgentFlags }
  ) => Promise<string | null>;
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
  const resolvedConversationId = conversationId ?? null;
  const resolvedFilterStageId = filterStageId ?? null;

  const skipLoadForConversationRef = useRef<string | null>(null);
  const initialLoadDoneRef = useRef(false);
  const isSendingRef = useRef(false);

  const [workspace, setWorkspace] = useState<AgentWorkspaceData>({
    stages: [],
    conversations: [],
  });
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [responseRevealMessageId, setResponseRevealMessageId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [inputValue, setInputValue] = useState("");

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

  const sendMessage = useCallback(
    async (
      content: string,
      opts?: { conversationId?: string | null; contextStageId?: string | null; flags?: AgentFlags }
    ) => {
      const trimmed = content.trim();
      if (!trimmed) return null;

      const targetConversationId =
        opts?.conversationId ?? resolvedConversationId ?? null;

      setInputValue("");
      setMessages((prev) => [
        ...prev,
        buildOptimisticUserMessage(trimmed, targetConversationId),
      ]);
      setIsSending(true);
      isSendingRef.current = true;
      setResponseRevealMessageId(null);

      try {
        const result = await sendAgentMessageAction({
          conversationId: targetConversationId,
          content: trimmed,
          contextStageId: opts?.contextStageId ?? resolvedFilterStageId ?? null,
          flags: opts?.flags,
        });

        setMessages(result.messages);
        setResponseRevealMessageId(
          [...result.messages].reverse().find((message) => message.role === "assistant")?.id ??
            null
        );

        const navigatedAway =
          !resolvedConversationId ||
          resolvedConversationId !== result.conversationId;

        if (navigatedAway) {
          skipLoadForConversationRef.current = result.conversationId;
          const nextPath = paths.platform.agent.conversation(result.conversationId);
          router.replace(nextPath, { scroll: false });
        }

        void refresh();
        return result.conversationId;
      } catch (error) {
        setMessages((prev) =>
          prev.filter((message) => !message.id.startsWith("optimistic-"))
        );
        throw error;
      } finally {
        isSendingRef.current = false;
        setIsSending(false);
      }
    },
    [resolvedConversationId, resolvedFilterStageId, refresh, router]
  );

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
  }, [resolvedFilterStageId, router]);

  const value = useMemo(
    () => ({
      conversationId: resolvedConversationId,
      filterStageId: resolvedFilterStageId,
      workspace,
      messages,
      responseRevealMessageId,
      isLoading,
      isSending,
      inputValue,
      setInputValue,
      refresh,
      loadConversation,
      sendMessage,
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
      isLoading,
      isSending,
      inputValue,
      refresh,
      loadConversation,
      sendMessage,
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
