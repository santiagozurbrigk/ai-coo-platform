"use client";

import * as React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useSpring, useTransform, type SpringOptions } from "framer-motion";
import { cn } from "../lib/utils";
import { usePrefersReducedMotion } from "../hooks/use-prefers-reduced-motion";

export type SpotlightProps = {
  className?: string;
  size?: number;
  springOptions?: SpringOptions;
};

/** Cursor-following spotlight (Motion Primitives pattern, brand-tinted). */
export function Spotlight({
  className,
  size = 200,
  springOptions = { bounce: 0, stiffness: 300, damping: 30 },
}: SpotlightProps) {
  const reducedMotion = usePrefersReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [parentElement, setParentElement] = useState<HTMLElement | null>(null);

  const mouseX = useSpring(0, springOptions);
  const mouseY = useSpring(0, springOptions);
  const spotlightLeft = useTransform(mouseX, (x) => `${x - size / 2}px`);
  const spotlightTop = useTransform(mouseY, (y) => `${y - size / 2}px`);

  useEffect(() => {
    if (containerRef.current?.parentElement) {
      const parent = containerRef.current.parentElement;
      parent.style.position = "relative";
      parent.style.overflow = "hidden";
      setParentElement(parent);
    }
  }, []);

  const handleMouseMove = useCallback(
    (event: globalThis.MouseEvent) => {
      if (!parentElement) return;
      const { left, top } = parentElement.getBoundingClientRect();
      mouseX.set(event.clientX - left);
      mouseY.set(event.clientY - top);
    },
    [mouseX, mouseY, parentElement]
  );

  useEffect(() => {
    if (!parentElement || reducedMotion) return;

    const abortController = new AbortController();
    const signal = abortController.signal;

    parentElement.addEventListener("mousemove", handleMouseMove, { signal });
    parentElement.addEventListener("mouseenter", () => setIsHovered(true), {
      signal,
    });
    parentElement.addEventListener("mouseleave", () => setIsHovered(false), {
      signal,
    });

    return () => abortController.abort();
  }, [parentElement, handleMouseMove, reducedMotion]);

  if (reducedMotion) return null;

  return (
    <motion.div
      ref={containerRef}
      className={cn(
        "pointer-events-none absolute rounded-full bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops),transparent_80%)] blur-xl transition-opacity duration-200",
        "from-primary/20 via-primary/10 to-transparent",
        isHovered ? "opacity-100" : "opacity-0",
        className
      )}
      style={{
        width: size,
        height: size,
        left: spotlightLeft,
        top: spotlightTop,
      }}
      aria-hidden
    />
  );
}
