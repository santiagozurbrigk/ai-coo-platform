import { paths } from "@/routes";

export type DemoTourStep = {
  id: string;
  order: number;
  title: string;
  description: string;
  duration: string;
  href: string;
  highlight?: string;
};

/** Recorrido recomendado para demos y validación */
export const DEMO_TOUR_STEPS: DemoTourStep[] = [
  {
    id: "dashboard",
    order: 1,
    title: "Panel General",
    description:
      "Resumen operativo: métricas, riesgos, oportunidades y recomendación de IA. Enlaces «Qué hacer ahora».",
    duration: "~2 min",
    href: paths.platform.dashboard,
    highlight: "Métricas primero · Ctrl+K",
  },
  {
    id: "finance",
    order: 2,
    title: "Finanzas",
    description:
      "Facturación, cash collected, por cobrar, plataformas de pago y gráficos financieros (mock).",
    duration: "~3 min",
    href: paths.platform.finance.root,
    highlight: "Plataformas · 7 gráficos",
  },
  {
    id: "marketing",
    order: 3,
    title: "Marketing",
    description:
      "Instagram → contenido → conversaciones y ventas atribuidas. Conexión con Ventas muestra journeys de compra.",
    duration: "~3 min",
    href: paths.platform.marketing.overview,
    highlight: "Overview · Contenido · Ventas",
  },
  {
    id: "sales",
    order: 4,
    title: "Bandeja de ventas",
    description:
      "Conversaciones, etiquetas, análisis IA y recorrido de contenido por lead debajo del chat.",
    duration: "~2 min",
    href: paths.platform.sales.inbox,
    highlight: "Tags · Journey inline",
  },
  {
    id: "closing",
    order: 5,
    title: "Closing",
    description:
      "Calendario/lista de cierres. Marcar cerrada abre modal de pago → crea cliente y atribuye closer.",
    duration: "~2 min",
    href: paths.platform.sales.closing,
    highlight: "Modal pago · Plataformas",
  },
  {
    id: "clients",
    order: 6,
    title: "Clientes",
    description:
      "Perfiles post-cierre: pagos, cuotas, Fathom e insights IA.",
    duration: "~1 min",
    href: paths.platform.clients.root,
    highlight: "Sync desde Closing",
  },
  {
    id: "operations",
    order: 7,
    title: "Team Inputs",
    description:
      "Contexto semanal para la IA con niveles de importancia. Toast al enviar.",
    duration: "~1 min",
    href: paths.platform.operations.teamInputs,
    highlight: "🔴🟡⚪ importancia",
  },
  {
    id: "integrations",
    order: 8,
    title: "Integraciones",
    description:
      "Instagram (via Make), ManyChat, Calendly y más. Conectar es simulado (toast).",
    duration: "~1 min",
    href: paths.platform.integrations,
    highlight: "Instagram → Marketing",
  },
];

export type DemoModuleCheck = {
  id: string;
  label: string;
  href: string;
  group: string;
};

export const DEMO_MODULE_CHECKLIST: DemoModuleCheck[] = [
  { id: "m1", group: "Operación", label: "Panel General", href: paths.platform.dashboard },
  { id: "m2", group: "Finanzas", label: "Finanzas", href: paths.platform.finance.root },
  { id: "m2b", group: "Finanzas", label: "Gastos", href: paths.platform.finance.expenses },
  { id: "m3", group: "Marketing", label: "Marketing", href: paths.platform.marketing.overview },
  { id: "m4", group: "Ventas", label: "Bandeja", href: paths.platform.sales.inbox },
  { id: "m4b", group: "Ventas", label: "Métricas + closers", href: paths.platform.sales.metrics },
  { id: "m4c", group: "Ventas", label: "Closing", href: paths.platform.sales.closing },
  { id: "m5", group: "Ventas", label: "Clientes", href: paths.platform.clients.root },
  { id: "m6", group: "Operación", label: "Operaciones", href: paths.platform.operations.overview },
  { id: "m7", group: "Operación", label: "SOPs", href: paths.platform.operations.sops },
  { id: "m8", group: "Operación", label: "Team Inputs", href: paths.platform.operations.teamInputs },
  { id: "m9", group: "Operación", label: "Base de conocimiento", href: paths.platform.businessContext.documents },
  { id: "m10", group: "Plataforma", label: "Integraciones", href: paths.platform.integrations },
  { id: "m11", group: "Plataforma", label: "Equipo", href: paths.platform.team.root },
  { id: "m12", group: "Plataforma", label: "Configuración", href: paths.platform.settings },
  { id: "m13", group: "Referencia", label: "Sistema de diseño", href: paths.designSystem },
];
