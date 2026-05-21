"use client";

import { ChevronDown, Layers } from "lucide-react";
import { Button } from "@ai-coo/ui";
import { useWorkspace } from "@/providers/workspace-provider";

export function WorkspaceSwitcher() {
  const workspace = useWorkspace();

  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-9 w-full justify-between px-2.5 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-active"
      type="button"
      aria-label="Espacio de trabajo"
    >
      <span className="flex items-center gap-2 truncate">
        <Layers className="h-4 w-4 shrink-0 opacity-70" />
        <span className="truncate text-sm">{workspace.name}</span>
      </span>
      <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-50" />
    </Button>
  );
}
