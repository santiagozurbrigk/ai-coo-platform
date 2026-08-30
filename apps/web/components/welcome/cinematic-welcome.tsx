"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { brand, brandAssets } from "@/lib/brand";

const EASE_OUT: [number, number, number, number] = [0.16, 1, 0.3, 1];
const EASE_IN_OUT: [number, number, number, number] = [0.4, 0, 0.2, 1];
const EASE_IN: [number, number, number, number] = [0.4, 0, 1, 1];

/** ~4.4s — alineado con la secuencia de fases del spec */
const DURATION_S = 4.4;
const REVEAL_AT_MS = 3800;
const COMPLETE_AT_MS = 4400;

type CinematicWelcomeProps = {
  onRevealDashboard: () => void;
  onComplete: () => void;
};

export function CinematicWelcome({
  onRevealDashboard,
  onComplete,
}: CinematicWelcomeProps) {
  useEffect(() => {
    document.documentElement.style.overflow = "hidden";

    const revealTimer = window.setTimeout(onRevealDashboard, REVEAL_AT_MS);
    const completeTimer = window.setTimeout(onComplete, COMPLETE_AT_MS);

    return () => {
      window.clearTimeout(revealTimer);
      window.clearTimeout(completeTimer);
      document.documentElement.style.overflow = "";
    };
  }, [onRevealDashboard, onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#000000]"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: EASE_IN }}
      role="presentation"
    >
      <motion.div
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0, 0.6, 1, 1, 0] }}
        transition={{
          duration: DURATION_S,
          times: [0, 0.2, 0.35, 0.5, 0.86, 1],
          ease: EASE_IN_OUT,
        }}
      >
        <div
          className="h-[min(70vw,420px)] w-[min(70vw,420px)] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(255,255,255,0.04) 0%, transparent 70%)",
          }}
        />
      </motion.div>

      <motion.div
        className="relative flex flex-col items-center"
        initial={{ opacity: 0, scale: 1.15 }}
        animate={{
          opacity: [0, 0, 1, 1, 1, 1, 0],
          scale: [1.15, 1.15, 1, 1.18, 1.22, 0.88, 0.88],
        }}
        transition={{
          duration: DURATION_S,
          times: [0, 0.068, 0.205, 0.477, 0.659, 0.864, 1],
          ease: EASE_IN_OUT,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={brandAssets.logoDark}
          alt=""
          className="h-auto w-[min(280px,72vw)] max-w-[320px] object-contain"
          draggable={false}
        />
        <motion.p
          className="mt-8 text-center font-sans text-[1.2rem] font-light uppercase tracking-[0.3em] text-white"
          initial={{ opacity: 0, y: 12 }}
          animate={{
            opacity: [0, 0, 0, 0, 1, 1, 1, 0],
            y: [12, 12, 12, 12, 0, 0, 0, 0],
          }}
          transition={{
            duration: DURATION_S,
            times: [0, 0.28, 0.31, 0.318, 0.432, 0.659, 0.864, 1],
            ease: EASE_OUT,
          }}
        >
          {brand.name}
        </motion.p>
      </motion.div>
    </motion.div>
  );
}
