"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { usePrefersReducedMotion } from "../hooks/use-prefers-reduced-motion";

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.02,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.2, ease: [0.25, 0.1, 0.25, 1] as const },
  },
};

type StaggerContainerTag = "div" | "ul" | "tbody";

export type StaggerFadeProps = {
  as?: StaggerContainerTag;
  className?: string;
  children: React.ReactNode;
};

export function StaggerFade({
  className,
  children,
  as = "div",
}: StaggerFadeProps) {
  const reducedMotion = usePrefersReducedMotion();

  if (reducedMotion) {
    if (as === "ul") return <ul className={className}>{children}</ul>;
    if (as === "tbody") return <tbody className={className}>{children}</tbody>;
    return <div className={className}>{children}</div>;
  }

  if (as === "ul") {
    return (
      <motion.ul
        className={className}
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {children}
      </motion.ul>
    );
  }

  if (as === "tbody") {
    return (
      <motion.tbody
        className={className}
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {children}
      </motion.tbody>
    );
  }

  return (
    <motion.div
      className={className}
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {children}
    </motion.div>
  );
}

type StaggerItemTag = "div" | "li" | "tr";

export type StaggerFadeItemProps = {
  as?: StaggerItemTag;
  className?: string;
  children: React.ReactNode;
  /** Para filas y tarjetas que abren algo al tocarlas. */
  onClick?: React.MouseEventHandler<HTMLElement>;
};

export function StaggerFadeItem({
  className,
  children,
  as = "div",
  onClick,
}: StaggerFadeItemProps) {
  const reducedMotion = usePrefersReducedMotion();

  if (reducedMotion) {
    if (as === "li") return <li className={className} onClick={onClick}>{children}</li>;
    if (as === "tr") return <tr className={className} onClick={onClick}>{children}</tr>;
    return <div className={className} onClick={onClick}>{children}</div>;
  }

  if (as === "li") {
    return (
      <motion.li className={className} variants={itemVariants} onClick={onClick}>
        {children}
      </motion.li>
    );
  }

  if (as === "tr") {
    return (
      <motion.tr className={className} variants={itemVariants} onClick={onClick}>
        {children}
      </motion.tr>
    );
  }

  return (
    <motion.div className={className} variants={itemVariants} onClick={onClick}>
      {children}
    </motion.div>
  );
}
