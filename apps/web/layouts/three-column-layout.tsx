import type { ReactNode } from "react";
import { cn } from "@ai-coo/ui";

/**
 * Shell flotante: sidebar sobre el fondo + panel principal redondeado.
 */
export function ThreeColumnLayout({
  sidebar,
  children,
  className,
}: {
  sidebar: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("app-shell", className)} data-layout="app-shell">
      <div className="hidden h-screen shrink-0 md:flex" data-slot="sidebar">
        {sidebar}
      </div>

      <div className="main-container relative" data-slot="main-panel">
        {children}
      </div>
    </div>
  );
}
