"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Button, Dialog, DialogContent, DialogTitle } from "@ai-coo/ui";
import { platformNavigation, secondaryNavigation } from "@/routes/navigation";
import { useSidebarExpanded } from "@/hooks/use-sidebar-expanded";
import { NavGroup } from "@/components/navigation/nav-group";
import { isPathActive } from "@/lib/navigation/active-path";
import { NavIcon } from "@/components/navigation/nav-icons";
import { AppLogo } from "@/components/brand";
import { cn } from "@ai-coo/ui";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { isExpanded, toggle } = useSidebarExpanded(pathname, platformNavigation);

  const close = () => setOpen(false);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Abrir menú"
      >
        <Menu className="h-5 w-5" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="left-0 top-0 flex h-full max-h-full w-[min(100%,280px)] max-w-[280px] flex-col translate-x-0 translate-y-0 rounded-none border-r p-0">
          <DialogTitle className="relative flex min-h-[72px] items-center justify-center border-b border-border px-3 py-3">
            <AppLogo display="sidebar" className="max-w-[220px]" />
            <Button
              variant="ghost"
              size="icon"
              type="button"
              className="absolute right-2 top-1/2 -translate-y-1/2"
              onClick={close}
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>

          <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
            {platformNavigation.map((item) => (
              <div key={item.href} onClick={(e) => {
                const target = e.target as HTMLElement;
                if (target.closest("a")) close();
              }}>
                <NavGroup
                  item={item}
                  pathname={pathname}
                  isExpanded={isExpanded(item.href)}
                  onToggle={() => toggle(item.href)}
                />
              </div>
            ))}
          </nav>

          {secondaryNavigation.length > 0 && (
          <div className="border-t border-border p-3 space-y-1">
            {secondaryNavigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={close}
                className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-2 text-sm",
                  isPathActive(item.href, pathname)
                    ? "bg-muted font-medium"
                    : "text-muted-foreground hover:bg-muted/60"
                )}
              >
                {item.icon && <NavIcon name={item.icon} />}
                {item.label}
              </Link>
            ))}
          </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
