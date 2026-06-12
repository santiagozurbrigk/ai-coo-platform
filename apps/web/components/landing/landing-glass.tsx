import type { ElementType, ReactNode } from "react";
import { cn } from "@ai-coo/ui";

type LandingGlassProps = {
  children: ReactNode;
  className?: string;
  as?: ElementType;
};

export function LandingGlass({
  children,
  className,
  as: Component = "div",
}: LandingGlassProps) {
  return (
    <Component
      className={cn("landing-glass", className)}
    >
      {children}
    </Component>
  );
}
