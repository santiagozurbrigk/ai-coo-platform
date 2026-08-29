/**
 * lib/funnels/resolve.ts
 *
 * Capa de IO del motor de embudos: trae los números reales de Supabase para un
 * período y los entrega a la capa pura (`compute.ts`).
 *
 * Sólo servidor: se importa desde Server Components y Server Actions. No se
 * re-exporta desde `index.ts` para que ningún Client Component lo arrastre.
 *
 * REGLA (§9.1): si una fuente no está bindeada, o la consulta falla, el valor es
 * `null` — nunca `0`. Un `0` acá haría que el diagnóstico marque como rotura de
 * negocio lo que en realidad es un hueco de instrumentación.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { computeFunnel, type OrgMeasures, type StepCounts } from "./compute";
import { getFunnelSource, type FunnelSourceId } from "./sources";
import { periodBounds, type FunnelPeriod } from "./period";
import { requireFunnelTemplate } from "./templates";
import type { FunnelTemplate } from "./types";
import type { InstrumentationToolId } from "./instrumentation";

export type FunnelInstanceRow = {
  id: string;
  organization_id: string;
  template_id: string;
  name: string;
  product_id: string | null;
  currency: string;
  price_point: number;
  reporting_timezone: string;
  is_active: boolean;
};

export type StepBindingRow = {
  step_id: string;
  source_id: string;
};

/** Procedencia de cada step resuelto, para etiquetar las figuras en la UI. */
export type StepProvenance = {
  stepId: string;
  sourceId: FunnelSourceId | null;
  provenance: InstrumentationToolId | null;
  /** `true` cuando el step no tiene fuente configurada. */
  unbound: boolean;
};

export type ResolvedFunnelData = {
  instance: FunnelInstanceRow;
  template: FunnelTemplate;
  period: FunnelPeriod;
  stepCounts: StepCounts;
  measures: OrgMeasures;
  provenance: StepProvenance[];
  computed: ReturnType<typeof computeFunnel>;
};

// ─── Resolución de fuentes ────────────────────────────────────────────────────

async function countConversationsOpened(
  supabase: SupabaseClient,
  organizationId: string,
  period: FunnelPeriod
): Promise<number | null> {
  const { fromIso, toIso } = periodBounds(period);
  const { count, error } = await supabase
    .from("conversations")
    .select("id", { count: "exact", head: true })
    .eq("organization_id", organizationId)
    .gte("created_at", fromIso)
    .lt("created_at", toIso);
  return error ? null : (count ?? null);
}

async function countConversationsReplied(
  supabase: SupabaseClient,
  organizationId: string,
  period: FunnelPeriod
): Promise<number | null> {
  // "Two-way, replied to qualifier": hubo más de un mensaje en el hilo.
  const { fromIso, toIso } = periodBounds(period);
  const { data, error } = await supabase
    .from("conversations")
    .select("messages")
    .eq("organization_id", organizationId)
    .gte("created_at", fromIso)
    .lt("created_at", toIso);
  if (error || !data) return null;
  return data.filter((row) => Array.isArray(row.messages) && row.messages.length > 1).length;
}

async function countConversationsBooked(
  supabase: SupabaseClient,
  organizationId: string,
  period: FunnelPeriod
): Promise<number | null> {
  const { fromIso, toIso } = periodBounds(period);
  const { data, error } = await supabase
    .from("conversations")
    .select("status, tag")
    .eq("organization_id", organizationId)
    .gte("created_at", fromIso)
    .lt("created_at", toIso);
  if (error || !data) return null;
  return data.filter(
    (row) => row.status === "booked" || row.tag === "agendado" || row.tag === "closeado"
  ).length;
}

async function countClosingCalls(
  supabase: SupabaseClient,
  organizationId: string,
  period: FunnelPeriod,
  statuses: string[] | null
): Promise<number | null> {
  const { fromIso, toIso } = periodBounds(period);
  let query = supabase
    .from("closing_calls")
    .select("id", { count: "exact", head: true })
    .eq("organization_id", organizationId)
    .gte("scheduled_at", fromIso)
    .lt("scheduled_at", toIso);
  if (statuses) query = query.in("status", statuses);
  const { count, error } = await query;
  return error ? null : (count ?? null);
}

async function countNewClients(
  supabase: SupabaseClient,
  organizationId: string,
  period: FunnelPeriod
): Promise<number | null> {
  const { count, error } = await supabase
    .from("clients")
    .select("id", { count: "exact", head: true })
    .eq("organization_id", organizationId)
    .gte("join_date", period.start)
    .lte("join_date", period.end);
  return error ? null : (count ?? null);
}

async function countClientPayments(
  supabase: SupabaseClient,
  organizationId: string,
  period: FunnelPeriod
): Promise<number | null> {
  const { count, error } = await supabase
    .from("client_payments")
    .select("id", { count: "exact", head: true })
    .eq("organization_id", organizationId)
    .gte("payment_date", period.start)
    .lte("payment_date", period.end);
  return error ? null : (count ?? null);
}

async function resolveSource(
  sourceId: FunnelSourceId,
  supabase: SupabaseClient,
  organizationId: string,
  period: FunnelPeriod
): Promise<number | null> {
  switch (sourceId) {
    case "conversations_opened":
      return countConversationsOpened(supabase, organizationId, period);
    case "conversations_replied":
      return countConversationsReplied(supabase, organizationId, period);
    case "conversations_booked":
      return countConversationsBooked(supabase, organizationId, period);
    case "closing_calls_scheduled":
      return countClosingCalls(supabase, organizationId, period, null);
    case "closing_calls_attended":
      return countClosingCalls(supabase, organizationId, period, ["closed", "not_closed"]);
    case "closing_calls_closed":
      return countClosingCalls(supabase, organizationId, period, ["closed"]);
    case "clients_new":
      return countNewClients(supabase, organizationId, period);
    case "client_payments_count":
      return countClientPayments(supabase, organizationId, period);
    default:
      return null;
  }
}

// ─── Medidas a nivel organización ─────────────────────────────────────────────

/**
 * Medidas que no cuelgan de un step: dinero, clientes, alcance.
 *
 * Varias quedan en `null` a propósito porque OTC todavía no tiene la fuente:
 * el spend de Meta llega vía Zernio como live-fetch y no es periodizable hacia
 * atrás (§9.3), y reach / impressions dependen de la misma integración.
 */
async function resolveOrgMeasures(
  supabase: SupabaseClient,
  organizationId: string,
  period: FunnelPeriod
): Promise<OrgMeasures> {
  const [payments, clients] = await Promise.all([
    supabase
      .from("client_payments")
      .select("amount")
      .eq("organization_id", organizationId)
      .gte("payment_date", period.start)
      .lte("payment_date", period.end),
    supabase
      .from("clients")
      .select("total_amount")
      .eq("organization_id", organizationId)
      .gte("join_date", period.start)
      .lte("join_date", period.end),
  ]);

  const cashCollected = payments.error
    ? null
    : (payments.data ?? []).reduce((sum, row) => sum + Number(row.amount ?? 0), 0);

  const contractedValue = clients.error
    ? null
    : (clients.data ?? []).reduce((sum, row) => sum + Number(row.total_amount ?? 0), 0);

  const customers = clients.error ? null : (clients.data ?? []).length;
  const orders = payments.error ? null : (payments.data ?? []).length;

  return {
    // Sin fuente todavía: Meta Ads vía Zernio es live-fetch, no periodizable.
    spend: null,
    reach: null,
    impressions: null,
    purchases: null,
    retention_rate: null,
    revenue: cashCollected,
    cash_collected: cashCollected,
    contracted_value: contractedValue,
    customers,
    orders,
  };
}

// ─── Entrada principal ────────────────────────────────────────────────────────

export async function resolveFunnel(
  supabase: SupabaseClient,
  instance: FunnelInstanceRow,
  bindings: StepBindingRow[],
  period: FunnelPeriod
): Promise<ResolvedFunnelData> {
  const template = requireFunnelTemplate(instance.template_id);
  const bindingByStep = new Map(bindings.map((b) => [b.step_id, b.source_id]));

  const stepCounts: StepCounts = {};
  const provenance: StepProvenance[] = [];

  const resolved = await Promise.all(
    template.steps.map(async (step) => {
      const sourceId = bindingByStep.get(step.id);
      const source = sourceId ? getFunnelSource(sourceId) : undefined;

      if (!source) {
        return {
          stepId: step.id,
          count: null,
          entry: {
            stepId: step.id,
            sourceId: null,
            provenance: null,
            unbound: true,
          } satisfies StepProvenance,
        };
      }

      const count = await resolveSource(
        source.id,
        supabase,
        instance.organization_id,
        period
      );

      return {
        stepId: step.id,
        count,
        entry: {
          stepId: step.id,
          sourceId: source.id,
          provenance: source.provenance,
          unbound: false,
        } satisfies StepProvenance,
      };
    })
  );

  for (const item of resolved) {
    stepCounts[item.stepId] = item.count;
    provenance.push(item.entry);
  }

  const measures = await resolveOrgMeasures(supabase, instance.organization_id, period);

  return {
    instance,
    template,
    period,
    stepCounts,
    measures,
    provenance,
    computed: computeFunnel(template, stepCounts, measures),
  };
}
