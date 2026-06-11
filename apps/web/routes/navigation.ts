import { buildPlatformNavigation } from "@/lib/navigation/build-platform-navigation";
import type { NavItem } from "@/lib/navigation/nav-types";
import { paths } from "./paths";

export type { NavItem } from "@/lib/navigation/nav-types";

/** Configuración — separada del menú principal, anclada al pie del sidebar. */
export const secondaryNavigation: NavItem[] = [
  { label: "Configuración", href: paths.platform.settings, icon: "settings" },
];

/** Sincronizado con `platformSidebarNav` (sidebar + command palette). */
export const platformNavigation: NavItem[] = buildPlatformNavigation();

export const superAdminNavigation: NavItem[] = [
  { label: "Organizaciones", href: paths.superAdmin.organizations },
  { label: "Usuarios", href: paths.superAdmin.users },
  { label: "Costos de IA", href: paths.superAdmin.costs },
  {
    label: "Cerebro de IA general",
    href: paths.superAdmin.aiBrain.root,
    children: [
      { label: "Documentos", href: paths.superAdmin.aiBrain.library },
      { label: "Subir documento", href: paths.superAdmin.aiBrain.upload },
    ],
  },
  { label: "Infraestructura", href: paths.superAdmin.infrastructure },
  { label: "Salud de clientes", href: paths.superAdmin.clientHealth },
];
