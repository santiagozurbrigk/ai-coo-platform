import {
  platformNavigation,
  superAdminNavigation,
  type NavItem,
} from "@/routes/navigation";
import { paths } from "@/routes/paths";
import { isPathActive } from "./active-path";

export type Breadcrumb = {
  label: string;
  href?: string;
};

function matchInTree(
  items: NavItem[],
  pathname: string,
  trail: Breadcrumb[]
): Breadcrumb[] | null {
  for (const item of items) {
    if (item.children?.length) {
      const child = item.children.find((c) => isPathActive(c.href, pathname));
      if (child) {
        return [
          ...trail,
          { label: item.label, href: item.href },
          { label: child.label },
        ];
      }
      if (isPathActive(item.href, pathname)) {
        return [...trail, { label: item.label }];
      }
    } else if (isPathActive(item.href, pathname)) {
      return [...trail, { label: item.label }];
    }
  }
  return null;
}

export function getBreadcrumbs(pathname: string): Breadcrumb[] {
  const root: Breadcrumb = { label: "Inicio", href: paths.platform.dashboard };

  if (pathname === paths.platform.dashboard) {
    return [root];
  }

  const platformMatch = matchInTree(platformNavigation, pathname, [root]);
  if (platformMatch) return platformMatch;

  if (pathname.startsWith("/executive-reports/") && pathname !== paths.platform.executiveReports.history) {
    return [
      root,
      { label: "Reportes ejecutivos", href: paths.platform.executiveReports.weekly },
      { label: "Detalle del reporte" },
    ];
  }

  if (pathname.startsWith("/sops/") && pathname !== paths.platform.sops.create) {
    return [
      root,
      { label: "SOPs", href: paths.platform.sops.library },
      { label: "Detalle del SOP" },
    ];
  }

  if (pathname.startsWith("/business-context/") && pathname !== paths.platform.businessContext.documents) {
    return [
      root,
      { label: "Contexto de negocio", href: paths.platform.businessContext.documents },
      { label: "Visor de contexto" },
    ];
  }

  if (pathname.startsWith(paths.founder.root)) {
    return [root, { label: "Área del fundador" }];
  }

  if (pathname.startsWith("/super-admin")) {
    const adminRoot = { label: "Super administración", href: paths.superAdmin.organizations };
    const match = matchInTree(superAdminNavigation, pathname, [adminRoot]);
    if (match) return match;
    return [adminRoot];
  }

  const segment = pathname.split("/").filter(Boolean).pop() ?? "Page";
  return [
    root,
    {
      label: segment.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    },
  ];
}
