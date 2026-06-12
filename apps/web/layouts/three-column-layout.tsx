import type { ReactNode } from "react";
import { cn } from "@ai-coo/ui";
import { MainContainerPanel } from "@/components/layout/main-container-panel";

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
    <div className={cn("app-shell relative", className)} data-layout="app-shell">
      <div className="app-ambient" aria-hidden="true" />
      <div
        className="relative z-[1] hidden h-full min-h-0 shrink-0 bg-[#0A0A0A] md:flex border-r border-white/[0.06]"
        data-slot="sidebar"
      >
        {sidebar}
      </div>

      <MainContainerPanel className="relative z-[1]">{children}</MainContainerPanel>

      {overlay}
    </div>
  );
}
