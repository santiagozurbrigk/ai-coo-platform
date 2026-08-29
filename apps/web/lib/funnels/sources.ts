/**
 * lib/funnels/sources.ts
 *
 * Catálogo de fuentes de datos que pueden alimentar un step de embudo.
 *
 * Cada fuente declara de dónde sale el número y con qué procedencia, para poder
 * etiquetar cada figura como pide el documento ("label each figure with its
 * source"). El binding step → fuente vive en `funnel_step_bindings`.
 *
 * Un step SIN binding resuelve a `null`, nunca a `0` (§9.1).
 *
 * Sólo se listan fuentes respaldadas por tablas que existen hoy en OTC. Las
 * etapas que dependen de integraciones faltantes (webinar, VSL) no tienen fuente
 * y por diseño quedan en "sin datos" hasta que esas integraciones existan — ver
 * docs/FUNNELS_ARCHITECTURE.md §7.
 */

import type { SpineStageId } from "./spine";
import type { InstrumentationToolId } from "./instrumentation";

export const FUNNEL_SOURCES = [
  {
    id: "ad_clicks",
    label: "Clicks en anuncios",
    description: "Clicks de Meta capturados por día en el período (M04).",
    provenance: "meta_ads",
    suitableFor: ["click"],
  },
  {
    id: "conversations_opened",
    label: "Conversaciones abiertas",
    description: "Conversaciones del inbox creadas dentro del período.",
    provenance: "crm_pipeline",
    // Sólo `lead`. Una conversación abierta NO es un disparador: en el documento
    // la etapa Click del DM es el "Trigger (comment / story / ad)", que es lo que
    // ocurre ANTES de que el hilo exista.
    suitableFor: ["lead"],
  },
  {
    id: "conversations_replied",
    label: "Conversaciones con respuesta del lead",
    description: "Conversaciones con más de un mensaje: hubo ida y vuelta real.",
    provenance: "crm_pipeline",
    suitableFor: ["engaged"],
  },
  {
    id: "conversations_booked",
    label: "Conversaciones agendadas",
    description: 'Conversaciones en estado "booked" o etiquetadas como agendado/closeado.',
    provenance: "crm_pipeline",
    suitableFor: ["intent"],
  },
  {
    id: "closing_calls_scheduled",
    label: "Llamadas agendadas",
    description: "Llamadas de cierre con fecha dentro del período, en cualquier estado.",
    provenance: "calendly",
    suitableFor: ["intent"],
  },
  {
    id: "closing_calls_attended",
    label: "Llamadas a las que asistieron",
    description: 'Llamadas cerradas o no cerradas: excluye los "no_show".',
    provenance: "calendly",
    suitableFor: ["sales_conv"],
  },
  {
    id: "closing_calls_closed",
    label: "Llamadas cerradas",
    description: 'Llamadas de cierre en estado "closed".',
    provenance: "crm_pipeline",
    suitableFor: ["sales_conv", "cash"],
  },
  {
    id: "clients_new",
    label: "Clientes nuevos",
    description: "Clientes con fecha de alta dentro del período.",
    provenance: "checkout",
    suitableFor: ["cash"],
  },
  {
    id: "client_payments_count",
    label: "Pagos registrados",
    description: "Cantidad de pagos de clientes con fecha dentro del período.",
    provenance: "checkout",
    suitableFor: ["cash"],
  },
] as const satisfies readonly {
  id: string;
  label: string;
  description: string;
  provenance: InstrumentationToolId;
  suitableFor: readonly SpineStageId[];
}[];

export type FunnelSource = (typeof FUNNEL_SOURCES)[number];
export type FunnelSourceId = FunnelSource["id"];

const SOURCE_BY_ID = new Map(FUNNEL_SOURCES.map((s) => [s.id, s]));

export function getFunnelSource(id: string): FunnelSource | undefined {
  return SOURCE_BY_ID.get(id as FunnelSourceId);
}

export function isFunnelSourceId(value: string): value is FunnelSourceId {
  return SOURCE_BY_ID.has(value as FunnelSourceId);
}

/** Fuentes que tienen sentido para una etapa dada, para la UI de configuración. */
export function sourcesForStage(stageId: SpineStageId): FunnelSource[] {
  return FUNNEL_SOURCES.filter((s) =>
    (s.suitableFor as readonly SpineStageId[]).includes(stageId)
  );
}

/**
 * Bindings por defecto del embudo DM.
 *
 * Es el único de los tres embudos construible end-to-end con las fuentes que OTC
 * ya tiene, y por eso es el primero que se implementa.
 *
 * `dm.trigger` queda deliberadamente SIN binding: OTC no tiene hoy una fuente de
 * disparadores (comentarios / historias / anuncios que inician una conversación).
 * Ese hueco es correcto y se muestra como problema de instrumentación, no como
 * rotura de negocio.
 */
export const DEFAULT_DM_BINDINGS: Record<string, FunnelSourceId> = {
  "dm.conversation": "conversations_opened",
  "dm.replied": "conversations_replied",
  "dm.set": "conversations_booked",
  "dm.show": "closing_calls_attended",
  "dm.close": "closing_calls_closed",
};

/**
 * Bindings por defecto por plantilla.
 *
 * La etapa Click de los tres embudos ya se puede alimentar con los clicks de
 * Meta capturados por `ad_metrics_daily` (I-1 del mapa de fuentes). El resto de
 * webinar y VSL espera sus integraciones.
 */
export const DEFAULT_BINDINGS: Record<string, Record<string, FunnelSourceId>> = {
  dm: DEFAULT_DM_BINDINGS,
  webinar: { "webinar.click": "ad_clicks" },
  vsl_call: { "vsl.click": "ad_clicks" },
};
