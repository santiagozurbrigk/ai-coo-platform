/**
 * lib/funnels/spine.ts
 *
 * El spine universal: las 7 etapas a las que colapsa cualquier embudo.
 *
 * INMUTABLE. Es la tesis del documento fuente (`Funnel Metrics Standard v1.0`,
 * sección 01) y la invariante de todo el módulo: webinar, VSL y DM se ven
 * distintos en la superficie pero se miden con las mismas siete etapas, y por
 * eso los mismos números significan lo mismo en cualquier oferta y cualquier
 * cliente.
 *
 * No agregar, quitar ni reordenar etapas. Todo lo específico de un embudo va
 * en sus `steps` (ver `templates/`), nunca acá.
 *
 * Referencia: docs/FUNNELS_ARCHITECTURE.md §3.8
 */

export const SPINE_STAGES = [
  { id: "spend",      order: 1, label: "Spend",       metric: "$ deployed / reach" },
  { id: "click",      order: 2, label: "Click",       metric: "traffic to funnel" },
  { id: "lead",       order: 3, label: "Lead",        metric: "opt-in captured" },
  { id: "engaged",    order: 4, label: "Engaged",     metric: "consumed the pitch" },
  { id: "intent",     order: 5, label: "Intent",      metric: "booked / applied" },
  { id: "sales_conv", order: 6, label: "Sales Conv.", metric: "call / offer live" },
  { id: "cash",       order: 7, label: "Cash",        metric: "collected revenue" },
] as const;

export type SpineStage = (typeof SPINE_STAGES)[number];
export type SpineStageId = SpineStage["id"];

export const SPINE_STAGE_IDS = SPINE_STAGES.map((s) => s.id) as readonly SpineStageId[];

export function getSpineStage(id: SpineStageId): SpineStage {
  const stage = SPINE_STAGES.find((s) => s.id === id);
  if (!stage) throw new Error(`Etapa de spine desconocida: ${id}`);
  return stage;
}

export function spineStageOrder(id: SpineStageId): number {
  return getSpineStage(id).order;
}

export function isSpineStageId(value: string): value is SpineStageId {
  return SPINE_STAGE_IDS.includes(value as SpineStageId);
}
