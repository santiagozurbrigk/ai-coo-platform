/**
 * Embudo Webinar — transcripción de la sección 02 del `Funnel Metrics Standard v1.0`.
 *
 * Uno-a-muchos: valor + pitch en vivo o en replay evergreen, y después
 * book-a-call o checkout directo.
 *
 * Notas de fidelidad al documento:
 * - No tiene step en la etapa `spend`: el documento deja el spend implícito en
 *   Meta Ads y ninguna de las tres tablas lo lista como fila.
 * - Tiene DOS steps en `engaged` (show-up y stick rate) — la relación
 *   step → stage es N:1 (§3.2).
 * - "Cost per Sale" es el north-star pero no aparece en ninguna fila de la
 *   tabla, así que vive en `funnelMetrics`.
 */

import type { FunnelTemplate } from "../types";
import { SOURCE_DOC_VERSION } from "../types";

export const webinarTemplate: FunnelTemplate = {
  id: "webinar",
  label: "Webinar Funnel",
  description:
    "One-to-many. Value + pitch delivered live or on evergreen replay, then book-a-call or direct checkout.",
  badge: "Registration-led",
  accentToken: "--chart-accent",
  sourceDocVersion: SOURCE_DOC_VERSION,

  northStar: { label: "Cost per Sale", metricId: "webinar.cost_per_sale" },
  leadingIndicator: { label: "Show-up rate", metricId: "webinar.show_up_rate" },
  governingRate: { label: "Attendee → Sale", metricId: "webinar.attendee_to_sale" },

  funnelMetrics: [
    {
      id: "webinar.cost_per_sale",
      label: "Cost per Sale",
      unit: "currency",
      direction: "lower_is_better",
      numerator: { kind: "spend" },
      denominator: { kind: "step", stepId: "webinar.sale" },
      formula: "spend ÷ sales",
    },
  ],

  steps: [
    {
      id: "webinar.click",
      stageId: "click",
      order: 1,
      label: "Ad → registration page",
      metricLabel: "CTR, cost per click",
      benchmarkLabel: "1–3% CTR",
      sourceHint: "meta_ads",
      metrics: [
        {
          id: "webinar.ctr",
          label: "CTR",
          unit: "percentage",
          direction: "higher_is_better",
          numerator: { kind: "step", stepId: "webinar.click" },
          denominator: { kind: "impressions" },
        },
        {
          id: "webinar.cost_per_click",
          label: "Cost per click",
          unit: "currency",
          direction: "lower_is_better",
          numerator: { kind: "spend" },
          denominator: { kind: "step", stepId: "webinar.click" },
        },
      ],
      benchmarks: {
        "webinar.ctr": { kind: "range", min: 1, max: 3, unit: "percentage" },
        // El documento sólo da rango para el CTR en esta celda; el CPC queda sin piso.
        "webinar.cost_per_click": { kind: "context_set" },
      },
    },
    {
      id: "webinar.registration",
      stageId: "lead",
      order: 2,
      label: "Registration opt-in",
      metricLabel: "Reg-page conv., cost/registrant",
      benchmarkLabel: "25–45% · $3–15",
      sourceHint: "landing_page",
      metrics: [
        {
          id: "webinar.reg_page_conv",
          label: "Reg-page conversion",
          unit: "percentage",
          direction: "higher_is_better",
          numerator: { kind: "step", stepId: "webinar.registration" },
          denominator: { kind: "step", stepId: "webinar.click" },
        },
        {
          id: "webinar.cost_per_registrant",
          label: "Cost per registrant",
          unit: "currency",
          direction: "lower_is_better",
          numerator: { kind: "spend" },
          denominator: { kind: "step", stepId: "webinar.registration" },
        },
      ],
      benchmarks: {
        "webinar.reg_page_conv": { kind: "range", min: 25, max: 45, unit: "percentage" },
        "webinar.cost_per_registrant": { kind: "range", min: 3, max: 15, unit: "currency" },
      },
    },
    {
      id: "webinar.attendance",
      stageId: "engaged",
      order: 3,
      label: "Showed up (live + replay)",
      metricLabel: "Show-up rate",
      benchmarkLabel: "30–50%",
      sourceHint: "webinar_platform",
      metrics: [
        {
          id: "webinar.show_up_rate",
          label: "Show-up rate",
          unit: "percentage",
          direction: "higher_is_better",
          numerator: { kind: "step", stepId: "webinar.attendance" },
          denominator: { kind: "step", stepId: "webinar.registration" },
        },
      ],
      benchmarks: {
        "webinar.show_up_rate": { kind: "range", min: 30, max: 50, unit: "percentage" },
      },
    },
    {
      id: "webinar.stick",
      stageId: "engaged",
      order: 4,
      label: "Stayed to the pitch",
      metricLabel: "Stick rate to offer",
      benchmarkLabel: "50–70% of attendees",
      sourceHint: "webinar_platform",
      metrics: [
        {
          id: "webinar.stick_rate",
          label: "Stick rate to offer",
          unit: "percentage",
          direction: "higher_is_better",
          numerator: { kind: "step", stepId: "webinar.stick" },
          // El documento es explícito con el denominador: "of attendees".
          denominator: { kind: "step", stepId: "webinar.attendance" },
        },
      ],
      benchmarks: {
        "webinar.stick_rate": { kind: "range", min: 50, max: 70, unit: "percentage" },
      },
    },
    {
      id: "webinar.cta",
      stageId: "intent",
      order: 5,
      label: "Clicked CTA / booked call",
      metricLabel: "Offer-CTA click rate",
      benchmarkLabel: "15–30% of attendees",
      sourceHint: "webinar_platform",
      metrics: [
        {
          id: "webinar.cta_click_rate",
          label: "Offer-CTA click rate",
          unit: "percentage",
          direction: "higher_is_better",
          numerator: { kind: "step", stepId: "webinar.cta" },
          denominator: { kind: "step", stepId: "webinar.attendance" },
        },
      ],
      benchmarks: {
        "webinar.cta_click_rate": { kind: "range", min: 15, max: 30, unit: "percentage" },
      },
    },
    {
      id: "webinar.sale",
      stageId: "sales_conv",
      order: 6,
      label: "Direct buy or closed on call",
      metricLabel: "Attendee → sale",
      benchmarkLabel: "2–6%",
      sourceHint: "crm_pipeline",
      metrics: [
        {
          id: "webinar.attendee_to_sale",
          label: "Attendee → sale",
          unit: "percentage",
          direction: "higher_is_better",
          numerator: { kind: "step", stepId: "webinar.sale" },
          denominator: { kind: "step", stepId: "webinar.attendance" },
        },
      ],
      benchmarks: {
        "webinar.attendee_to_sale": { kind: "range", min: 2, max: 6, unit: "percentage" },
      },
    },
    {
      id: "webinar.cash",
      stageId: "cash",
      order: 7,
      label: "Payment collected",
      metricLabel: "Registrant → sale · cash collected",
      benchmarkLabel: "1–3% reg → sale",
      sourceHint: "checkout",
      metrics: [
        {
          // Mismo evento de venta que `webinar.attendee_to_sale`, medido contra
          // otra base. Es el ejemplo canónico de §3.4: sin denominador explícito
          // estas dos métricas serían indistinguibles.
          id: "webinar.registrant_to_sale",
          label: "Registrant → sale",
          unit: "percentage",
          direction: "higher_is_better",
          numerator: { kind: "step", stepId: "webinar.sale" },
          denominator: { kind: "step", stepId: "webinar.registration" },
        },
        {
          id: "webinar.cash_collected",
          label: "Cash collected",
          unit: "currency",
          direction: "higher_is_better",
          numerator: { kind: "cash_collected" },
          denominator: null,
        },
      ],
      benchmarks: {
        "webinar.registrant_to_sale": { kind: "range", min: 1, max: 3, unit: "percentage" },
        "webinar.cash_collected": { kind: "context_set" },
      },
    },
  ],
};
