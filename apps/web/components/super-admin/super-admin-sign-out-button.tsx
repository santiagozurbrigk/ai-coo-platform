"use client";

import { Tooltip, TooltipContent, TooltipTrigger } from "@ai-coo/ui";
import { signOutAction } from "@/app/auth/actions";
import { es } from "@/lib/locale/es";

export function SuperAdminSignOutButton({ collapsed }: { collapsed: boolean }) {
  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <form action={signOutAction} className="sidebar-item-slot">
            <button
              type="submit"
              className="sidebar-item sidebar-item-collapsed"
              aria-label={es.nav.signOut}
            >
              <span className="text-xs font-medium">↩</span>
            </button>
          </form>
        </TooltipTrigger>
        <TooltipContent side="right">{es.nav.signOut}</TooltipContent>
      </Tooltip>
    );
  }

  return (
    <form action={signOutAction}>
      <button
        type="submit"
        className="sidebar-item w-full text-left text-muted-foreground"
      >
        <span className="sidebar-item-label text-xs">{es.nav.signOut}</span>
      </button>
    </form>
  );
}
