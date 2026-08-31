"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";
import { Search, Settings } from "lucide-react";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@ai-coo/ui";
import Link from "next/link";
import { AppLogo } from "@/components/brand";
import { NavIcon } from "@/components/navigation/nav-icons";
import { ThemeToggle } from "@/components/navigation/theme-toggle";
import { ReportsPanel } from "@/components/executive-reports/reports-panel";
import { MobileNav } from "@/components/layout/mobile-nav";
import { HoldingBusinessSwitcher } from "@/components/holding/holding-business-switcher";
import { useCommandPalette } from "@/providers/command-palette-provider";
import {
  buildPlatformSidebarNav,
  isSidebarDirectActive,
  isSidebarChildActive,
} from "@/lib/navigation/sidebar-modules";
import type { PermissionModuleId } from "@/constants/permission-modules";
import {
  canSeeNavItem,
  useEnabledAddOns,
  usePermissions,
} from "@/providers/permissions-provider";
import { es } from "@/lib/locale/es";
import { NotchNav, type NotchNavItem } from "./notch-nav";

/**
 * Adaptador de la NotchNav a la plataforma.
 *
 * La única fuente de verdad de navegación sigue siendo
 * `lib/navigation/sidebar-modules.ts`: los items, permisos, add-ons y estado
 * activo salen del mismo config que consume el sidebar. Cambiar un módulo ahí
 * actualiza las dos navegaciones.
 *
 * Diferencias deliberadas con el sidebar:
 * - "Configuración" no va en la isla central: vive en la isla derecha como
 *   engranaje, para no ensanchar la barra.
 * - Los módulos con hijos se abren como dropdown en lugar de subnivel.
 */
export function PlatformNotchNav({ showItems = true }: { showItems?: boolean }) {
  const pathname = usePathname();
  const enabledAddOns = useEnabledAddOns();
  const { isFounder, modules } = usePermissions();
  const { setOpen } = useCommandPalette();

  const checkAccess = (moduleId: PermissionModuleId) =>
    isFounder || (modules[moduleId] ?? "none") !== "none";

  const config = useMemo(
    () => buildPlatformSidebarNav(enabledAddOns),
    [enabledAddOns]
  );
  const activeParent = config.getParentFromPath(pathname);

  const items: NotchNavItem[] = useMemo(() => {
    if (!showItems) return [];
    const result: NotchNavItem[] = [];

    for (const item of config.rootItems) {
      if (item.type === "divider") continue;

      if (item.type === "link") {
        const m = item.module;
        if (!canSeeNavItem(m.permissionId, checkAccess, isFounder)) continue;
        if (m.disabled) continue;
        result.push({
          type: "link",
          id: m.href,
          label: m.label,
          icon: <NavIcon name={m.icon} className="h-4 w-4" />,
          href: m.href,
          active: isSidebarDirectActive(m.href, pathname),
        });
        continue;
      }

      // Configuración vive en la isla derecha
      if (item.key === "configuracion") continue;

      const parent = config.modulesWithChildren[item.key];
      if (!parent) continue;
      const children = parent.children.filter(
        (c) => !c.hidden && canSeeNavItem(c.permissionId, checkAccess, isFounder)
      );
      if (children.length === 0) continue;

      result.push({
        type: "menu",
        id: item.key,
        label: parent.label,
        icon: <NavIcon name={parent.icon} className="h-4 w-4" />,
        active: activeParent === item.key,
        children: children.map((c) => ({
          label: c.label,
          href: c.href,
          active: isSidebarChildActive(c.href, pathname),
        })),
      });
    }

    return result;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config, pathname, activeParent, isFounder, modules, showItems]);

  const configModule = config.modulesWithChildren.configuracion;
  const configChildren = (configModule?.children ?? []).filter(
    (c) => !c.hidden && canSeeNavItem(c.permissionId, checkAccess, isFounder)
  );

  const rightContent = (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground"
        onClick={() => setOpen(true)}
        aria-label={es.common.openPalette}
        title={es.common.search}
      >
        <Search className="h-4 w-4" />
      </Button>
      <HoldingBusinessSwitcher />
      {configChildren.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground"
              aria-label={configModule.label}
              title={configModule.label}
            >
              <Settings className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" sideOffset={10}>
            {configChildren.map((c) => (
              <DropdownMenuItem key={c.href} asChild>
                <Link href={c.href}>{c.label}</Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
      {/* Mismo criterio que la topbar clásica: los reportes se leen y se cierran. */}
      <ReportsPanel />
      <ThemeToggle />
    </>
  );

  return (
    <NotchNav
      items={items}
      logo={<AppLogo display="compact" height={16} />}
      rightContent={rightContent}
      mobileContent={
        <>
          <MobileNav />
          <AppLogo display="compact" height={14} />
          <ThemeToggle />
        </>
      }
    />
  );
}
