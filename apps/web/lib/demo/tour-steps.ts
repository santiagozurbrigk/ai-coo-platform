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

/** Recorrido recomendado para demos y validación (Fase 0.8) */
export const DEMO_TOUR_STEPS: DemoTourStep[] = [
  {
    id: "dashboard",
    order: 1,
    title: "Panel ejecutivo",
    description:
      "Resumen en 30 segundos: riesgos, oportunidades, métricas y recomendación de IA. Prueba los enlaces y «Qué hacer ahora».",
    duration: "~2 min",
    href: paths.platform.dashboard,
    highlight: "Riesgos clicables · Ctrl+K",
  },
  {
    id: "sales",
    order: 2,
    title: "Bandeja de ventas",
    description:
      "Lista de conversaciones, hilo de mensajes y panel de análisis (fantasma, agendamiento, insights).",
    duration: "~2 min",
    href: paths.platform.sales.inbox,
    highlight: "Layout 3 columnas",
  },
  {
    id: "weekly",
    order: 3,
    title: "Input semanal",
    description:
      "Envío de contexto en menos de 2 minutos. Al enviar verás toast y navegación al reporte ejecutivo.",
    duration: "~1 min",
    href: paths.platform.operations.weeklyInputs,
    highlight: "Flujo interactivo mock",
  },
  {
    id: "report",
    order: 4,
    title: "Reporte ejecutivo",
    description:
      "Inteligencia por departamento: riesgos, cuellos de botella y recomendaciones generadas por IA.",
    duration: "~2 min",
    href: paths.platform.executiveReports.detail("er1"),
    highlight: "Vista fundador",
  },
  {
    id: "sops",
    order: 5,
    title: "SOPs + generador",
    description:
      "Biblioteca de sistemas operativos vivos. Genera un SOP y revisa el borrador resultante.",
    duration: "~2 min",
    href: paths.platform.sops.create,
    highlight: "Generar SOP → sop4",
  },
  {
    id: "intelligence",
    order: 6,
    title: "Inteligencia operativa",
    description:
      "Insights, recomendaciones con CTA, cuellos de botella y memoria organizacional enlazada.",
    duration: "~2 min",
    href: paths.platform.intelligence.insights,
    highlight: "Navegación cruzada",
  },
  {
    id: "integrations",
    order: 7,
    title: "Integraciones",
    description:
      "Conecta una fuente (modal simulado) y observa el estado sincronizando → conectado.",
    duration: "~1 min",
    href: paths.platform.integrations,
    highlight: "Toast + estados",
  },
];

export type DemoModuleCheck = {
  id: string;
  label: string;
  href: string;
  group: string;
};

export const DEMO_MODULE_CHECKLIST: DemoModuleCheck[] = [
  { id: "m1", group: "Operación", label: "Panel", href: paths.platform.dashboard },
  { id: "m2", group: "Operación", label: "Ventas (bandeja + métricas)", href: paths.platform.sales.inbox },
  { id: "m3", group: "Operación", label: "Inputs semanales", href: paths.platform.operations.weeklyInputs },
  { id: "m4", group: "Operación", label: "Reportes ejecutivos", href: paths.platform.executiveReports.weekly },
  { id: "m5", group: "Operación", label: "Biblioteca SOPs", href: paths.platform.sops.library },
  { id: "m6", group: "Operación", label: "Contexto de negocio", href: paths.platform.businessContext.documents },
  { id: "m7", group: "Inteligencia", label: "Insights", href: paths.platform.intelligence.insights },
  { id: "m8", group: "Inteligencia", label: "Recomendaciones", href: paths.platform.intelligence.recommendations },
  { id: "m9", group: "Inteligencia", label: "Cuellos de botella", href: paths.platform.intelligence.bottlenecks },
  { id: "m10", group: "Inteligencia", label: "Memoria IA", href: paths.platform.intelligence.aiMemory },
  { id: "m11", group: "Plataforma", label: "Integraciones", href: paths.platform.integrations },
  { id: "m12", group: "Plataforma", label: "Equipo", href: paths.platform.team.members },
  { id: "m13", group: "Plataforma", label: "Configuración", href: paths.platform.settings },
  { id: "m14", group: "Especial", label: "Área del fundador", href: paths.founder.root },
  { id: "m15", group: "Especial", label: "Super administración", href: paths.superAdmin.organizations },
  { id: "m16", group: "Referencia", label: "Sistema de diseño", href: paths.designSystem },
];
