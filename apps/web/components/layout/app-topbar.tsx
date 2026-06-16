"use client";

import { Bell, Search } from "lucide-react";
import { usePathname } from "next/navigation";
import { useCommandPalette } from "@/providers/command-palette-provider";
import { Button, Input, Topbar } from "@ai-coo/ui";
import { es } from "@/lib/locale/es";
import { getPageMeta } from "@/lib/navigation/page-meta";
import { MobileNav } from "@/components/layout/mobile-nav";
import { ThemeToggle } from "@/components/navigation/theme-toggle";
import { Breadcrumbs } from "@/components/navigation/breadcrumbs";
import { HoldingBusinessSwitcher } from "@/components/holding/holding-business-switcher";

export function AppTopbar({ className }: { className?: string }) {
  const pathname = usePathname();
  const { title, subtitle } = getPageMeta(pathname);
  const { setOpen } = useCommandPalette();

  return (
    <Topbar
      className={className}
      breadcrumbs={
        <div className="flex min-w-0 items-center gap-3">
          <MobileNav />
          <Breadcrumbs className="hidden min-w-0 md:flex" />
        </div>
      }
      title={title}
      subtitle={subtitle}
      search={
        <div className="relative hidden w-full max-w-md lg:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="h-8 cursor-pointer border-transparent bg-muted/40 pl-9 focus-visible:bg-background"
            placeholder={es.common.search}
            readOnly
            onFocus={() => setOpen(true)}
            onClick={() => setOpen(true)}
            aria-label={es.common.openPalette}
          />
        </div>
      }
      actions={
        <>
          <HoldingBusinessSwitcher />
          <Button
            variant="outline"
            size="icon"
            className="topbar-icon h-8 w-8 rounded-lg"
            type="button"
            disabled
            title="Notificaciones — próximamente"
            aria-label="Notificaciones — próximamente"
          >
            <Bell className="h-4 w-4" />
          </Button>
          <ThemeToggle />
        </>
      }
    />
  );
}
