import { paths } from "./paths";

export type NavItem = {
  label: string;
  href: string;
  icon?: string;
  children?: NavItem[];
};

export const secondaryNavigation: NavItem[] = [
  { label: "Área del fundador", href: paths.founder.root, icon: "crown" },
  {
    label: "Super administración",
    href: paths.superAdmin.organizations,
    icon: "shield",
  },
];

export const platformNavigation: NavItem[] = [
  { label: "Panel", href: paths.platform.dashboard, icon: "layout-dashboard" },
  {
    label: "Ventas",
    href: paths.platform.sales.inbox,
    icon: "message-square",
    children: [
      { label: "Bandeja", href: paths.platform.sales.inbox },
      { label: "Métricas", href: paths.platform.sales.metrics },
    ],
  },
  {
    label: "Operaciones",
    href: paths.platform.operations.weeklyInputs,
    icon: "activity",
    children: [
      { label: "Inputs semanales", href: paths.platform.operations.weeklyInputs },
    ],
  },
  {
    label: "Reportes ejecutivos",
    href: paths.platform.executiveReports.weekly,
    icon: "file-bar-chart",
    children: [
      { label: "Semanal", href: paths.platform.executiveReports.weekly },
      { label: "Mensual", href: paths.platform.executiveReports.monthly },
      { label: "Historial", href: paths.platform.executiveReports.history },
    ],
  },
  {
    label: "SOPs",
    href: paths.platform.sops.library,
    icon: "book-open",
    children: [
      { label: "Biblioteca", href: paths.platform.sops.library },
      { label: "Crear SOP", href: paths.platform.sops.create },
    ],
  },
  {
    label: "Contexto de negocio",
    href: paths.platform.businessContext.documents,
    icon: "brain",
    children: [
      { label: "Documentos", href: paths.platform.businessContext.documents },
    ],
  },
  {
    label: "Inteligencia",
    href: paths.platform.intelligence.insights,
    icon: "sparkles",
    children: [
      { label: "Insights", href: paths.platform.intelligence.insights },
      { label: "Recomendaciones", href: paths.platform.intelligence.recommendations },
      { label: "Cuellos de botella", href: paths.platform.intelligence.bottlenecks },
      { label: "Oportunidades", href: paths.platform.intelligence.opportunities },
      { label: "Memoria IA", href: paths.platform.intelligence.aiMemory },
    ],
  },
  { label: "Integraciones", href: paths.platform.integrations, icon: "plug" },
  {
    label: "Equipo",
    href: paths.platform.team.members,
    icon: "users",
    children: [
      { label: "Miembros", href: paths.platform.team.members },
      { label: "Roles", href: paths.platform.team.roles },
    ],
  },
  { label: "Configuración", href: paths.platform.settings, icon: "settings" },
];

export const superAdminNavigation: NavItem[] = [
  { label: "Organizaciones", href: paths.superAdmin.organizations },
  { label: "Fundadores", href: paths.superAdmin.founders },
  { label: "Cuentas de equipo", href: paths.superAdmin.teamAccounts },
  { label: "Uso de IA", href: paths.superAdmin.aiUsage },
  { label: "Seguimiento de costos", href: paths.superAdmin.costTracking },
  { label: "Rentabilidad", href: paths.superAdmin.profitability },
];
