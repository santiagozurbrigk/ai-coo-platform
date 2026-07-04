"use client";

import * as React from "react";
import { motion, type TargetAndTransition } from "framer-motion";
import { cn } from "../lib/utils";
import { usePrefersReducedMotion } from "../hooks/use-prefers-reduced-motion";

export type OtcMascotState =
  | "idle"
  | "thinking"
  | "speaking"
  | "success"
  | "error";

export type OtcMascotAssets = {
  brainLeft: string;
  brainRight: string;
  legLeft: string;
  legRight: string;
};

export type OtcMascotProps = {
  state?: OtcMascotState;
  size?: number;
  className?: string;
  alt?: string;
  assets?: Partial<OtcMascotAssets>;
  onSuccessComplete?: () => void;
  onErrorComplete?: () => void;
};

const DEFAULT_ASSETS: OtcMascotAssets = {
  brainLeft: "/mascot/brain-left.png",
  brainRight: "/mascot/brain-right.png",
  legLeft: "/mascot/leg-left.png",
  legRight: "/mascot/leg-right.png",
};

type PieceId = "brainLeft" | "brainRight" | "legLeft" | "legRight";

type PieceLayout = {
  left: string;
  top: string;
  width: string;
  height: string;
  transformOrigin: string;
};

const PIECE_LAYOUT: Record<PieceId, PieceLayout> = {
  brainLeft: {
    left: "0%",
    top: "0%",
    width: "54%",
    height: "70%",
    transformOrigin: "85% 90%",
  },
  brainRight: {
    left: "46%",
    top: "0%",
    width: "54%",
    height: "70%",
    transformOrigin: "15% 90%",
  },
  legLeft: {
    left: "20%",
    top: "64%",
    width: "24%",
    height: "36%",
    transformOrigin: "50% 0%",
  },
  legRight: {
    left: "56%",
    top: "64%",
    width: "24%",
    height: "36%",
    transformOrigin: "50% 0%",
  },
};

const LOOP = Infinity;

function loopTransition(duration: number) {
  return { duration, repeat: LOOP, ease: "easeInOut" as const };
}

function pieceAnimation(
  piece: PieceId,
  state: OtcMascotState
): TargetAndTransition {
  const isBrain = piece === "brainLeft" || piece === "brainRight";
  const isLeft = piece === "brainLeft" || piece === "legLeft";
  const brainSign = isLeft ? -1 : 1;
  const legSign = isLeft ? -1 : 1;

  switch (state) {
    case "idle":
      if (isBrain) {
        return {
          scaleY: [0.98, 1.02, 0.99, 1.01, 0.98],
          y: [0, -2, 1, -1, 0],
          rotate: [0, brainSign * 0.8, brainSign * -0.6, 0, 0],
          transition: loopTransition(2.6),
        };
      }
      return {
        rotate: [legSign * -2, legSign * 2, legSign * -1, legSign * 1, legSign * -2],
        transition: loopTransition(2.6),
      };

    case "thinking":
      return {
        scaleY: [1, 0.86, 1.1, 0.9, 1.06, 1],
        scaleX: [1, 1.06, 0.94, 1.05, 0.96, 1],
        y: [0, 3, -7, 2, -4, 0],
        transition: {
          ...loopTransition(1.75),
          delay: isBrain ? (isLeft ? 0 : 0.04) : isLeft ? 0.08 : 0.12,
        },
      };

    case "speaking":
      return {
        scaleY: [1, 0.94, 1.05, 0.96, 1],
        y: [0, 2, -3, 1, 0],
        transition: {
          ...loopTransition(1),
          delay: isLeft ? 0 : 0.05,
        },
      };

    case "success":
      return {
        scaleY: [1, 0.82, 1.14, 0.95, 1],
        y: [0, 2, -10, 1, 0],
        transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
      };

    case "error":
      if (!isBrain) {
        return { transition: { duration: 0.5 } };
      }
      return {
        scale: [1, 0.9, 0.9, 1],
        x: [0, -4, 4, -3, 3, 0],
        transition: { duration: 0.5, ease: "easeInOut" },
      };

    default:
      return {};
  }
}

const PIXELATED: React.CSSProperties = { imageRendering: "pixelated" };

type MascotPieceProps = {
  id: PieceId;
  src: string;
  state: OtcMascotState;
  reducedMotion: boolean;
};

function MascotPiece({ id, src, state, reducedMotion }: MascotPieceProps) {
  const layout = PIECE_LAYOUT[id];

  if (reducedMotion) {
    return (
      <img
        src={src}
        alt=""
        className="absolute h-full w-full object-contain"
        style={{
          ...PIXELATED,
          left: layout.left,
          top: layout.top,
          width: layout.width,
          height: layout.height,
        }}
        draggable={false}
      />
    );
  }

  return (
    <motion.img
      src={src}
      alt=""
      className="absolute h-full w-full object-contain"
      style={{
        ...PIXELATED,
        left: layout.left,
        top: layout.top,
        width: layout.width,
        height: layout.height,
        transformOrigin: layout.transformOrigin,
      }}
      animate={pieceAnimation(id, state)}
      draggable={false}
    />
  );
}

export function OtcMascot({
  state = "idle",
  size = 48,
  className,
  alt = "OTC",
  assets: assetsProp,
  onSuccessComplete,
  onErrorComplete,
}: OtcMascotProps) {
  const reducedMotion = usePrefersReducedMotion();
  const assets = { ...DEFAULT_ASSETS, ...assetsProp };
  const height = Math.round(size * 1.12);

  React.useEffect(() => {
    if (reducedMotion) return;
    if (state !== "success" && state !== "error") return;

    const duration = state === "success" ? 650 : 550;
    const timer = window.setTimeout(() => {
      if (state === "success") onSuccessComplete?.();
      else onErrorComplete?.();
    }, duration);

    return () => window.clearTimeout(timer);
  }, [state, reducedMotion, onSuccessComplete, onErrorComplete]);

  return (
    <div
      className={cn("relative inline-flex shrink-0 overflow-visible", className)}
      style={{ width: size, height }}
      role="img"
      aria-label={alt}
      data-mascot-state={state}
    >
      <MascotPiece
        id="brainLeft"
        src={assets.brainLeft}
        state={state}
        reducedMotion={reducedMotion}
      />
      <MascotPiece
        id="brainRight"
        src={assets.brainRight}
        state={state}
        reducedMotion={reducedMotion}
      />
      <MascotPiece
        id="legLeft"
        src={assets.legLeft}
        state={state}
        reducedMotion={reducedMotion}
      />
      <MascotPiece
        id="legRight"
        src={assets.legRight}
        state={state}
        reducedMotion={reducedMotion}
      />
    </div>
  );
}
