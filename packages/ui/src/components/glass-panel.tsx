import * as React from "react";
import { cn } from "../lib/utils";

export interface GlassPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "strong" | "nested";
  glow?: boolean;
}

export function GlassPanel({
  className,
  variant = "default",
  glow = false,
  children,
  ...props
}: GlassPanelProps) {
  return (
    <div
      className={cn(
        "transition-all duration-150 ease-out hover:-translate-y-px",
        variant === "strong" && "glass-strong",
        variant === "nested" && "glass-nested",
        variant === "default" && "glass",
        glow && "glow-primary",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
