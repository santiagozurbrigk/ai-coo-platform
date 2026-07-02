export type SidebarChildItem = {
  label: string;
  href: string;
  icon?: string;
};

export type SidebarParentModule = {
  label: string;
  icon: string;
  children: SidebarChildItem[];
};

export type SidebarDirectModule = {
  label: string;
  href: string;
  icon: string;
  badge?: number;
  disabled?: boolean;
  comingSoonLabel?: string;
};

export type SidebarNavRootItem =
  | { type: "link"; module: SidebarDirectModule }
  | { type: "parent"; key: string }
  | { type: "divider" };

export type SidebarNavConfig = {
  modulesWithChildren: Record<string, SidebarParentModule>;
  rootItems: SidebarNavRootItem[];
  getParentFromPath: (pathname: string) => string | null;
};

export function isSidebarChildActive(href: string, pathname: string): boolean {
  if (pathname === href) return true;
  if (href !== "/" && pathname.startsWith(`${href}/`)) return true;
  return false;
}

export function isSidebarDirectActive(href: string, pathname: string): boolean {
  if (pathname === href) return true;
  if (href !== "/" && pathname.startsWith(`${href}/`)) return true;
  return false;
}
