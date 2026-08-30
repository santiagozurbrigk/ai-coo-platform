/**
 * lib/funnels/kpis.ts
 *
 * Sección 03 del documento fuente: los KPIs universales.
 *
 * Están por encima de cualquier embudo y son la forma en que los embudos se
 * comparan entre sí. Misma fórmula, siempre. Un embudo nuevo NO define sus
 * propias versiones de estos.
 *
 * El documento cierra la sección con la comparación que importa:
 *
 *   "every funnel, whatever its shape, is judged on EPL vs CPL to know if it
 *    works and LTV vs CAC to know if it scales. The stage-by-stage tables tell
 *    you WHERE a funnel is broken; these two ratios tell you WHETHER it is."
 */

import type { MetricDefinition } from "./types";

export const UNIVERSAL_KPIS: MetricDefinition[] = [
  {
    id: "cac",
    abbr: "CAC",
    label: "Customer Acquisition Cost",
    unit: "currency",
    direction: "lower_is_better",
    numerator: { kind: "spend" },
    denominator: { kind: "customers" },
    formula: "total spend ÷ new customers",
    note: "Incluye ad spend + fees de plataforma. Se juzga contra LTV, nunca aislado.",
  },
  {
    id: "roas_blended",
    abbr: "ROAS",
    label: "Return on Ad Spend (blended)",
    unit: "ratio",
    direction: "higher_is_better",
    numerator: { kind: "revenue" },
    denominator: { kind: "spend" },
    formula: "revenue ÷ ad spend",
    note: "Todo el revenue sobre todo el spend. El documento lo llama la verdad.",
  },
  {
    id: "roas_by_source",
    abbr: "ROAS",
    label: "Return on Ad Spend (by-source)",
    unit: "ratio",
    direction: "higher_is_better",
    // ⭐ Numerador y denominador salen los DOS de Hyros. Antes usaba las mismas
    // medidas que el blended, así que las dos tarjetas mostraban el mismo
    // número y la etiqueta [Hyros] no significaba nada. El documento declara la
    // separación no negociable: "the two never match exactly".
    numerator: { kind: "attributed_revenue" },
    denominator: { kind: "attributed_spend" },
    // El texto de la fórmula es transcripción literal del documento, que usa las
    // mismas palabras para las dos ROAS. Lo que las distingue son las medidas.
    formula: "revenue ÷ ad spend",
    note: "Atribuido por fuente vía Hyros: revenue y spend salen los dos de Hyros, no de la pasarela ni de Meta. El documento lo llama el volante; el blended es la verdad.",
  },
  {
    id: "epl",
    abbr: "EPL",
    label: "Earnings per Lead",
    unit: "currency",
    direction: "higher_is_better",
    numerator: { kind: "revenue" },
    denominator: { kind: "stage", stageId: "lead" },
    formula: "revenue ÷ leads",
    note: "Si EPL > CPL se puede escalar el spend. La lectura más rápida de si un embudo funciona.",
  },
  {
    id: "epc",
    abbr: "EPC",
    label: "Earnings per Click",
    unit: "currency",
    direction: "higher_is_better",
    numerator: { kind: "revenue" },
    denominator: { kind: "stage", stageId: "click" },
    formula: "revenue ÷ clicks",
  },
  {
    id: "cpl",
    abbr: "CPL",
    label: "Cost per Lead",
    unit: "currency",
    direction: "lower_is_better",
    numerator: { kind: "spend" },
    denominator: { kind: "stage", stageId: "lead" },
    formula: "spend ÷ leads",
    note: "No tiene tarjeta propia en el documento, pero EPL lo referencia como su contraparte.",
  },
  {
    id: "aov",
    abbr: "AOV",
    label: "Average Order Value",
    unit: "currency",
    direction: "higher_is_better",
    numerator: { kind: "revenue" },
    denominator: { kind: "orders" },
    formula: "revenue ÷ orders",
    note: "Medir con y sin order bumps / upsells. Un AOV que sube da aire en el CAC.",
  },
  {
    id: "ltv",
    abbr: "LTV",
    label: "Lifetime Value",
    unit: "currency",
    direction: "higher_is_better",
    numerator: null,
    denominator: null,
    compose: {
      op: "multiply",
      refs: [
        { kind: "metric", metricId: "aov" },
        { kind: "purchases" },
        { kind: "retention_rate" },
      ],
    },
    formula: "AOV × purchases × retention",
    note: "Para suscripciones y planes de pago, usar LTV proyectado.",
  },
  {
    id: "cash_collected_vs_contracted",
    abbr: "CASH",
    label: "Cash Collected vs Contracted",
    unit: "percentage",
    direction: "higher_is_better",
    numerator: { kind: "cash_collected" },
    denominator: { kind: "contracted_value" },
    formula: "cash in ÷ total contract value",
    note: "Crítico en high-ticket con planes de pago. El revenue contratado es una promesa; el cash cobrado paga la cuenta de ads.",
  },
  {
    id: "ltv_cac_ratio",
    label: "LTV : CAC",
    unit: "ratio",
    direction: "higher_is_better",
    numerator: { kind: "metric", metricId: "ltv" },
    denominator: { kind: "metric", metricId: "cac" },
    formula: "LTV ÷ CAC",
    note: "El documento pide 3:1 o mejor antes de empujar escala.",
  },
  {
    id: "epl_cpl_ratio",
    label: "EPL vs CPL",
    unit: "ratio",
    direction: "higher_is_better",
    numerator: { kind: "metric", metricId: "epl" },
    denominator: { kind: "metric", metricId: "cpl" },
    formula: "EPL ÷ CPL",
  },
];

const KPI_BY_ID = new Map(UNIVERSAL_KPIS.map((k) => [k.id, k]));

export function getUniversalKpi(id: string): MetricDefinition | undefined {
  return KPI_BY_ID.get(id);
}

/**
 * Las dos ratios que el documento declara decisivas: una dice si el embudo
 * funciona, la otra si escala.
 */
export const DECISIVE_RATIOS = ["epl_cpl_ratio", "ltv_cac_ratio"] as const;
