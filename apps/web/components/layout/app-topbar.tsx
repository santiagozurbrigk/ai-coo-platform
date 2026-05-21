"use client";

import Link from "next/link";
import { Bell, Search } from "lucide-react";
import { usePathname } from "next/navigation";
import { useCommandPalette } from "@/providers/command-palette-provider";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Input,
  Topbar,
} from "@ai-coo/ui";
import { es } from "@/lib/locale/es";
import { getPageMeta } from "@/lib/navigation/page-meta";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Breadcrumbs } from "@/components/navigation/breadcrumbs";
import { paths } from "@/routes";
import { secondaryNavigation } from "@/routes/navigation";

export function AppTopbar() {
  const pathname = usePathname();
  const { title, subtitle } = getPageMeta(pathname);
  const { setOpen } = useCommandPalette();

  return (
    <Topbar
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
            className="h-8 border-transparent bg-muted/40 pl-9 focus-visible:bg-background cursor-pointer"
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
          <Button variant="ghost" size="icon" className="relative" type="button" aria-label="Notificaciones">
            <Bell className="h-4 w-4" />
            <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-primary" />
          </Button>
          <AccountMenu />
        </>
      }
    />
  );
}

function AccountMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary/80 to-ai text-xs font-medium text-primary-foreground ring-2 ring-transparent transition-shadow hover:ring-primary/30"
          aria-label="Menú de cuenta"
        >
          F
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem asChild>
          <Link href={paths.platform.settings}>{es.nav.settings}</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {secondaryNavigation.map((item) => (
          <DropdownMenuItem key={item.href} asChild>
            <Link href={item.href}>{item.label}</Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
