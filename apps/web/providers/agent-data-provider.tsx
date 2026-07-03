"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
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
  AgentMessage,
  AgentWorkspaceData,
  BusinessStage,
} from "@/types/agent";

type AgentDataContextValue = {
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
    opts?: { conversationId?: string | null; contextStageId?: string | null }
  ) => Promise<string | null>;
  createStage: (input: { name: string; description?: string }) => Promise<void>;
  deleteConversation: (id: string) => Promise<void>;
  deleteStage: (id: string) => Promise<void>;
  startNewConversation: () => void;
};

const AgentDataCtx = createContext<AgentDataContextValue | null>(null);

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
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      await refresh();
      if (conversationId) {
        await loadConversation(conversationId);
      } else {
        setMessages([]);
      }
      if (!cancelled) setIsLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [conversationId, refresh, loadConversation]);

  const sendMessage = useCallback(
    async (
      content: string,
      opts?: { conversationId?: string | null; contextStageId?: string | null }
    ) => {
      setIsSending(true);
      try {
        const result = await sendAgentMessageAction({
          conversationId: opts?.conversationId ?? conversationId ?? null,
          content,
          contextStageId: opts?.contextStageId ?? filterStageId ?? null,
        });
        setMessages(result.messages);
        setResponseRevealMessageId(
          [...result.messages].reverse().find((message) => message.role === "assistant")?.id ??
            null
        );
        setInputValue("");
        await refresh();
        if (!conversationId || conversationId !== result.conversationId) {
          router.push(paths.platform.agent.conversation(result.conversationId));
        }
        return result.conversationId;
      } finally {
        setIsSending(false);
      }
    },
    [conversationId, filterStageId, refresh, router]
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
      if (conversationId === id) {
        router.push(
          filterStageId
            ? paths.platform.agent.stage(filterStageId)
            : paths.platform.agent.root
        );
      }
    },
    [conversationId, filterStageId, refresh, router]
  );

  const deleteStage = useCallback(
    async (id: string) => {
      await deleteBusinessStageAction(id);
      await refresh();
      router.refresh();
      if (filterStageId === id) {
        router.push(paths.platform.agent.root);
      }
    },
    [filterStageId, refresh, router]
  );

  const startNewConversation = useCallback(() => {
    router.push(
      filterStageId
        ? paths.platform.agent.stage(filterStageId)
        : paths.platform.agent.root
    );
    setMessages([]);
    setResponseRevealMessageId(null);
  }, [filterStageId, router]);

  const value = useMemo(
    () => ({
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

export type { AgentConversation, BusinessStage };
