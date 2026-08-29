"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { MessageSquare, Minus, Sparkles, X } from "lucide-react";
import { cn } from "@ai-coo/ui";
import { PromptInputBox } from "@/components/ui/ai-prompt-box";
import { useFloatingChat } from "@/providers/floating-chat-provider";
import { paths } from "@/routes/paths";

export function FloatingChat() {
  const pathname = usePathname();
  const router = useRouter();
  const agentRoot = paths.platform.agent.root;
  const {
    isOpen,
    isMinimized,
    isExpanding,
    inputValue,
    setInputValue,
    hasNewMessage,
    open,
    close,
    minimize,
    sendFromFloating,
    setIsExpanding,
    pendingConversationId,
    clearPendingConversationId,
  } = useFloatingChat();

  const isAgentRoute =
    pathname === agentRoot || pathname.startsWith(`${agentRoot}/`);

  useEffect(() => {
    if (!isExpanding) return;
    const timer = window.setTimeout(() => {
      const target = pendingConversationId
        ? paths.platform.agent.conversation(pendingConversationId)
        : agentRoot;
      router.push(target);
      clearPendingConversationId();
      setIsExpanding(false);
    }, 380);
    return () => window.clearTimeout(timer);
  }, [
    isExpanding,
    router,
    setIsExpanding,
    pendingConversationId,
    clearPendingConversationId,
    agentRoot,
  ]);

  if (isAgentRoute) {
    return null;
  }

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            type="button"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            onClick={open}
            aria-label="Abrir agente de negocio"
            className={cn(
              "glass-liquid-border fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center",
              "rounded-full bg-[#0A0A0A] shadow-lg shadow-brand-500/20",
              "transition-colors duration-150 hover:bg-glass-hover"
            )}
          >
            <MessageSquare className="relative z-10 h-5 w-5 text-white" />
            {hasNewMessage ? (
              <span
                className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-background bg-brand-400"
                aria-hidden
              />
            ) : null}
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && isMinimized && (
          <motion.button
            type="button"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            onClick={open}
            aria-label="Restaurar chat del agente"
            className={cn(
              "glass-liquid-border fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center",
              "rounded-full bg-[#0A0A0A] shadow-lg shadow-brand-500/20",
              "transition-colors duration-150 hover:bg-glass-hover"
            )}
          >
            <MessageSquare className="relative z-10 h-5 w-5 text-white" />
            {inputValue.trim() ? (
              <span
                className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-background bg-brand-400"
                aria-hidden
              />
            ) : null}
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && !isMinimized && (
          <>
            <motion.button
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              aria-label="Minimizar chat"
              className="fixed inset-0 z-40 cursor-default bg-transparent"
              onClick={minimize}
            />
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.97 }}
              transition={{ duration: 0.2, ease: [0.32, 0.72, 0, 1] }}
              className="floating-chat fixed bottom-6 right-6 z-50 w-[440px] max-w-[calc(100vw-3rem)]"
            >
              <div className="floating-chat-header flex items-center justify-between rounded-t-2xl border border-b-0 px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full border border-brand-500/30 bg-brand-600/20">
                    <Sparkles className="h-2.5 w-2.5 text-brand-400" />
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">
                    Agente de negocio
                  </span>
                </div>
                <div className="flex items-center gap-0.5">
                  <button
                    type="button"
                    onClick={minimize}
                    className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    aria-label="Minimizar"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    onClick={close}
                    className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    aria-label="Cerrar"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              </div>
              <PromptInputBox
                value={inputValue}
                onValueChange={setInputValue}
                onSend={(message) => void sendFromFloating(message)}
                placeholder="Preguntale algo a tu agente..."
                className="rounded-t-none rounded-b-2xl border-t-0 !rounded-t-none"
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isExpanding && (
          <motion.div
            className="pointer-events-none fixed z-[100] bg-background"
            initial={{
              borderRadius: "16px",
              bottom: "1.5rem",
              right: "1.5rem",
              width: "440px",
              height: "200px",
              opacity: 0.6,
            }}
            animate={{
              borderRadius: "0px",
              bottom: 0,
              right: 0,
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              opacity: 1,
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 0.38,
              ease: [0.32, 0.72, 0, 1],
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
}
