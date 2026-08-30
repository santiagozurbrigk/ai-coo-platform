"use client";

import { motion } from "framer-motion";
import { cn, usePrefersReducedMotion } from "@ai-coo/ui";

type AgentThinkingOrbProps = {
  /** Más activo durante generating */
  active?: boolean;
  className?: string;
};

export function AgentThinkingOrb({ active = false, className }: AgentThinkingOrbProps) {
  const reducedMotion = usePrefersReducedMotion();

  if (reducedMotion) {
    return (
      <div
        className={cn(
          "h-10 w-10 rounded-full bg-brand-500/30 ring-2 ring-brand-400/40",
          className
        )}
        aria-hidden
      />
    );
  }

  return (
    <div className={cn("relative flex h-12 w-12 items-center justify-center", className)}>
      {/* Glow pulsante */}
      <motion.div
        className="absolute inset-0 rounded-full bg-brand-500/25 blur-md"
        animate={{
          opacity: active ? [0.45, 0.85, 0.45] : [0.3, 0.6, 0.3],
          scale: active ? [1, 1.25, 1] : [1, 1.15, 1],
        }}
        transition={{
          duration: active ? 1.6 : 2.4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Esfera principal */}
      <motion.div
        className="relative h-10 w-10 overflow-hidden rounded-full border border-brand-400/30 bg-gradient-to-br from-brand-500/40 via-brand-600/25 to-brand-600/35 shadow-[0_0_24px_rgba(241,110,34,0.35)] backdrop-blur-sm"
        animate={{
          scale: active ? [1, 1.1, 1] : [1, 1.08, 1],
          scaleX: active ? [1, 0.94, 1.04, 1] : [1, 0.96, 1.03, 1],
          scaleY: active ? [1, 1.06, 0.96, 1] : [1, 1.04, 0.97, 1],
          y: active ? [-3, 3, -3] : [-4, 4, -4],
        }}
        transition={{
          scale: { duration: active ? 1.8 : 2.4, repeat: Infinity, ease: "easeInOut" },
          scaleX: { duration: 2.1, repeat: Infinity, ease: "easeInOut" },
          scaleY: { duration: 2.3, repeat: Infinity, ease: "easeInOut", delay: 0.15 },
          y: { duration: 3, repeat: Infinity, ease: "easeInOut" },
        }}
      >
        {/* Gradiente rotatorio interior */}
        <motion.div
          className="absolute inset-[-40%] opacity-70"
          style={{
            background:
              "conic-gradient(from 0deg, rgba(245,135,71,0.7), rgba(241,110,34,0.2), rgba(241,110,34,0.55), rgba(245,135,71,0.7))",
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: active ? 5 : 8, repeat: Infinity, ease: "linear" }}
        />
        <div className="absolute inset-[22%] rounded-full bg-brand-300/20 blur-[2px]" />
      </motion.div>
    </div>
  );
}
