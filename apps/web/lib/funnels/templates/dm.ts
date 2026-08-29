/**
 * Embudo DM — transcripción de la sección 02 del `Funnel Metrics Standard v1.0`.
 *
 * Contenido o anuncios disparan una conversación. Se califica en el hilo y
 * después se manda oferta o se agenda llamada.
 *
 * Notas de fidelidad al documento:
 * - Es el único embudo con 6 steps en vez de 7: recorre las etapas `click`,
 *   `lead`, `engaged`, `intent`, `sales_conv` y `cash` con un step cada una.
 *   Como los otros dos, no tiene step en `spend` (implícito en Meta Ads).
 * - El primer step tiene benchmark "context-set": el documento declara
 *   explícitamente que no hay piso universal para el trigger rate.
 *
 * Es el único de los tres embudos construible end-to-end con las fuentes que OTC
 * ya tiene hoy, y por eso es el que se implementa primero (Fase 1).
 */

import type { FunnelTemplate } from "../types";
import { SOURCE_DOC_VERSION } from "../types";

export const dmTemplate: FunnelTemplate = {
  id: "dm",
  label: "DM Funnel",
  description:
    "Content or ads trigger a conversation. Qualify in the thread, then send an offer or book a call.",
  badge: "Conversation-led",
  accentToken: "--chart-pink",
  sourceDocVersion: SOURCE_DOC_VERSION,

  northStar: { label: "Cost per Conversation", metricId: "dm.cost_per_conversation" },
  // El documento escribe "Reply / set rate" como una sola etiqueta aunque son
  // dos métricas distintas del embudo. Se conserva el texto literal y se apunta
  // al reply rate, que es el que llega antes en el spine.
  leadingIndicator: { label: "Reply / set rate", metricId: "dm.active_reply_rate" },
  governingRate: { label: "Conversation → Close", metricId: "dm.convo_to_close" },

  funnelMetrics: [],

  steps: [
    {
      id: "dm.trigger",
      stageId: "click",
      order: 1,
      label: "Trigger (comment / story / ad)",
      metricLabel: "Trigger rate, cost per trigger",
      benchmarkLabel: "context-set",
      sourceHint: "meta_ads",
      metrics: [
        {
          id: "dm.trigger_rate",
          label: "Trigger rate",
          unit: "percentage",
          direction: "higher_is_better",
          numerator: { kind: "step", stepId: "dm.trigger" },
          denominator: { kind: "reach" },
        },
        {
          id: "dm.cost_per_trigger",
          label: "Cost per trigger",
          unit: "currency",
          direction: "lower_is_better",
          numerator: { kind: "spend" },
          denominator: { kind: "step", stepId: "dm.trigger" },
        },
      ],
      benchmarks: {
        "dm.trigger_rate": {
          kind: "context_set",
          note: 'El documento marca esta celda como "context-set": sin piso universal.',
        },
        "dm.cost_per_trigger": { kind: "context_set" },
      },
    },
    {
      id: "dm.conversation",
      stageId: "lead",
      order: 2,
      label: "Conversation opened",
      metricLabel: "Trigger → convo, cost/conversation",
      benchmarkLabel: "40–70% of triggers",
      sourceHint: "crm_pipeline",
      metrics: [
        {
          id: "dm.trigger_to_convo",
          label: "Trigger → conversation",
          unit: "percentage",
          direction: "higher_is_better",
          numerator: { kind: "step", stepId: "dm.conversation" },
          denominator: { kind: "step", stepId: "dm.trigger" },
        },
        {
          id: "dm.cost_per_conversation",
          label: "Cost per conversation",
          unit: "currency",
          direction: "lower_is_better",
          numerator: { kind: "spend" },
          denominator: { kind: "step", stepId: "dm.conversation" },
        },
      ],
      benchmarks: {
        "dm.trigger_to_convo": { kind: "range", min: 40, max: 70, unit: "percentage" },
        "dm.cost_per_conversation": { kind: "context_set" },
      },
    },
    {
      id: "dm.replied",
      stageId: "engaged",
      order: 3,
      label: "Two-way, replied to qualifier",
      metricLabel: "Active-reply rate",
      benchmarkLabel: "50–70%",
      sourceHint: "crm_pipeline",
      metrics: [
        {
          id: "dm.active_reply_rate",
          label: "Active-reply rate",
          unit: "percentage",
          direction: "higher_is_better",
          numerator: { kind: "step", stepId: "dm.replied" },
          denominator: { kind: "step", stepId: "dm.conversation" },
        },
      ],
      benchmarks: {
        "dm.active_reply_rate": { kind: "range", min: 50, max: 70, unit: "percentage" },
      },
    },
    {
      id: "dm.set",
      stageId: "intent",
      order: 4,
      label: "Offer sent or call set",
      metricLabel: "Set rate (convo → booked/offer)",
      benchmarkLabel: "20–40%",
      sourceHint: "crm_pipeline",
      metrics: [
        {
          id: "dm.set_rate",
          label: "Set rate",
          unit: "percentage",
          direction: "higher_is_better",
          numerator: { kind: "step", stepId: "dm.set" },
          denominator: { kind: "step", stepId: "dm.conversation" },
        },
      ],
      benchmarks: {
        "dm.set_rate": { kind: "range", min: 20, max: 40, unit: "percentage" },
      },
    },
    {
      id: "dm.show",
      stageId: "sales_conv",
      order: 5,
      label: "Showed / offer opened",
      metricLabel: "Show rate (if call)",
      benchmarkLabel: "55–75%",
      sourceHint: "calendly",
      metrics: [
        {
          id: "dm.show_rate",
          label: "Show rate (if call)",
          unit: "percentage",
          direction: "higher_is_better",
          numerator: { kind: "step", stepId: "dm.show" },
          denominator: { kind: "step", stepId: "dm.set" },
        },
      ],
      benchmarks: {
        "dm.show_rate": { kind: "range", min: 55, max: 75, unit: "percentage" },
      },
    },
    {
      id: "dm.close",
      stageId: "cash",
      order: 6,
      label: "Closed in thread or on call",
      metricLabel: "Conversation → close · cash",
      benchmarkLabel: "3–10% convo → close",
      sourceHint: "checkout",
      metrics: [
        {
          id: "dm.convo_to_close",
          label: "Conversation → close",
          unit: "percentage",
          direction: "higher_is_better",
          numerator: { kind: "step", stepId: "dm.close" },
          denominator: { kind: "step", stepId: "dm.conversation" },
        },
        {
          id: "dm.cash_collected",
          label: "Cash collected",
          unit: "currency",
          direction: "higher_is_better",
          numerator: { kind: "cash_collected" },
          denominator: null,
        },
      ],
      benchmarks: {
        "dm.convo_to_close": { kind: "range", min: 3, max: 10, unit: "percentage" },
        "dm.cash_collected": { kind: "context_set" },
      },
    },
  ],
};
