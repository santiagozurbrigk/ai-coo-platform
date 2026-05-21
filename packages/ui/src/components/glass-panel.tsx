import * as React from "react";
import { cn } from "../lib/utils";

export interface GlassPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "strong";
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
        "rounded-xl",
        variant === "strong" ? "glass-strong" : "glass",
        glow && "glow-primary",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
