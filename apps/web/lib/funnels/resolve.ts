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
import { getFunnelSource, missingSourceConfig, type FunnelSourceId } from "./sources";
import { getGHLStageHistorySince } from "@/lib/ghl/integration";
import { isPeriodCovered } from "@/lib/ghl/stage-transition";
import { getVTurbPeriodMeasures, type VTurbPeriodResult } from "@/lib/vturb/stats";
import { countCommentTriggers } from "@/lib/zernio/triggers";
import { getHyrosPeriodMeasures } from "@/lib/hyros/attribution";
import { getZernioClientForOrganization } from "@/lib/zernio/integration";
import { periodBounds, type FunnelPeriod } from "./period";
import {
  countAllTimeRows,
  resolveCallOutcomes,
  resolveWithSignal,
  type CallStatus,
} from "./source-signal";
import {
  aggregatePayments,
  type OrderRow,
  type TransactionRow,
} from "@/lib/payments/aggregate";
import {
  computeRetentionMeasures,
  retentionLookbackStart,
  type RetentionOrderRow,
  type RetentionTransactionRow,
} from "@/lib/payments/retention";
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
  /** Parámetros de la fuente, p. ej. `{ stageId }` para `ghl_stage_entered`. */
  config?: Record<string, unknown> | null;
};

/** Procedencia de cada step resuelto, para etiquetar las figuras en la UI. */
export type StepProvenance = {
  stepId: string;
  sourceId: FunnelSourceId | null;
  provenance: InstrumentationToolId | null;
  /** `true` cuando el step no tiene fuente configurada. */
  unbound: boolean;
  /**
   * Por qué el step no tiene número, cuando la fuente sí está bindeada.
   *
   * Distingue los tres motivos que la UI necesita separar: falta configurar un
   * parámetro, el período cae antes de que OTC tuviera historial, o la consulta
   * no devolvió señal. Los tres dan `null`, pero se arreglan distinto.
   */
  nullReason: "missing_config" | "outside_history" | null;
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

  if (error) return null;

  // Cero conversaciones puede ser un cero real o una tabla que la org no usa.
  return resolveWithSignal(count ?? 0, () =>
    countAllTimeRows(supabase, "conversations", organizationId)
  );
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

/**
 * Llamadas del período con sus estados.
 *
 * Trae los estados en vez de contar en la base porque hace falta saber si
 * ALGUNA llamada tiene resultado cargado — ver `resolveCallOutcomes`.
 */
async function loadCallStatuses(
  supabase: SupabaseClient,
  organizationId: string,
  period: FunnelPeriod
): Promise<CallStatus[] | null> {
  const { fromIso, toIso } = periodBounds(period);
  const { data, error } = await supabase
    .from("closing_calls")
    .select("status")
    .eq("organization_id", organizationId)
    .gte("scheduled_at", fromIso)
    .lt("scheduled_at", toIso);

  if (error || !data) return null;
  return data.map((row) => row.status as CallStatus);
}

/** Total de llamadas agendadas del período, sin importar el resultado. */
async function countCallsScheduled(
  supabase: SupabaseClient,
  organizationId: string,
  period: FunnelPeriod
): Promise<number | null> {
  const statuses = await loadCallStatuses(supabase, organizationId, period);
  if (statuses === null) return null;

  return resolveWithSignal(statuses.length, () =>
    countAllTimeRows(supabase, "closing_calls", organizationId)
  );
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

  if (error) return null;
  return resolveWithSignal(count ?? 0, () =>
    countAllTimeRows(supabase, "clients", organizationId)
  );
}

/**
 * Clicks de anuncios del período (M04).
 *
 * Sale de `ad_metrics_daily`, que puebla el cron de I-1. Si la org no tiene
 * ninguna fila capturada devuelve `null` y no `0`: que no se haya capturado
 * nada no significa que no hubo clicks (§9.1).
 */
async function sumAdClicks(
  supabase: SupabaseClient,
  organizationId: string,
  period: FunnelPeriod
): Promise<number | null> {
  const { data, error } = await supabase
    .from("ad_metrics_daily")
    .select("clicks")
    .eq("organization_id", organizationId)
    .gte("metric_date", period.start)
    .lte("metric_date", period.end);

  if (error || !data || data.length === 0) return null;
  return data.reduce((sum, row) => sum + Number(row.clicks ?? 0), 0);
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

// ─── GHL: conteos por etapa desde el historial propio ─────────────────────────
//
// ⭐ Estos tres resolvers NO leen `ghl_opportunities` (el estado de hoy) sino
// `ghl_stage_transitions` (lo que pasó durante el período). Es la diferencia que
// justifica toda la unidad I-4: la API de GHL sólo sabe dónde está cada
// oportunidad ahora, y el documento fuente pregunta por cuántas pasaron.

/**
 * Oportunidades distintas cuya transición cae en el período.
 *
 * Cuenta oportunidades y no filas: si una volvió a entrar a la misma etapa dos
 * veces en el período, es una sola oportunidad que llegó ahí.
 */
async function countDistinctTransitions(
  supabase: SupabaseClient,
  organizationId: string,
  period: FunnelPeriod,
  filter: { column: string; value: string }
): Promise<number | null> {
  const { fromIso, toIso } = periodBounds(period);

  const { data, error } = await supabase
    .from("ghl_stage_transitions")
    .select("opportunity_external_id")
    .eq("organization_id", organizationId)
    .eq(filter.column, filter.value)
    .gte("occurred_at", fromIso)
    .lt("occurred_at", toIso);

  if (error || !data) return null;

  return new Set(data.map((row) => row.opportunity_external_id as string)).size;
}

/**
 * Medidas de Hyros del período, memoizadas por `resolveFunnel`.
 *
 * Varias fuentes y el ROAS by-source leen del mismo reporte; pedirlo una vez por
 * consumidor gastaría cuota de Hyros sin necesidad (30 req/s, 1000 por minuto,
 * y cada reporte recorre todas las fuentes de una cuenta publicitaria).
 */
type HyrosLoader = () => Promise<Awaited<ReturnType<typeof getHyrosPeriodMeasures>>>;

function createHyrosLoader(organizationId: string, period: FunnelPeriod): HyrosLoader {
  let inFlight: ReturnType<typeof getHyrosPeriodMeasures> | null = null;
  return () => {
    inFlight ??= getHyrosPeriodMeasures(organizationId, period.start, period.end);
    return inFlight;
  };
}

/**
 * Comentarios de Zernio como disparadores del DM (M34).
 *
 * ⚠️ Es un **fetch en vivo**: `listComments` es un inbox, no un historial, y no
 * acepta filtro de fecha. `countCommentTriggers` decide si la ventana alcanza
 * para responder por el período o si hay que devolver `null`.
 */
async function countZernioTriggers(
  organizationId: string,
  period: FunnelPeriod
): Promise<number | null> {
  const { fromIso, toIso } = periodBounds(period);
  try {
    const client = await getZernioClientForOrganization(organizationId);
    if (!client) return null;
    const { comments } = await client.listComments();
    return countCommentTriggers(comments ?? [], fromIso, toIso).value;
  } catch {
    // Zernio sin conectar o caído: "no sabemos", no "no hubo comentarios".
    return null;
  }
}

/** Fuentes que dependen del historial propio de GHL y de su período ciego. */
const GHL_HISTORY_SOURCES: readonly FunnelSourceId[] = [
  "ghl_opportunities_created",
  "ghl_stage_entered",
  "ghl_opportunities_won",
];

// ─── VTurb: el video de la landing ────────────────────────────────────────────

/** Fuentes que salen de VTurb. Todas piden un `playerId` en la config. */
const VTURB_SOURCES: readonly FunnelSourceId[] = [
  "vturb_page_views",
  "vturb_plays",
  "vturb_cta_clicks",
  "vturb_reached_cta",
];

/**
 * Medidas de VTurb para un player, memoizadas por `resolveFunnel`.
 *
 * Tres steps del embudo VSL pueden apuntar al mismo video, y cada consulta a
 * VTurb cuesta cuota — la doc avisa que una sola llamada HTTP puede contar como
 * más de una query. Con esto se pide una vez por player, no una por step.
 */
type VTurbLoader = (playerId: string) => Promise<VTurbPeriodResult>;

function createVTurbLoader(organizationId: string, period: FunnelPeriod): VTurbLoader {
  const inFlight = new Map<string, Promise<VTurbPeriodResult>>();

  return (playerId: string) => {
    const existing = inFlight.get(playerId);
    if (existing) return existing;

    const promise = getVTurbPeriodMeasures(
      organizationId,
      playerId,
      period.start,
      period.end
    );
    inFlight.set(playerId, promise);
    return promise;
  };
}

// ─── WebinarJam: registrados, asistentes y stick rate ─────────────────────────
//
// Salen de contar filas de `webinarjam_registrants` dentro del período. Se
// persisten las personas y no un agregado porque la API de WebinarJam **no
// acepta rangos de fecha arbitrarios**: su filtro es una lista de presets (hoy,
// esta semana, últimos 30 días). El recorte al período del embudo se hace acá.

/**
 * Registrados en el período (M13), por **fecha de registro**.
 *
 * Distinto de M14, que se cuenta por fecha de asistencia: son dos preguntas
 * distintas y el documento las separa en dos filas.
 */
async function countWebinarRegistrants(
  supabase: SupabaseClient,
  organizationId: string,
  period: FunnelPeriod,
  webinarId: string
): Promise<number | null> {
  const { fromIso, toIso } = periodBounds(period);
  const { count, error } = await supabase
    .from("webinarjam_registrants")
    .select("id", { count: "exact", head: true })
    .eq("organization_id", organizationId)
    .eq("webinar_external_id", webinarId)
    .gte("signup_at", fromIso)
    .lt("signup_at", toIso);

  if (error) return null;
  return resolveWithSignal(count ?? 0, () =>
    countAllTimeRows(supabase, "webinarjam_registrants", organizationId)
  );
}

/**
 * Asistentes en el período (M14), **vivo + replay**, como pide el documento
 * ("Showed up (live + replay)").
 *
 * Se cuenta a la persona una sola vez aunque haya visto el vivo y el replay.
 */
async function countWebinarAttendees(
  supabase: SupabaseClient,
  organizationId: string,
  period: FunnelPeriod,
  webinarId: string
): Promise<number | null> {
  const { fromIso, toIso } = periodBounds(period);
  const { data, error } = await supabase
    .from("webinarjam_registrants")
    .select("email, attended_live, attended_replay, live_watched_at, replay_watched_at")
    .eq("organization_id", organizationId)
    .eq("webinar_external_id", webinarId);

  if (error || !data) return null;

  const inPeriod = (value: unknown) =>
    typeof value === "string" && value >= fromIso && value < toIso;

  const attendees = new Set(
    data
      .filter(
        (row) =>
          (row.attended_live === true && inPeriod(row.live_watched_at)) ||
          (row.attended_replay === true && inPeriod(row.replay_watched_at))
      )
      .map((row) => row.email as string)
  );

  // Si nadie tiene asistencia registrada, no es que nadie asistió: es que la
  // API no lo dijo (o el sync todavía no corrió). Mismo criterio que las
  // llamadas de cierre en `resolveCallOutcomes`.
  const hasSignal = data.some(
    (row) => row.attended_live !== null || row.attended_replay !== null
  );
  if (attendees.size === 0 && !hasSignal) return null;

  return attendees.size;
}

/**
 * Se quedaron hasta la oferta (M15).
 *
 * ⭐ `stayed_past_pitch` es `null` mientras el webinar no tenga configurado el
 * segundo de la oferta: la API de WebinarJam **no publica ese dato** y sin él la
 * pregunta no se puede hacer. Si todas las filas están en `null`, la medida no
 * existe — devolver `0` diría que nadie se quedó, que es una afirmación muy
 * distinta.
 */
async function countWebinarStayedToPitch(
  supabase: SupabaseClient,
  organizationId: string,
  period: FunnelPeriod,
  webinarId: string
): Promise<number | null> {
  const { fromIso, toIso } = periodBounds(period);
  const { data, error } = await supabase
    .from("webinarjam_registrants")
    .select("email, stayed_past_pitch, live_watched_at")
    .eq("organization_id", organizationId)
    .eq("webinar_external_id", webinarId);

  if (error || !data) return null;

  const measured = data.filter((row) => row.stayed_past_pitch !== null);
  if (measured.length === 0) return null;

  const stayed = new Set(
    measured
      .filter(
        (row) =>
          row.stayed_past_pitch === true &&
          typeof row.live_watched_at === "string" &&
          row.live_watched_at >= fromIso &&
          row.live_watched_at < toIso
      )
      .map((row) => row.email as string)
  );

  return stayed.size;
}

// ─── Formularios: aplicaciones enviadas y calificadas ─────────────────────────
//
// `form_responses` ya se puebla con las integraciones de Typeform y Google
// Forms. Es la única fila del documento que OTC cubría entera desde antes del
// módulo de embudos, pero no tenía fuente: estas dos la conectan.

async function countFormSubmissions(
  supabase: SupabaseClient,
  organizationId: string,
  period: FunnelPeriod,
  formId: string
): Promise<number | null> {
  const { fromIso, toIso } = periodBounds(period);
  const { count, error } = await supabase
    .from("form_responses")
    .select("id", { count: "exact", head: true })
    .eq("organization_id", organizationId)
    .eq("form_id", formId)
    // Una respuesta a medias no es una aplicación enviada.
    .eq("is_complete", true)
    .gte("submitted_at", fromIso)
    .lt("submitted_at", toIso);

  if (error) return null;
  return resolveWithSignal(count ?? 0, () =>
    countAllTimeRows(supabase, "form_responses", organizationId)
  );
}

/**
 * Aplicaciones calificadas (M18).
 *
 * ⭐ La calificación la pone la IA y puede no haber corrido todavía. Si NINGUNA
 * respuesta del período tiene `ai_lead_qualification`, la medida es `null`: cero
 * calificadas diría que ninguna aplicación servía, cuando la verdad es que nadie
 * las evaluó. Es el mismo caso que las llamadas sin resultado cargado.
 */
async function countFormQualified(
  supabase: SupabaseClient,
  organizationId: string,
  period: FunnelPeriod,
  formId: string
): Promise<number | null> {
  const { fromIso, toIso } = periodBounds(period);
  const { data, error } = await supabase
    .from("form_responses")
    .select("ai_lead_qualification")
    .eq("organization_id", organizationId)
    .eq("form_id", formId)
    .eq("is_complete", true)
    .gte("submitted_at", fromIso)
    .lt("submitted_at", toIso);

  if (error || !data) return null;
  if (data.length === 0) return null;

  const scored = data.filter((row) => row.ai_lead_qualification !== null);
  if (scored.length === 0) return null;

  return scored.filter(
    (row) =>
      row.ai_lead_qualification === "qualified" ||
      row.ai_lead_qualification === "highly_qualified"
  ).length;
}

async function resolveSource(
  sourceId: FunnelSourceId,
  supabase: SupabaseClient,
  organizationId: string,
  period: FunnelPeriod,
  config: Record<string, unknown> | null | undefined,
  loadVTurb: VTurbLoader,
  loadHyros: HyrosLoader
): Promise<number | null> {
  switch (sourceId) {
    case "zernio_comment_triggers":
      return countZernioTriggers(organizationId, period);
    case "hyros_optins":
      return (await loadHyros()).attributedLeads;
    case "hyros_landing_visitors":
      return (await loadHyros()).landingVisitors;
    case "ad_clicks":
      return sumAdClicks(supabase, organizationId, period);
    case "conversations_opened":
      return countConversationsOpened(supabase, organizationId, period);
    case "conversations_replied":
      return countConversationsReplied(supabase, organizationId, period);
    case "conversations_booked":
      return countConversationsBooked(supabase, organizationId, period);
    case "closing_calls_scheduled":
      return countCallsScheduled(supabase, organizationId, period);
    case "closing_calls_attended": {
      const statuses = await loadCallStatuses(supabase, organizationId, period);
      return statuses === null ? null : resolveCallOutcomes(statuses).attended;
    }
    case "closing_calls_closed": {
      const statuses = await loadCallStatuses(supabase, organizationId, period);
      return statuses === null ? null : resolveCallOutcomes(statuses).closed;
    }
    case "clients_new":
      return countNewClients(supabase, organizationId, period);
    case "client_payments_count":
      return countClientPayments(supabase, organizationId, period);
    case "ghl_opportunities_created":
      return countDistinctTransitions(supabase, organizationId, period, {
        column: "kind",
        value: "created",
      });
    case "ghl_stage_entered": {
      // La cobertura del período y la config ya se validaron antes de llegar
      // acá; el guard queda igual porque un `stageId` vacío contaría todo.
      const stageId = config?.stageId;
      if (typeof stageId !== "string" || !stageId.trim()) return null;
      return countDistinctTransitions(supabase, organizationId, period, {
        column: "to_stage_external_id",
        value: stageId,
      });
    }
    case "ghl_opportunities_won":
      return countDistinctTransitions(supabase, organizationId, period, {
        column: "status",
        value: "won",
      });
    case "webinar_registrants":
    case "webinar_attendees":
    case "webinar_stayed_to_pitch": {
      const webinarId = config?.webinarId;
      if (typeof webinarId !== "string" || !webinarId.trim()) return null;
      if (sourceId === "webinar_registrants") {
        return countWebinarRegistrants(supabase, organizationId, period, webinarId);
      }
      if (sourceId === "webinar_attendees") {
        return countWebinarAttendees(supabase, organizationId, period, webinarId);
      }
      return countWebinarStayedToPitch(supabase, organizationId, period, webinarId);
    }
    case "vturb_page_views":
    case "vturb_plays":
    case "vturb_cta_clicks":
    case "vturb_reached_cta": {
      const playerId = config?.playerId;
      if (typeof playerId !== "string" || !playerId.trim()) return null;
      const measures = await loadVTurb(playerId);
      if (sourceId === "vturb_page_views") return measures.pageViews;
      if (sourceId === "vturb_plays") return measures.plays;
      if (sourceId === "vturb_cta_clicks") return measures.ctaClicks;
      // `reachedCta` ya viene en `null` cuando el player no tiene pitch time:
      // `total_over_pitch` sin un segundo de pitch válido cuenta a casi todos.
      return measures.reachedCta;
    }
    case "form_submissions":
    case "form_qualified": {
      const formId = config?.formId;
      if (typeof formId !== "string" || !formId.trim()) return null;
      return sourceId === "form_submissions"
        ? countFormSubmissions(supabase, organizationId, period, formId)
        : countFormQualified(supabase, organizationId, period, formId);
    }
    default:
      return null;
  }
}

// ─── Medidas a nivel organización ─────────────────────────────────────────────

/**
 * Medidas que no cuelgan de un step: dinero, clientes, alcance.
 *
 * El dinero sale de Whop y Fanbasis (`payment_orders` y `payment_transactions`),
 * que es lo que el documento fuente asigna a la etapa Cash. Los ads salen de
 * `ad_metrics_daily`. `purchases` y `retention_rate` siguen sin fuente: son la
 * unidad I-9 del plan y hacen falta para LTV.
 */
async function resolveOrgMeasures(
  supabase: SupabaseClient,
  organizationId: string,
  period: FunnelPeriod,
  loadHyros: HyrosLoader
): Promise<OrgMeasures> {
  const { fromIso, toIso } = periodBounds(period);

  // La ventana de retención es más ancha que el período a propósito: "cuántas
  // veces compra un cliente" no se puede medir en 7 días — ver
  // lib/payments/retention.ts.
  const lookbackFromIso = retentionLookbackStart(toIso);

  const [orderRows, transactionRows, ads, lookbackOrderRows] = await Promise.all([
    supabase
      .from("payment_orders")
      .select("external_id, customer_external_id, customer_email, contract_value, ordered_at")
      .eq("organization_id", organizationId)
      .gte("ordered_at", fromIso)
      .lt("ordered_at", toIso),
    supabase
      .from("payment_transactions")
      .select("external_id, customer_external_id, customer_email, kind, amount, occurred_at")
      .eq("organization_id", organizationId)
      .gte("occurred_at", fromIso)
      .lt("occurred_at", toIso),
    supabase
      .from("ad_metrics_daily")
      .select("spend, reach, impressions")
      .eq("organization_id", organizationId)
      .gte("metric_date", period.start)
      .lte("metric_date", period.end),
    supabase
      .from("payment_orders")
      .select("customer_external_id, customer_email, is_recurring, ordered_at")
      .eq("organization_id", organizationId)
      .gte("ordered_at", lookbackFromIso)
      .lt("ordered_at", toIso),
  ]);

  // Whop y Fanbasis son los que el documento asigna a la etapa Cash (§05).
  // Si la consulta falla, todo queda en `null`: no se puede afirmar que se
  // cobró cero.
  const money =
    orderRows.error || transactionRows.error
      ? null
      : aggregatePayments(
          (orderRows.data ?? []) as OrderRow[],
          (transactionRows.data ?? []) as TransactionRow[]
        );

  // Sin filas capturadas, las medidas de ads quedan en `null`: no haber
  // capturado no es lo mismo que no haber gastado (§9.1).
  const adRows = ads.error ? null : (ads.data ?? []);
  const hasAdData = adRows !== null && adRows.length > 0;
  const sumAds = (field: "spend" | "reach" | "impressions") =>
    hasAdData ? adRows.reduce((sum, row) => sum + Number(row[field] ?? 0), 0) : null;

  // M32 y M33 (unidad I-9). Sin órdenes en la ventana, las dos quedan en `null`
  // con su motivo, y el LTV no se calcula — que es lo correcto: un LTV apoyado
  // en una retención inventada es peor que no tener LTV.
  const retention =
    lookbackOrderRows.error || transactionRows.error
      ? null
      : computeRetentionMeasures(
          (lookbackOrderRows.data ?? []) as RetentionOrderRow[],
          (transactionRows.data ?? []) as RetentionTransactionRow[],
          fromIso
        );

  // ⭐ Atribución de Hyros: medidas propias, no un respaldo de las de arriba.
  // El ROAS blended se calcula con el revenue de la pasarela y el spend de Meta;
  // el by-source, con estas dos. Que den distinto es el punto.
  const hyros = await loadHyros().catch(() => null);

  return {
    spend: sumAds("spend"),
    reach: sumAds("reach"),
    impressions: sumAds("impressions"),
    attributed_revenue: hyros?.attributedRevenue ?? null,
    attributed_spend: hyros?.attributedSpend ?? null,
    purchases: retention?.purchasesPerCustomer ?? null,
    retention_rate: retention?.retentionRate ?? null,
    revenue: money?.revenue ?? null,
    cash_collected: money?.cashCollected ?? null,
    contracted_value: money?.contractedValue ?? null,
    customers: money?.newCustomers ?? null,
    orders: money?.orders ?? null,
  };
}

// ─── Entrada principal ────────────────────────────────────────────────────────

/**
 * Player de VTurb configurado en el embudo, si hay alguno.
 *
 * Si hubiera más de uno, gana el primero: el `avg_watch_pct` del embudo es el de
 * su VSL, y promediar dos videos distintos daría un número que no describe a
 * ninguno de los dos.
 */
function findVTurbPlayerId(bindings: StepBindingRow[]): string | null {
  for (const binding of bindings) {
    if (!VTURB_SOURCES.includes(binding.source_id as FunnelSourceId)) continue;
    const playerId = binding.config?.playerId;
    if (typeof playerId === "string" && playerId.trim()) return playerId;
  }
  return null;
}

export async function resolveFunnel(
  supabase: SupabaseClient,
  instance: FunnelInstanceRow,
  bindings: StepBindingRow[],
  period: FunnelPeriod
): Promise<ResolvedFunnelData> {
  const template = requireFunnelTemplate(instance.template_id);
  const bindingByStep = new Map(
    bindings.map((b) => [b.step_id, { sourceId: b.source_id, config: b.config ?? null }])
  );

  const stepCounts: StepCounts = {};
  const provenance: StepProvenance[] = [];

  // El borde del período ciego de GHL se lee una sola vez y sólo si hace falta:
  // la mayoría de los embudos no usa fuentes de historial de etapas.
  const usesGHLHistory = template.steps.some((step) => {
    const sourceId = bindingByStep.get(step.id)?.sourceId;
    return sourceId ? GHL_HISTORY_SOURCES.includes(sourceId as FunnelSourceId) : false;
  });
  const ghlHistorySince = usesGHLHistory
    ? await getGHLStageHistorySince(instance.organization_id).catch(() => null)
    : null;
  const { fromIso: periodStartIso } = periodBounds(period);

  const loadVTurb = createVTurbLoader(instance.organization_id, period);
  const loadHyros = createHyrosLoader(instance.organization_id, period);

  const resolved = await Promise.all(
    template.steps.map(async (step) => {
      const binding = bindingByStep.get(step.id);
      const source = binding ? getFunnelSource(binding.sourceId) : undefined;

      if (!source) {
        return {
          stepId: step.id,
          count: null,
          entry: {
            stepId: step.id,
            sourceId: null,
            provenance: null,
            unbound: true,
            nullReason: null,
          } satisfies StepProvenance,
        };
      }

      const entry = {
        stepId: step.id,
        sourceId: source.id,
        provenance: source.provenance,
        unbound: false,
        nullReason: null,
      } satisfies StepProvenance;

      // Falta elegir la etapa de GHL: sin eso la fuente no significa nada.
      if (missingSourceConfig(source, binding?.config).length > 0) {
        return {
          stepId: step.id,
          count: null,
          entry: { ...entry, nullReason: "missing_config" } satisfies StepProvenance,
        };
      }

      // ⭐ Período ciego: el historial de etapas arranca con el primer webhook.
      // Antes de esa fecha OTC no estaba mirando, y las cero transiciones que
      // devolvería la consulta significan "no lo sabemos", no "no pasó nada".
      if (
        GHL_HISTORY_SOURCES.includes(source.id) &&
        !isPeriodCovered(ghlHistorySince, periodStartIso)
      ) {
        return {
          stepId: step.id,
          count: null,
          entry: { ...entry, nullReason: "outside_history" } satisfies StepProvenance,
        };
      }

      const count = await resolveSource(
        source.id,
        supabase,
        instance.organization_id,
        period,
        binding?.config,
        loadVTurb,
        loadHyros
      );

      return { stepId: step.id, count, entry };
    })
  );

  for (const item of resolved) {
    stepCounts[item.stepId] = item.count;
    provenance.push(item.entry);
  }

  const measures = await resolveOrgMeasures(
    supabase,
    instance.organization_id,
    period,
    loadHyros
  );

  // ⭐ `avg_watch_pct` (M11) no es un conteo de step: es un promedio que reporta
  // el player, y el documento lo modela como métrica sin denominador
  // (`{ kind: "reported" }`). Se toma del mismo player que ya alimenta los steps
  // del embudo, así que no cuesta una consulta extra.
  const vturbPlayerId = findVTurbPlayerId(bindings);
  if (vturbPlayerId) {
    const vturb = await loadVTurb(vturbPlayerId);
    measures.reported = { ...measures.reported, avg_watch_pct: vturb.avgWatchPct };
  }

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
