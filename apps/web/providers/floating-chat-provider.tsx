"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { sendAgentMessageAction } from "@/app/agent/actions";

export type AgentChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
};

type FloatingChatContextValue = {
  isOpen: boolean;
  isMinimized: boolean;
  isExpanding: boolean;
  inputValue: string;
  messages: AgentChatMessage[];
  isLoading: boolean;
  hasNewMessage: boolean;
  open: () => void;
  close: () => void;
  minimize: () => void;
  toggle: () => void;
  setInputValue: (v: string) => void;
  setIsExpanding: (v: boolean) => void;
  sendFromFloating: (message: string) => void;
  sendFromAgent: (message: string) => Promise<void>;
  applySuggestion: (text: string) => void;
  markMessagesRead: () => void;
  needsAgentReply: boolean;
  clearNeedsAgentReply: () => void;
  runAgentReply: () => Promise<void>;
  pendingConversationId: string | null;
  clearPendingConversationId: () => void;
};

const FloatingChatCtx = createContext<FloatingChatContextValue | null>(null);

function newId() {
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

const MOCK_REPLY =
  "Gracias por tu consulta. Conecta ANTHROPIC_API_KEY y ejecuta la migración del agente en Supabase para respuestas reales con contexto de tu negocio.";

export function FloatingChatProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isExpanding, setIsExpanding] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<AgentChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const [needsAgentReply, setNeedsAgentReply] = useState(false);
  const [pendingConversationId, setPendingConversationId] = useState<string | null>(null);

  const open = useCallback(() => {
    setIsOpen(true);
    setIsMinimized(false);
  }, []);
  const close = useCallback(() => {
    setIsOpen(false);
    setIsMinimized(false);
  }, []);
  const minimize = useCallback(() => setIsMinimized(true), []);
  const toggle = useCallback(() => {
    setIsOpen((open) => {
      if (!open) {
        setIsMinimized(false);
        return true;
      }
      setIsMinimized((min) => !min);
      return true;
    });
  }, []);
  const markMessagesRead = useCallback(() => setHasNewMessage(false), []);

  const appendUserMessage = useCallback((content: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: newId(),
        role: "user",
        content,
        timestamp: new Date().toISOString(),
      },
    ]);
  }, []);

  const appendAssistantMessage = useCallback((content: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: newId(),
        role: "assistant",
        content,
        timestamp: new Date().toISOString(),
      },
    ]);
    setHasNewMessage(true);
  }, []);

  const simulateReply = useCallback(async () => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 900));
    appendAssistantMessage(MOCK_REPLY);
    setIsLoading(false);
  }, [appendAssistantMessage]);

  const clearNeedsAgentReply = useCallback(() => setNeedsAgentReply(false), []);

  const clearPendingConversationId = useCallback(
    () => setPendingConversationId(null),
    []
  );

  const sendFromFloating = useCallback(
    async (message: string) => {
      const trimmed = message.trim();
      if (!trimmed) return;
      setInputValue("");
      setIsOpen(false);
      setIsMinimized(false);
      setIsExpanding(true);
      setPendingConversationId(null);
      try {
        const result = await sendAgentMessageAction({ content: trimmed });
        setPendingConversationId(result.conversationId);
      } catch (error) {
        console.error("[sendFromFloating]", error);
        setIsExpanding(false);
        appendUserMessage(trimmed);
        appendAssistantMessage(MOCK_REPLY);
        setHasNewMessage(true);
      }
    },
    [appendUserMessage, appendAssistantMessage]
  );

  const sendFromAgent = useCallback(
    async (message: string) => {
      const trimmed = message.trim();
      if (!trimmed || isLoading) return;
      appendUserMessage(trimmed);
      setInputValue("");
      await simulateReply();
    },
    [appendUserMessage, isLoading, simulateReply]
  );

  const applySuggestion = useCallback((text: string) => {
    setInputValue(text);
  }, []);

  const value = useMemo(
    () => ({
      isOpen,
      isMinimized,
      isExpanding,
      inputValue,
      messages,
      isLoading,
      hasNewMessage,
      open,
      close,
      minimize,
      toggle,
      setInputValue,
      setIsExpanding,
      sendFromFloating,
      sendFromAgent,
      applySuggestion,
      markMessagesRead,
      needsAgentReply,
      clearNeedsAgentReply,
      runAgentReply: simulateReply,
      pendingConversationId,
      clearPendingConversationId,
    }),
    [
      isOpen,
      isMinimized,
      isExpanding,
      inputValue,
      messages,
      isLoading,
      hasNewMessage,
      open,
      close,
      minimize,
      toggle,
      sendFromFloating,
      sendFromAgent,
      applySuggestion,
      markMessagesRead,
      needsAgentReply,
      clearNeedsAgentReply,
      simulateReply,
      pendingConversationId,
      clearPendingConversationId,
    ]
  );

  return (
    <FloatingChatCtx.Provider value={value}>{children}</FloatingChatCtx.Provider>
  );
}

export function useFloatingChat() {
  const ctx = useContext(FloatingChatCtx);
  if (!ctx) {
    throw new Error("useFloatingChat must be used within FloatingChatProvider");
  }
  return ctx;
}
