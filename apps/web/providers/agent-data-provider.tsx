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
  createAgentConversationAction,
  createAgentProjectAction,
  createBusinessStageAction,
  deleteAgentConversationAction,
  deleteAgentProjectAction,
  listAgentMessagesAction,
  listAgentWorkspaceAction,
  sendAgentMessageAction,
} from "@/app/agent/actions";
import { paths } from "@/routes/paths";
import type {
  AgentConversation,
  AgentMessage,
  AgentProject,
  AgentProjectColor,
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
  sendMessage: (content: string, opts?: { conversationId?: string | null; projectId?: string | null; stageId?: string | null }) => Promise<string | null>;
  createProject: (input: { name: string; description?: string; color: AgentProjectColor; stageId: string }) => Promise<void>;
  createStage: (input: { name: string; description?: string }) => Promise<void>;
  deleteConversation: (id: string) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  startNewConversation: (opts?: { projectId?: string | null; stageId?: string | null }) => Promise<void>;
  filteredConversations: (opts?: { projectId?: string | null; stageId?: string | null }) => AgentConversation[];
};

const AgentDataCtx = createContext<AgentDataContextValue | null>(null);

export function AgentDataProvider({
  children,
  conversationId,
  filterProjectId,
  filterStageId,
}: {
  children: ReactNode;
  conversationId?: string | null;
  filterProjectId?: string | null;
  filterStageId?: string | null;
}) {
  const router = useRouter();
  const [workspace, setWorkspace] = useState<AgentWorkspaceData>({
    projects: [],
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
      opts?: {
        conversationId?: string | null;
        projectId?: string | null;
        stageId?: string | null;
      }
    ) => {
      setIsSending(true);
      try {
        const result = await sendAgentMessageAction({
          conversationId: opts?.conversationId ?? conversationId ?? null,
          content,
          projectId: opts?.projectId ?? filterProjectId ?? null,
          stageId: opts?.stageId ?? filterStageId ?? null,
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
    [conversationId, filterProjectId, filterStageId, refresh, router]
  );

  const createProject = useCallback(
    async (input: {
      name: string;
      description?: string;
      color: AgentProjectColor;
      stageId: string;
    }) => {
      await createAgentProjectAction(input);
      await refresh();
      router.refresh();
    },
    [refresh, router]
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
        router.push(paths.platform.agent.root);
      }
    },
    [conversationId, refresh, router]
  );

  const deleteProject = useCallback(
    async (id: string) => {
      const project = workspace.projects.find((item) => item.id === id) ?? null;
      await deleteAgentProjectAction(id);
      await refresh();
      if (filterProjectId === id) {
        router.push(
          project?.stageId
            ? paths.platform.agent.stage(project.stageId)
            : paths.platform.agent.root
        );
      }
    },
    [filterProjectId, refresh, router, workspace.projects]
  );

  const startNewConversation = useCallback(
    async (opts?: { projectId?: string | null; stageId?: string | null }) => {
      const projectId = opts?.projectId ?? filterProjectId ?? null;
      const stageId = opts?.stageId ?? filterStageId ?? null;
      if (projectId) {
        router.push(paths.platform.agent.project(projectId));
        setMessages([]);
        setResponseRevealMessageId(null);
        return;
      }
      if (stageId) {
        router.push(paths.platform.agent.stage(stageId));
        setMessages([]);
        setResponseRevealMessageId(null);
        return;
      }
      router.push(paths.platform.agent.root);
      setMessages([]);
      setResponseRevealMessageId(null);
    },
    [filterProjectId, filterStageId, router]
  );

  const filteredConversations = useCallback(
    (opts?: { projectId?: string | null; stageId?: string | null }) => {
      const pid = opts?.projectId ?? filterProjectId;
      const sid = opts?.stageId ?? filterStageId;
      return workspace.conversations.filter((c) => {
        if (pid && c.projectId !== pid) return false;
        if (sid && c.stageId !== sid) return false;
        return true;
      });
    },
    [workspace.conversations, filterProjectId, filterStageId]
  );

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
      createProject,
      createStage,
      deleteConversation,
      deleteProject,
      startNewConversation,
      filteredConversations,
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
      createProject,
      createStage,
      deleteConversation,
      deleteProject,
      startNewConversation,
      filteredConversations,
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

export type { AgentConversation, AgentProject, BusinessStage };
