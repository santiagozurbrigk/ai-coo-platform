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
        {
          label: "Overview",
          href: paths.platform.finance.root,
          permissionId: "finance",
        },
        {
          label: "Gastos",
          href: paths.platform.finance.expenses,
          permissionId: "expenses",
        },
      ],
    },
    marketing: {
      label: "Marketing",
      icon: "megaphone",
      permissionId: "marketing",
      children: [
        {
          label: "Overview",
          href: paths.platform.marketing.overview,
          permissionId: "marketing",
        },
        {
          label: "Contenido",
          href: paths.platform.marketing.content,
          permissionId: "marketing_content",
        },
        {
          label: "Anuncios",
          href: paths.platform.marketing.anuncios,
          permissionId: "marketing",
        },
        {
          label: "Administrar",
          href: paths.platform.marketing.administrar,
          permissionId: "marketing",
        },
        {
          label: "Conexión con Ventas",
          href: paths.platform.marketing.salesConnection,
          permissionId: "marketing_sales",
        },
        {
          label: "Formularios",
          href: paths.platform.marketing.forms,
          permissionId: "marketing_forms",
        },
        {
          label: "UTMs",
          href: paths.platform.marketing.utms,
          permissionId: "marketing",
        },
        {
          label: "Automatizaciones",
          href: paths.platform.marketing.automatizaciones,
          permissionId: "marketing",
        },
      ],
    },
    ventas: {
      label: "Ventas",
      icon: "message-square",
      children: [
        {
          label: "Bandeja",
          href: paths.platform.sales.inbox,
          permissionId: "sales_inbox",
        },
        {
          label: "Métricas",
          href: paths.platform.sales.metrics,
          permissionId: "sales_metrics",
        },
        {
          label: "Closing",
          href: paths.platform.sales.closing,
          permissionId: "closing",
        },
      ],
    },
    operaciones: {
      label: "Operaciones",
      icon: "activity",
      children: [
        {
          label: "Overview",
          href: paths.platform.operations.overview,
          permissionId: "operations_overview",
        },
        {
          label: "Inputs semanales",
          href: paths.platform.operations.weeklyInputs,
          permissionId: "operations_overview",
        },
        {
          label: "SOPs",
          href: paths.platform.operations.sops,
          permissionId: "operations_sops",
        },
        {
          label: "Team Inputs",
          href: paths.platform.operations.teamInputs,
          permissionId: "operations_team_inputs",
        },
        { label: "Inteligencia", href: paths.platform.intelligence.root },
        {
          label: "Reporte semanal",
          href: paths.platform.executiveReports.weekly,
        },
        {
          label: "Reporte mensual",
          href: paths.platform.executiveReports.monthly,
        },
        {
          label: "Historial reportes",
          href: paths.platform.executiveReports.history,
        },
        { label: "Área del fundador", href: paths.founder.root },
      ],
    },
  };

export const productDirectModule: SidebarDirectModule = {
  label: "Producto",
  href: paths.platform.product.root,
  icon: "layers",
};

export const lanzamientosDirectModule: SidebarDirectModule = {
  label: "Lanzamientos",
  href: paths.platform.lanzamientos,
  icon: "rocket",
  disabled: true,
  comingSoonLabel: "Próximamente",
};

export const directModules: SidebarDirectModule[] = [
  {
    label: "Panel General",
    href: paths.platform.dashboard,
    icon: "layout-dashboard",
    permissionId: "dashboard",
  },
  {
    label: "Tablero de trabajo",
    href: paths.platform.workboard.root,
    icon: "kanban",
    permissionId: "workboard",
  },
  {
    label: "Agente de negocio",
    href: paths.platform.agent.root,
    icon: "sparkles",
    permissionId: "agent",
  },
  {
    label: "Clientes",
    href: paths.platform.clients.root,
    icon: "briefcase",
    permissionId: "clients",
  },
  {
    label: "Base de conocimiento",
    href: paths.platform.businessContext.documents,
    icon: "brain",
    permissionId: "knowledge_base",
  },
  {
    label: "Integraciones",
    href: paths.platform.integrations,
    icon: "plug",
    permissionId: "integrations",
  },
  {
    label: "Equipo",
    href: paths.platform.team.root,
    icon: "users",
    permissionId: "team",
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
  { type: "link", module: lanzamientosDirectModule },
  { type: "parent", key: "operaciones" },
  { type: "parent", key: "finanzas" },
];

export function getParentFromPath(pathname: string): SidebarParentKey | null {
  if (pathname.startsWith(paths.platform.product.root)) return null;
  if (pathname.startsWith(paths.platform.lanzamientos)) return null;
  if (pathname.startsWith(paths.platform.finance.root)) return "finanzas";
  if (pathname.startsWith("/marketing")) return "marketing";
  if (pathname.startsWith(paths.platform.comentarios)) return "marketing";
  if (pathname.startsWith("/sales")) return "ventas";
  if (pathname.startsWith("/operations")) return "operaciones";
  if (pathname.startsWith("/intelligence")) return "operaciones";
  if (pathname.startsWith("/executive-reports")) return "operaciones";
  if (pathname.startsWith("/founder")) return "operaciones";
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
