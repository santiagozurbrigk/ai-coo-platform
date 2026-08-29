/**
 * lib/funnels/instrumentation.ts
 *
 * Sección 05 del documento fuente: qué herramienta es dueña de qué etapa, y con
 * qué frecuencia se mira cada número.
 *
 * `otcStatus` hace legible por máquina el track de integraciones de
 * docs/FUNNELS_ARCHITECTURE.md §7. Sirve para que la UI pueda decir "esta etapa
 * necesita WebinarJam y no está conectado" en vez de mostrar un cero, que es
 * exactamente el riesgo de §9.1.
 */

/** Estado de la herramienta dentro de OTC. */
export type ToolAvailability =
  /** Existe una integración nativa que cubre lo que el documento le asigna. */
  | "available"
  /**
   * La integración existe pero NO cubre todo lo que el documento le asigna.
   * Las partes no cubiertas se comportan como `missing`.
   */
  | "partial"
  /** No existe, pero otra integración de OTC cubre la misma función. */
  | "equivalent"
  /** No existe. Bloquea las etapas que alimenta. */
  | "missing";

export const INSTRUMENTATION_TOOLS = [
  {
    id: "meta_ads",
    label: "Meta Ads",
    owns: "Spend, CTR, CPC, cost/lead",
    otcStatus: "available",
    otcNote: "Vía Zernio (getMarketingAdsAction). Live fetch, no persiste.",
  },
  {
    id: "hyros",
    label: "Hyros",
    owns: "True attribution, ROAS, EPL, journeys",
    otcStatus: "missing",
    otcNote: "Integración pendiente. Bloquea el etiquetado [Hyros] y los KPIs universales.",
  },
  {
    id: "landing_page",
    label: "Landing / VSL page",
    owns: "Opt-in %, play rate, watch %",
    otcStatus: "missing",
    otcNote:
      "Requiere hosting de video con analytics. Proveedor sin definir (Wistia / Vimeo / YouTube / player propio).",
  },
  {
    id: "webinar_platform",
    label: "WebinarJam / Zoom",
    owns: "Show-up, stick rate, CTA clicks",
    otcStatus: "missing",
    otcNote: "Integración pendiente. Bloquea la etapa Engaged del embudo Webinar.",
  },
  {
    id: "application_form",
    label: "Typeform / application",
    owns: "Qualified rate, booking",
    otcStatus: "available",
    otcNote:
      "Typeform y Google Forms están integrados. El scoring de calificación queda pendiente.",
  },
  {
    id: "calendly",
    label: "Calendly",
    owns: "Booked calls, show rate",
    otcStatus: "available",
    otcNote: "Integración nativa + cron calendly-sync.",
  },
  {
    id: "crm_pipeline",
    label: "GHL pipeline",
    owns: "Stage counts, set/close, follow-up",
    otcStatus: "partial",
    otcNote:
      "La integración GHL de OTC consume /calendars y /contacts, pero NO /opportunities ni /pipelines. " +
      "Los conteos por etapa y el set/close que el documento le asigna todavía no se sincronizan: es lo que necesita el embudo DM.",
  },
  {
    id: "checkout",
    label: "Whop / Fanbasis",
    owns: "AOV, cash collected, refunds",
    otcStatus: "equivalent",
    otcNote: "Cubierto por Stripe y Mercado Pago, ya integrados. No bloquea.",
  },
] as const satisfies readonly {
  id: string;
  label: string;
  owns: string;
  otcStatus: ToolAvailability;
  otcNote: string;
}[];

export type InstrumentationTool = (typeof INSTRUMENTATION_TOOLS)[number];
export type InstrumentationToolId = InstrumentationTool["id"];

export function getInstrumentationTool(id: InstrumentationToolId): InstrumentationTool {
  const tool = INSTRUMENTATION_TOOLS.find((t) => t.id === id);
  if (!tool) throw new Error(`Herramienta de instrumentación desconocida: ${id}`);
  return tool;
}

/**
 * Herramientas que bloquean etapas: las que no existen y las que existen pero no
 * cubren lo que el documento les asigna.
 */
export function blockingTools(): InstrumentationTool[] {
  return INSTRUMENTATION_TOOLS.filter(
    (t) => t.otcStatus === "missing" || t.otcStatus === "partial"
  );
}

// ─── Cadencia de reporte ──────────────────────────────────────────────────────

export const REPORTING_CADENCE = [
  {
    id: "daily",
    label: "Diario",
    title: "Pulse",
    watches: "spend, leads, CPL, bookings, roturas obvias",
    note: "Lectura de 5 minutos. No se toman decisiones con un solo día de datos.",
    otcStatus: "missing",
    otcNote: "Falta el cron de pulso diario.",
  },
  {
    id: "weekly",
    label: "Semanal",
    title: "Steering",
    watches: "show rate, close rate, costo por adquisición, ROAS by-source",
    note: "Acá se mueve presupuesto y se cortan creativos.",
    otcStatus: "available",
    otcNote: "Cron executive-report-weekly.",
  },
  {
    id: "monthly",
    label: "Mensual",
    title: "Truth",
    watches: "ROAS blended, LTV:CAC, retención por cohorte, cash collected vs contracted",
    note: "Los números que ve el cliente.",
    otcStatus: "available",
    otcNote: "Cron executive-report-monthly.",
  },
] as const;

export type ReportingCadenceId = (typeof REPORTING_CADENCE)[number]["id"];

// ─── Constantes de gobernanza (§3.7) ──────────────────────────────────────────

/**
 * El documento lo declara no negociable: todo se reporta en EST, porque el
 * dashboard de Hyros viene por defecto en Mountain Time.
 */
export const DEFAULT_REPORTING_TIMEZONE = "America/New_York";

/** Stack de atribución que el documento asume (decisión 7: tal cual el doc). */
export const ATTRIBUTION_STACK = ["hyros", "meta_ads", "crm_pipeline"] as const;
