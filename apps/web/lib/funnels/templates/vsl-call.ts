/**
 * Embudo VSL Book-a-Call — transcripción de la sección 02 del
 * `Funnel Metrics Standard v1.0`.
 *
 * Pitch en video asíncrono → aplicación → el equipo de ventas cierra en llamada.
 * El motor del high-ticket.
 *
 * Notas de fidelidad al documento:
 * - NO tiene etapa `lead`. Va de `click` directo a `engaged` porque no hay
 *   opt-in: se entra derecho al booking. Es el caso que obliga a que el spine
 *   sea disperso (§3.1) — una etapa vacía acá es correcta, no una rotura.
 * - Tampoco tiene step en `spend` (implícito en Meta Ads, igual que los otros).
 * - Dos steps en `intent` y dos en `sales_conv`.
 * - El north-star "Cost per Acquisition" apunta al KPI universal `cac`, no a una
 *   métrica propia del embudo.
 */

import type { FunnelTemplate } from "../types";
import { SOURCE_DOC_VERSION } from "../types";

export const vslCallTemplate: FunnelTemplate = {
  id: "vsl_call",
  label: "VSL Book-a-Call Funnel",
  description:
    "Async video pitch → application → sales team closes on a call. The engine for high-ticket.",
  badge: "Application-led",
  accentToken: "--chart-secondary",
  sourceDocVersion: SOURCE_DOC_VERSION,

  northStar: { label: "Cost per Acquisition", metricId: "cac" },
  leadingIndicator: { label: "Cost per booked call", metricId: "vsl.cost_per_booked_call" },
  governingRate: { label: "Show → Close", metricId: "vsl.close_rate" },

  funnelMetrics: [],

  steps: [
    {
      id: "vsl.click",
      stageId: "click",
      order: 1,
      label: "Ad → VSL page",
      metricLabel: "CTR, cost per click",
      benchmarkLabel: "1–3% CTR",
      sourceHint: "meta_ads",
      metrics: [
        {
          id: "vsl.ctr",
          label: "CTR",
          unit: "percentage",
          direction: "higher_is_better",
          numerator: { kind: "step", stepId: "vsl.click" },
          denominator: { kind: "impressions" },
        },
        {
          id: "vsl.cost_per_click",
          label: "Cost per click",
          unit: "currency",
          direction: "lower_is_better",
          numerator: { kind: "spend" },
          denominator: { kind: "step", stepId: "vsl.click" },
        },
      ],
      benchmarks: {
        "vsl.ctr": { kind: "range", min: 1, max: 3, unit: "percentage" },
        "vsl.cost_per_click": { kind: "context_set" },
      },
    },
    {
      id: "vsl.watch",
      stageId: "engaged",
      order: 2,
      label: "Watched the VSL",
      metricLabel: "Play rate, avg watch %",
      benchmarkLabel: "55–70% play · to CTA",
      sourceHint: "landing_page",
      metrics: [
        {
          id: "vsl.play_rate",
          label: "Play rate",
          unit: "percentage",
          direction: "higher_is_better",
          numerator: { kind: "step", stepId: "vsl.watch" },
          denominator: { kind: "step", stepId: "vsl.click" },
        },
        {
          id: "vsl.avg_watch_pct",
          label: "Avg watch %",
          unit: "percentage",
          direction: "higher_is_better",
          // Promedio por sesión reportado por el player, no un cociente entre etapas.
          numerator: { kind: "reported", measureId: "avg_watch_pct" },
          denominator: null,
        },
      ],
      benchmarks: {
        "vsl.play_rate": { kind: "range", min: 55, max: 70, unit: "percentage" },
        // El documento escribe "to CTA" sin rango numérico: no hay piso definido.
        "vsl.avg_watch_pct": {
          kind: "context_set",
          note: 'El documento indica "to CTA" sin rango numérico.',
        },
      },
    },
    {
      id: "vsl.booking",
      stageId: "intent",
      order: 3,
      label: "Booked / applied",
      metricLabel: "Page → booking, cost/booked call",
      benchmarkLabel: "2–8% · $50–300",
      sourceHint: "calendly",
      metrics: [
        {
          id: "vsl.page_to_booking",
          label: "Page → booking",
          unit: "percentage",
          direction: "higher_is_better",
          numerator: { kind: "step", stepId: "vsl.booking" },
          denominator: { kind: "step", stepId: "vsl.click" },
        },
        {
          id: "vsl.cost_per_booked_call",
          label: "Cost per booked call",
          unit: "currency",
          direction: "lower_is_better",
          numerator: { kind: "spend" },
          denominator: { kind: "step", stepId: "vsl.booking" },
        },
      ],
      benchmarks: {
        "vsl.page_to_booking": { kind: "range", min: 2, max: 8, unit: "percentage" },
        "vsl.cost_per_booked_call": { kind: "range", min: 50, max: 300, unit: "currency" },
      },
    },
    {
      id: "vsl.qualified",
      stageId: "intent",
      order: 4,
      label: "Application quality",
      metricLabel: "Qualified rate",
      benchmarkLabel: "50–75% qualified",
      sourceHint: "application_form",
      metrics: [
        {
          id: "vsl.qualified_rate",
          label: "Qualified rate",
          unit: "percentage",
          direction: "higher_is_better",
          numerator: { kind: "step", stepId: "vsl.qualified" },
          denominator: { kind: "step", stepId: "vsl.booking" },
        },
      ],
      benchmarks: {
        "vsl.qualified_rate": { kind: "range", min: 50, max: 75, unit: "percentage" },
      },
    },
    {
      id: "vsl.show",
      stageId: "sales_conv",
      order: 5,
      label: "Showed to the call",
      metricLabel: "Show rate",
      benchmarkLabel: "50–70%",
      sourceHint: "calendly",
      metrics: [
        {
          id: "vsl.show_rate",
          label: "Show rate",
          unit: "percentage",
          direction: "higher_is_better",
          numerator: { kind: "step", stepId: "vsl.show" },
          denominator: { kind: "step", stepId: "vsl.booking" },
        },
      ],
      benchmarks: {
        "vsl.show_rate": { kind: "range", min: 50, max: 70, unit: "percentage" },
      },
    },
    {
      id: "vsl.close",
      stageId: "sales_conv",
      order: 6,
      label: "Call taken → closed",
      metricLabel: "Close rate (of shows)",
      benchmarkLabel: "15–30%",
      sourceHint: "crm_pipeline",
      metrics: [
        {
          id: "vsl.close_rate",
          label: "Close rate (of shows)",
          unit: "percentage",
          direction: "higher_is_better",
          numerator: { kind: "step", stepId: "vsl.close" },
          // "of shows" — el denominador es explícito en el documento.
          denominator: { kind: "step", stepId: "vsl.show" },
        },
      ],
      benchmarks: {
        "vsl.close_rate": { kind: "range", min: 15, max: 30, unit: "percentage" },
      },
    },
    {
      id: "vsl.cash",
      stageId: "cash",
      order: 7,
      label: "Deposit + collected",
      metricLabel: "Booked → close · cash collected %",
      benchmarkLabel: "10–20% booked → close",
      sourceHint: "checkout",
      metrics: [
        {
          // Mismo cierre que `vsl.close_rate`, medido contra bookings en vez de
          // shows. Ver §3.4.
          id: "vsl.booked_to_close",
          label: "Booked → close",
          unit: "percentage",
          direction: "higher_is_better",
          numerator: { kind: "step", stepId: "vsl.close" },
          denominator: { kind: "step", stepId: "vsl.booking" },
        },
        {
          id: "vsl.cash_collected_pct",
          label: "Cash collected %",
          unit: "percentage",
          direction: "higher_is_better",
          numerator: { kind: "cash_collected" },
          denominator: { kind: "contracted_value" },
        },
      ],
      benchmarks: {
        "vsl.booked_to_close": { kind: "range", min: 10, max: 20, unit: "percentage" },
        "vsl.cash_collected_pct": { kind: "context_set" },
      },
    },
  ],
};
