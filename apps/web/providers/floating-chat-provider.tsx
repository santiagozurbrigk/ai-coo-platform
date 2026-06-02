"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type AgentChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
};

type FloatingChatContextValue = {
  isOpen: boolean;
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
};

const FloatingChatCtx = createContext<FloatingChatContextValue | null>(null);

function newId() {
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

const MOCK_REPLY =
  "Gracias por tu consulta. En la próxima fase conectaré datos reales de finanzas, ventas y marketing para darte una respuesta precisa con el contexto de tu negocio.";

export function FloatingChatProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanding, setIsExpanding] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<AgentChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const [needsAgentReply, setNeedsAgentReply] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const minimize = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((v) => !v), []);
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

  const sendFromFloating = useCallback(
    (message: string) => {
      const trimmed = message.trim();
      if (!trimmed) return;
      appendUserMessage(trimmed);
      setInputValue("");
      setIsOpen(false);
      setNeedsAgentReply(true);
      setIsExpanding(true);
    },
    [appendUserMessage]
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
    }),
    [
      isOpen,
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
