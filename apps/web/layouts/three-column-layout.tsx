import type { ReactNode } from "react";
import { cn } from "@ai-coo/ui";

/**
 * Shell flotante: sidebar sobre el fondo + panel principal redondeado.
 */
export function ThreeColumnLayout({
  sidebar,
  children,
  overlay,
  className,
}: {
  sidebar: ReactNode;
  children: ReactNode;
  overlay?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("app-shell", className)} data-layout="app-shell">
      <div className="flex h-full min-h-0 shrink-0 md:flex" data-slot="sidebar">
        {sidebar}
      </div>

      <div className="main-container" data-slot="main-panel">
        {children}
      </div>

      {overlay}
    </div>
  );
}
