import { paths } from "@/routes/paths";
import type { SidebarNavConfig } from "./sidebar-nav-config";

export const SUPER_ADMIN_PARENT_KEYS = ["aiBrain"] as const;

export type SuperAdminParentKey = (typeof SUPER_ADMIN_PARENT_KEYS)[number];

const modulesWithChildren = {
  aiBrain: {
    label: "Cerebro de IA general",
    icon: "brain",
    children: [
      { label: "Documentos", href: paths.superAdmin.aiBrain.library },
      { label: "Subir documento", href: paths.superAdmin.aiBrain.upload },
    ],
  },
} satisfies Record<SuperAdminParentKey, { label: string; icon: string; children: { label: string; href: string }[] }>;

export function getSuperAdminParentFromPath(
  pathname: string
): SuperAdminParentKey | null {
  if (pathname.startsWith(paths.superAdmin.aiBrain.root)) return "aiBrain";
  return null;
}

export const superAdminSidebarNav: SidebarNavConfig = {
  modulesWithChildren,
  getParentFromPath: getSuperAdminParentFromPath,
  rootItems: [
    {
      type: "link",
      module: {
        label: "Holding",
        href: paths.superAdmin.holding,
        icon: "layers",
      },
    },
    {
      type: "link",
      module: {
        label: "Organizaciones",
        href: paths.superAdmin.organizations,
        icon: "shield",
      },
    },
    {
      type: "link",
      module: {
        label: "Usuarios",
        href: paths.superAdmin.users,
        icon: "users",
      },
    },
    {
      type: "link",
      module: {
        label: "Waitlist",
        href: paths.superAdmin.waitlist,
        icon: "users",
      },
    },
    {
      type: "link",
      module: {
        label: "Pruebas gratis",
        href: paths.superAdmin.trials,
        icon: "calendar-check",
      },
    },
    {
      type: "link",
      module: {
        label: "Costos de IA",
        href: paths.superAdmin.costs,
        icon: "file-bar-chart",
      },
    },
    { type: "parent", key: "aiBrain" },
    {
      type: "link",
      module: {
        label: "Infraestructura",
        href: paths.superAdmin.infrastructure,
        icon: "activity",
      },
    },
    {
      type: "link",
      module: {
        label: "Salud de Clientes",
        href: paths.superAdmin.clientHealth,
        icon: "crown",
      },
    },
    {
      type: "link",
      module: {
        label: "Onboarding",
        href: paths.superAdmin.onboarding,
        icon: "rocket",
      },
    },
  ],
};
