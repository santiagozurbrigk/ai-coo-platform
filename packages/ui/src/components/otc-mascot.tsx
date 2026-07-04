"use client";

import * as React from "react";
import { motion, type Transition } from "framer-motion";
import { cn } from "../lib/utils";
import { usePrefersReducedMotion } from "../hooks/use-prefers-reduced-motion";

export type OtcMascotProps = {
  /** Public URL to the mascot sprite (defaults to `/mascot/otc-mascot.png`). */
  src?: string;
  /** Rendered box size in px; image scales with `transform` only. */
  size?: number;
  className?: string;
  alt?: string;
};

const DEFAULT_SRC = "/mascot/otc-mascot.png";

/** Double-pulse heartbeat over 2s: big beat ~0.5s, smaller ~1.5s. */
const HEARTBEAT_TRANSITION: Transition = {
  duration: 2,
  repeat: Infinity,
  ease: "easeInOut",
  times: [0, 0.25, 0.5, 0.75, 1],
};

const HEARTBEAT_SCALE = [1, 1.06, 1, 1.03, 1] as const;

const SPARKLE_POSITIONS = [
  { top: "6%", left: "70%" },
  { top: "2%", left: "14%" },
  { top: "-4%", left: "46%" },
] as const;

const SPARKLE_TRANSITION: Transition = {
  duration: 2,
  repeat: Infinity,
  ease: "easeInOut",
  times: [0, 0.14, 0.24, 0.34, 0.44, 1],
};

type SparkleProps = {
  style: React.CSSProperties;
  delay?: number;
};

function Sparkle({ style, delay = 0 }: SparkleProps) {
  return (
    <motion.span
      className="pointer-events-none absolute z-10 h-1.5 w-1.5 rounded-full bg-violet-400 shadow-[0_0_8px_3px_rgba(167,139,250,0.9)] dark:bg-[#A78BFA]"
      style={style}
      animate={{
        opacity: [0, 0, 1, 0.75, 0, 0],
        y: [0, 0, -4, -7, -3, 0],
        scale: [0.5, 0.5, 1.1, 0.85, 0.5, 0.5],
      }}
      transition={{ ...SPARKLE_TRANSITION, delay }}
      aria-hidden
    />
  );
}

export function OtcMascot({
  src = DEFAULT_SRC,
  size = 48,
  className,
  alt = "OTC pensando",
}: OtcMascotProps) {
  const reducedMotion = usePrefersReducedMotion();

  return (
    <div
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-visible",
        className
      )}
      style={{ width: size, height: size }}
      role="img"
      aria-label={alt}
    >
      {!reducedMotion
        ? SPARKLE_POSITIONS.map((pos, index) => (
            <Sparkle
              key={`${pos.top}-${pos.left}`}
              style={{ top: pos.top, left: pos.left }}
              delay={index * 0.04}
            />
          ))
        : null}

      {reducedMotion ? (
        <img
          src={src}
          alt=""
          width={size}
          height={size}
          className="h-full w-full object-contain opacity-90"
          style={{ imageRendering: "pixelated" }}
          draggable={false}
        />
      ) : (
        <motion.img
          src={src}
          alt=""
          width={size}
          height={size}
          className="relative z-0 h-full w-full origin-center object-contain"
          style={{ imageRendering: "pixelated" }}
          animate={{ scale: [...HEARTBEAT_SCALE] }}
          transition={HEARTBEAT_TRANSITION}
          draggable={false}
        />
      )}
    </div>
  );
}
