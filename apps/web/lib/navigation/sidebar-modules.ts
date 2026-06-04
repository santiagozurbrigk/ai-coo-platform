import { paths } from "@/routes/paths";
import type {
  SidebarDirectModule,
  SidebarNavConfig,
  SidebarNavRootItem,
  SidebarParentModule,
} from "./sidebar-nav-config";

export const SIDEBAR_PARENT_KEYS = [
  "finanzas",
  "marketing",
  "ventas",
  "operaciones",
] as const;

export type SidebarParentKey = (typeof SIDEBAR_PARENT_KEYS)[number];

export const modulesWithChildren: Record<SidebarParentKey, SidebarParentModule> =
  {
    finanzas: {
      label: "Finanzas",
      icon: "wallet",
      children: [
        { label: "Overview", href: paths.platform.finance.root },
        { label: "Gastos", href: paths.platform.finance.expenses },
      ],
    },
    marketing: {
      label: "Marketing",
      icon: "megaphone",
      children: [
        { label: "Overview", href: paths.platform.marketing.overview },
        { label: "Contenido", href: paths.platform.marketing.content },
        {
          label: "Conexión con Ventas",
          href: paths.platform.marketing.salesConnection,
        },
        { label: "Formularios", href: paths.platform.marketing.forms },
      ],
    },
    ventas: {
      label: "Ventas",
      icon: "message-square",
      children: [
        { label: "Bandeja", href: paths.platform.sales.inbox },
        { label: "Métricas", href: paths.platform.sales.metrics },
        { label: "Closing", href: paths.platform.sales.closing },
      ],
    },
    operaciones: {
      label: "Operaciones",
      icon: "activity",
      children: [
        { label: "Overview", href: paths.platform.operations.overview },
        { label: "SOPs", href: paths.platform.operations.sops },
        { label: "Team Inputs", href: paths.platform.operations.teamInputs },
      ],
    },
  };

export const productDirectModule: SidebarDirectModule = {
  label: "Producto",
  href: paths.platform.product.root,
  icon: "layers",
};

export const directModules: SidebarDirectModule[] = [
  {
    label: "Panel General",
    href: paths.platform.dashboard,
    icon: "layout-dashboard",
  },
  {
    label: "Tablero de trabajo",
    href: paths.platform.workboard.root,
    icon: "kanban",
  },
  {
    label: "Agente de negocio",
    href: paths.platform.agent.root,
    icon: "sparkles",
  },
  {
    label: "Clientes",
    href: paths.platform.clients.root,
    icon: "briefcase",
  },
  {
    label: "Base de conocimiento",
    href: paths.platform.businessContext.documents,
    icon: "brain",
  },
  {
    label: "Integraciones",
    href: paths.platform.integrations,
    icon: "plug",
  },
  {
    label: "Equipo",
    href: paths.platform.team.root,
    icon: "users",
  },
];

const byHref = (href: string) =>
  directModules.find((m) => m.href === href) as SidebarDirectModule;

const platformRootItems: SidebarNavRootItem[] = [
  { type: "link", module: byHref(paths.platform.dashboard) },
  { type: "link", module: byHref(paths.platform.workboard.root) },
  { type: "link", module: byHref(paths.platform.agent.root) },
  { type: "link", module: byHref(paths.platform.clients.root) },
  { type: "link", module: byHref(paths.platform.businessContext.documents) },
  { type: "link", module: byHref(paths.platform.integrations) },
  { type: "link", module: byHref(paths.platform.team.root) },
  { type: "divider" },
  { type: "parent", key: "marketing" },
  { type: "parent", key: "ventas" },
  { type: "link", module: productDirectModule },
  { type: "parent", key: "operaciones" },
  { type: "parent", key: "finanzas" },
];

export function getParentFromPath(pathname: string): SidebarParentKey | null {
  if (pathname.startsWith(paths.platform.product.root)) return null;
  if (pathname.startsWith(paths.platform.finance.root)) return "finanzas";
  if (pathname.startsWith("/marketing")) return "marketing";
  if (pathname.startsWith("/sales")) return "ventas";
  if (pathname.startsWith("/operations")) return "operaciones";
  return null;
}

export const platformSidebarNav: SidebarNavConfig = {
  modulesWithChildren,
  getParentFromPath,
  rootItems: platformRootItems,
};

export {
  isSidebarChildActive,
  isSidebarDirectActive,
} from "./sidebar-nav-config";
