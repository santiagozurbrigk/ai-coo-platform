import { paths } from "./paths";

export type NavItem = {
  label: string;
  href: string;
  icon?: string;
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
    label: "Clientes",
    href: paths.platform.clients.root,
    icon: "briefcase",
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
  { label: "Fundadores", href: paths.superAdmin.founders },
  { label: "Cuentas de equipo", href: paths.superAdmin.teamAccounts },
  { label: "Uso de IA", href: paths.superAdmin.aiUsage },
  { label: "Seguimiento de costos", href: paths.superAdmin.costTracking },
  { label: "Rentabilidad", href: paths.superAdmin.profitability },
  {
    label: "Cerebro de IA general",
    href: paths.superAdmin.aiBrain.root,
    children: [
      { label: "Panel", href: paths.superAdmin.aiBrain.root },
      { label: "Biblioteca de contenido", href: paths.superAdmin.aiBrain.library },
      { label: "Añadir contenido", href: paths.superAdmin.aiBrain.add },
    ],
  },
];
