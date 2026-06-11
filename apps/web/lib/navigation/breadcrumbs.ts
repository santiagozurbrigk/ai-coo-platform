import type { NavItem } from "@/lib/navigation/nav-types";
import {
  platformNavigation,
  secondaryNavigation,
  superAdminNavigation,
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

  if (
    (pathname.startsWith("/operations/sops/") &&
      pathname !== paths.platform.operations.sops) ||
    (pathname.startsWith("/sops/") &&
      pathname !== paths.platform.sops.create &&
      pathname !== paths.platform.sops.root)
  ) {
    return [
      root,
      { label: "Operaciones", href: paths.platform.operations.overview },
      { label: "SOPs", href: paths.platform.operations.sops },
      { label: "Detalle del SOP" },
    ];
  }

  if (
    pathname.startsWith("/business-context/") &&
    pathname !== paths.platform.businessContext.documents
  ) {
    return [
      root,
      {
        label: "Base de conocimiento",
        href: paths.platform.businessContext.documents,
      },
      { label: "Visor de documento" },
    ];
  }

  if (pathname.startsWith("/marketing")) {
    const marketing = { label: "Marketing", href: paths.platform.marketing.overview };
    if (pathname.startsWith("/marketing/content/") && pathname !== "/marketing/content") {
      return [
        root,
        marketing,
        { label: "Contenido", href: paths.platform.marketing.content },
        { label: "Publicación" },
      ];
    }
    if (pathname === paths.platform.marketing.content) {
      return [root, marketing, { label: "Contenido" }];
    }
    if (pathname === paths.platform.marketing.salesConnection) {
      return [root, marketing, { label: "Conexión con Ventas" }];
    }
    return [root, marketing];
  }

  if (pathname.startsWith(paths.founder.root)) {
    return [root, { label: "Área del fundador" }];
  }

  if (pathname === paths.auth.login || pathname === paths.superAdmin.login) {
    return [{ label: pathname === paths.auth.login ? "Iniciar sesión" : "Super Admin" }];
  }

  if (pathname.startsWith("/super-admin") || pathname.startsWith("/superadmin/")) {
    const adminRoot = { label: "Super administración", href: paths.superAdmin.organizations };
    const brain = {
      label: "Cerebro de IA general",
      href: paths.superAdmin.aiBrain.root,
    };
    if (
      pathname.startsWith("/super-admin/ai-brain/") &&
      pathname !== paths.superAdmin.aiBrain.root &&
      pathname !== paths.superAdmin.aiBrain.library &&
      pathname !== paths.superAdmin.aiBrain.add
    ) {
      return [
        adminRoot,
        brain,
        { label: "Biblioteca de contenido", href: paths.superAdmin.aiBrain.library },
        { label: "Visor de documento" },
      ];
    }
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
