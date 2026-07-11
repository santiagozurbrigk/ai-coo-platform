"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, RotateCcw } from "lucide-react";
import { Button } from "@ai-coo/ui";
import type { AgentStatus } from "@/lib/agent/types";
import { getToolStatusLabel } from "@/lib/agent/tool-status-label";
import { AgentThinkingOrb } from "./agent-thinking-orb";

type AgentStatusIndicatorProps = {
  status: AgentStatus;
  activeToolName?: string | null;
  onRetry?: () => void;
};

export function AgentStatusIndicator({
  status,
  activeToolName = null,
  onRetry,
}: AgentStatusIndicatorProps) {
  const showOrb = status === "thinking" || activeToolName !== null;
  const toolLabel = activeToolName ? getToolStatusLabel(activeToolName) : null;

  return (
    <AnimatePresence mode="wait">
      {showOrb ? (
        <motion.div
          key="orb"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.85, y: -4 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="flex gap-3"
          aria-live="polite"
          aria-label={toolLabel ?? "Pensando"}
        >
          <div className="flex flex-col items-center gap-1.5">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center">
              <AgentThinkingOrb active={activeToolName !== null} className="h-8 w-8" />
            </div>
            {toolLabel ? (
              <p className="max-w-[140px] text-center text-xs text-muted-foreground">
                {toolLabel}
              </p>
            ) : null}
          </div>
        </motion.div>
      ) : null}

      {status === "error" ? (
        <motion.div
          key="error"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="flex gap-3"
        >
          <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-red-500/30 bg-red-500/10">
            <AlertCircle className="h-3.5 w-3.5 text-red-400" />
          </div>
          <div className="flex flex-col gap-2 rounded-2xl border border-red-500/20 bg-red-500/5 px-4 py-3">
            <p className="text-sm text-red-300">
              No se pudo completar la respuesta. Intentá de nuevo.
            </p>
            {onRetry ? (
              <Button size="sm" variant="outline" onClick={onRetry} className="w-fit gap-1.5">
                <RotateCcw className="h-3.5 w-3.5" />
                Reintentar
              </Button>
            ) : null}
          </div>
        </motion.div>
      ) : null}

      {status === "cancelled" ? (
        <motion.div
          key="cancelled"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="px-1 text-xs text-muted-foreground italic"
        >
          Respuesta cancelada
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
