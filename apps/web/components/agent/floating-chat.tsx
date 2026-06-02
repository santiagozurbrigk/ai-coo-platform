"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { MessageSquare, Minus, Sparkles, X } from "lucide-react";
import { cn } from "@ai-coo/ui";
import { useFloatingChat } from "@/providers/floating-chat-provider";
import { paths } from "@/routes/paths";
import { PromptInputBox } from "./prompt-input-box";

export function FloatingChat() {
  const pathname = usePathname();
  const router = useRouter();
  const {
    isOpen,
    isExpanding,
    inputValue,
    setInputValue,
    hasNewMessage,
    toggle,
    minimize,
    close,
    sendFromFloating,
    setIsExpanding,
  } = useFloatingChat();

  const isAgentRoute = pathname === paths.platform.agent || pathname.startsWith(`${paths.platform.agent}/`);

  useEffect(() => {
    if (!isExpanding) return;
    const timer = window.setTimeout(() => {
      router.push(paths.platform.agent);
      setIsExpanding(false);
    }, 400);
    return () => window.clearTimeout(timer);
  }, [isExpanding, router, setIsExpanding]);

  if (isAgentRoute) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        onClick={toggle}
        aria-label="Abrir agente de negocio"
        aria-expanded={isOpen}
        className={cn(
          "fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center",
          "rounded-full bg-violet-600 shadow-lg shadow-violet-500/25",
          "transition-all duration-200 hover:scale-105 hover:bg-violet-500 active:scale-95"
        )}
      >
        <MessageSquare className="h-5 w-5 text-white" />
        {hasNewMessage ? (
          <span
            className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-background bg-violet-400"
            aria-hidden
          />
        ) : null}
      </button>

      <AnimatePresence>
        {isOpen ? (
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
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.96 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="floating-chat fixed bottom-20 right-6 z-50 w-[420px] max-w-[calc(100vw-3rem)] rounded-2xl shadow-2xl"
            >
              <div className="floating-chat-header flex items-center justify-between rounded-t-2xl border-b px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-600">
                    <Sparkles className="h-3 w-3 text-white" />
                  </div>
                  <span className="text-sm font-medium text-foreground/90">
                    Agente de negocio
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={minimize}
                    className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    aria-label="Minimizar"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={close}
                    className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    aria-label="Cerrar"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <PromptInputBox
                value={inputValue}
                onChange={setInputValue}
                onSend={sendFromFloating}
                placeholder="Preguntale algo a tu agente..."
                className="rounded-t-none rounded-b-2xl border-t-0"
              />
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {isExpanding ? (
          <motion.div
            className="fixed z-[100] bg-background"
            initial={{
              opacity: 0,
              borderRadius: 16,
              bottom: "5rem",
              right: "1.5rem",
              top: "auto",
              left: "auto",
              width: 420,
              height: 200,
            }}
            animate={{
              opacity: 1,
              borderRadius: 0,
              bottom: 0,
              right: 0,
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
          />
        ) : null}
      </AnimatePresence>
    </>
  );
}
