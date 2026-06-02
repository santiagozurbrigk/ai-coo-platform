import { paths } from "./paths";

export type NavItem = {
  label: string;
  href: string;
  icon?: string;
  badge?: number;
  children?: NavItem[];
};

/** Configuración — separada del menú principal, anclada al pie del sidebar. */
export const secondaryNavigation: NavItem[] = [
  { label: "Configuración", href: paths.platform.settings, icon: "settings" },
];

export const platformNavigation: NavItem[] = [
  {
    label: "Panel General",
    href: paths.platform.dashboard,
    icon: "layout-dashboard",
  },
  {
    label: "Finanzas",
    href: paths.platform.finance.root,
    icon: "wallet",
    children: [{ label: "Gastos", href: paths.platform.finance.expenses }],
  },
  {
    label: "Marketing",
    href: paths.platform.marketing.overview,
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
  {
    label: "Ventas",
    href: paths.platform.sales.inbox,
    icon: "message-square",
    children: [
      { label: "Bandeja", href: paths.platform.sales.inbox },
      { label: "Métricas", href: paths.platform.sales.metrics },
      { label: "Closing", href: paths.platform.sales.closing },
    ],
  },
  {
    label: "Operaciones",
    href: paths.platform.operations.overview,
    icon: "activity",
    children: [
      { label: "Overview", href: paths.platform.operations.overview },
      { label: "SOPs", href: paths.platform.operations.sops },
      { label: "Team Inputs", href: paths.platform.operations.teamInputs },
    ],
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
  { label: "Integraciones", href: paths.platform.integrations, icon: "plug" },
  {
    label: "Equipo",
    href: paths.platform.team.root,
    icon: "users",
  },
];

export const superAdminNavigation: NavItem[] = [
  { label: "Organizaciones", href: paths.superAdmin.organizations },
  { label: "Usuarios", href: paths.superAdmin.users },
  { label: "Profitability", href: paths.superAdmin.profitability },
  {
    label: "AI General Brain",
    href: paths.superAdmin.aiBrain.root,
    children: [
      { label: "Documentos", href: paths.superAdmin.aiBrain.library },
      { label: "Subir documento", href: paths.superAdmin.aiBrain.upload },
    ],
  },
  { label: "Infrastructure", href: paths.superAdmin.infrastructure },
  { label: "Salud de Clientes", href: paths.superAdmin.clientHealth },
];
