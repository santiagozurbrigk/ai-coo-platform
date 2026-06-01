"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Sparkles, X } from "lucide-react";
import { cn } from "@ai-coo/ui";
import { useContextInsightRead } from "@/hooks/use-context-insight-read";
import { ContextPanel } from "./context-panel";

export function ContextPanelDrawer() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { hasUnread, markRead } = useContextInsightRead(pathname);

  const handleOpen = () => {
    setOpen(true);
    markRead();
  };

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        aria-label="Abrir panel de contexto"
        aria-expanded={open}
        className={cn(
          "context-panel-trigger relative fixed z-40 flex h-9 w-9 items-center justify-center rounded-[10px] transition-colors",
          "border border-violet-200 bg-violet-50 text-violet-700",
          "dark:border-[rgba(124,58,237,0.25)] dark:bg-[rgba(124,58,237,0.15)] dark:text-[#A78BFA]"
        )}
        style={{ right: 24, top: "50%", transform: "translateY(-50%)" }}
      >
        <Sparkles className="h-4 w-4" />
        {hasUnread ? (
          <span
            className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-violet-500"
            aria-hidden
          />
        ) : null}
      </button>

      {open ? (
        <button
          type="button"
          className="context-panel-backdrop fixed inset-0 z-[45] cursor-default"
          aria-label="Cerrar panel de contexto"
          onClick={() => setOpen(false)}
        />
      ) : null}

      <aside
        className={cn("context-panel-overlay", !open && "closed")}
        aria-hidden={!open}
      >
        <div className="mb-4 flex items-center justify-between gap-2">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Contexto
          </span>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Cerrar"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <ContextPanel embedded />
      </aside>
    </>
  );
}
