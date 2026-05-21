import type { ReactNode } from "react";
import { cn } from "@ai-coo/ui";

/**
 * Three-column layout per UI_UX_SPEC: sidebar | content | context panel.
 */
export function ThreeColumnLayout({
  sidebar,
  children,
  contextPanel,
  className,
}: {
  sidebar: ReactNode;
  children: ReactNode;
  contextPanel?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn("flex h-screen w-full overflow-hidden bg-background", className)}
      data-layout="three-column"
    >
      <div className="hidden h-full shrink-0 md:flex" data-slot="sidebar">
        {sidebar}
      </div>

      <div
        className="flex min-h-0 min-w-0 flex-1 flex-col"
        data-slot="main"
      >
        {children}
      </div>

      {contextPanel ? (
        <aside
          className="hidden h-full w-[300px] shrink-0 border-l border-border bg-card/30 xl:flex"
          data-slot="context-panel"
        >
          {contextPanel}
        </aside>
      ) : null}
    </div>
  );
}
