/**
 * lib/funnels/templates/index.ts
 *
 * Registry de plantillas de embudo.
 *
 * PARA AGREGAR UN TIPO DE EMBUDO NUEVO:
 *   1. Crear `<nombre>.ts` en esta carpeta transcribiendo el documento fuente.
 *   2. Agregar su id a `FUNNEL_TEMPLATE_IDS` y la plantilla a `FUNNEL_TEMPLATES`.
 *   3. Correr el validador (`validateAllTemplates`).
 *
 * Eso es todo. Si hace falta tocar un componente, la arquitectura falló
 * (docs/FUNNELS_ARCHITECTURE.md §0).
 */

import type { FunnelTemplate } from "../types";
import { webinarTemplate } from "./webinar";
import { vslCallTemplate } from "./vsl-call";
import { dmTemplate } from "./dm";

export const FUNNEL_TEMPLATE_IDS = ["webinar", "vsl_call", "dm"] as const;

export type FunnelTemplateId = (typeof FUNNEL_TEMPLATE_IDS)[number];

export const FUNNEL_TEMPLATES: FunnelTemplate[] = [
  webinarTemplate,
  vslCallTemplate,
  dmTemplate,
];

const TEMPLATE_BY_ID = new Map(FUNNEL_TEMPLATES.map((t) => [t.id, t]));

export function getFunnelTemplate(id: string): FunnelTemplate | undefined {
  return TEMPLATE_BY_ID.get(id);
}

export function requireFunnelTemplate(id: string): FunnelTemplate {
  const template = TEMPLATE_BY_ID.get(id);
  if (!template) throw new Error(`Plantilla de embudo desconocida: ${id}`);
  return template;
}

export function isFunnelTemplateId(value: string): value is FunnelTemplateId {
  return (FUNNEL_TEMPLATE_IDS as readonly string[]).includes(value);
}

export { webinarTemplate, vslCallTemplate, dmTemplate };
