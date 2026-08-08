"use server";

import { requireOrganizationId } from "@/lib/auth/bootstrap";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getCurrentProfile } from "@/lib/auth/bootstrap";
import {
  syncCloserCalendlyEvents,
  getCloserCalendlyIntegration,
  disconnectCloserCalendly,
  type CloserSyncResult,
} from "@/lib/calendly/closer-sync";

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type CloserProfile = {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  commission_pct: number | null;
  calendly_connected: boolean;
  calendly_user_uri: string | null;
  last_calendly_sync: string | null;
};

export type CloserMetrics = {
  closerId: string;
  closerName: string | null;
  closerEmail: string | null;
  avatarUrl: string | null;
  commissionPct: number | null;
  totalCalls: number;
  scheduledCalls: number;
  completedCalls: number;
  cancelledCalls: number;
  closedCalls: number;
  conversionPct: number;
  totalRevenue: number;
  commissionAmount: number;
  avgScore: number | null;
  calendlyConnected: boolean;
};

// ─── Helpers internos ─────────────────────────────────────────────────────────

/**
 * Devuelve los profiles de la org que tienen un rol ILIKE 'closer'.
 * Incluye también al founder si pidió verse a sí mismo.
 */
async function getCloserProfileIds(
  organizationId: string,
  supabase: Awaited<ReturnType<typeof createClient>>
): Promise<string[]> {
  // Profiles con role de closer (custom_role_id → team_roles.name ILIKE 'closer')
  const { data: roleRows } = await supabase
    .from("team_roles")
    .select("id")
    .eq("organization_id", organizationId)
    .ilike("name", "%closer%");

  const roleIds = (roleRows ?? []).map((r) => r.id as string);

  if (!roleIds.length) return [];

  const { data: profileRows } = await supabase
    .from("profiles")
    .select("id")
    .eq("organization_id", organizationId)
    .in("custom_role_id", roleIds);

  return (profileRows ?? []).map((p) => p.id as string);
}

// ─── Acciones públicas ────────────────────────────────────────────────────────

/**
 * Lista los closers de la org con su estado de integración Calendly.
 */
export async function getClosersWithCalendlyStatusAction(): Promise<CloserProfile[]> {
  if (!isSupabaseConfigured()) return [];

  const organizationId = await requireOrganizationId();
  const supabase = await createClient();

  const closerIds = await getCloserProfileIds(organizationId, supabase);
  if (!closerIds.length) return [];

  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("id, full_name, email, avatar_url, commission_pct")
    .in("id", closerIds);

  if (error || !profiles?.length) return [];

  // Buscar integraciones Calendly para estos profiles
  const admin = createAdminClient();
  const { data: integrations } = await admin
    .from("team_member_integrations")
    .select("user_id, config, last_sync_at")
    .eq("organization_id", organizationId)
    .eq("integration_type", "calendly")
    .in("user_id", closerIds);

  const integrationMap = new Map(
    (integrations ?? []).map((i) => [
      i.user_id as string,
      {
        config: i.config as { access_token?: string; calendly_user_uri?: string } | null,
        last_sync_at: i.last_sync_at as string | null,
      },
    ])
  );

  return profiles.map((p) => {
    const integ = integrationMap.get(p.id);
    return {
      id: p.id,
      full_name: p.full_name,
      email: p.email,
      avatar_url: p.avatar_url,
      commission_pct: p.commission_pct,
      calendly_connected: !!(integ?.config?.access_token),
      calendly_user_uri: integ?.config?.calendly_user_uri ?? null,
      last_calendly_sync: integ?.last_sync_at ?? null,
    };
  });
}

/**
 * Métricas de cada closer: llamadas, conversión, revenue, comisión, score IA.
 */
export async function getCloserMetricsAction(
  since?: string // ISO date string; default últimos 90 días
): Promise<CloserMetrics[]> {
  if (!isSupabaseConfigured()) return [];

  const organizationId = await requireOrganizationId();
  const supabase = await createClient();

  const closerIds = await getCloserProfileIds(organizationId, supabase);
  if (!closerIds.length) return [];

  const sinceDate =
    since ?? new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();

  // Llamadas agrupadas por closer
  const { data: calls, error: callsError } = await supabase
    .from("closing_calls")
    .select("closer_id, status, amount_closed")
    .eq("organization_id", organizationId)
    .in("closer_id", closerIds)
    .gte("scheduled_at", sinceDate);

  if (callsError) {
    console.error("[getCloserMetricsAction] calls:", callsError.message);
    return [];
  }

  // Scores de call_analyses agrupados por closer_id
  const { data: analyses } = await supabase
    .from("call_analyses")
    .select("closer_id, overall_score")
    .eq("organization_id", organizationId)
    .in("closer_id", closerIds)
    .gte("call_date", sinceDate);

  // Profiles + comisión
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, email, avatar_url, commission_pct")
    .in("id", closerIds);

  // Integración calendly
  const admin = createAdminClient();
  const { data: integrations } = await admin
    .from("team_member_integrations")
    .select("user_id, config")
    .eq("organization_id", organizationId)
    .eq("integration_type", "calendly")
    .in("user_id", closerIds);

  const integrationMap = new Map(
    (integrations ?? []).map((i) => [
      i.user_id as string,
      !!(i.config as { access_token?: string } | null)?.access_token,
    ])
  );

  // Agrupar llamadas por closer
  type CallAgg = {
    total: number;
    scheduled: number;
    completed: number;
    cancelled: number;
    closed: number;
    revenue: number;
  };

  const callAgg = new Map<string, CallAgg>();
  for (const call of calls ?? []) {
    if (!call.closer_id) continue;
    const agg = callAgg.get(call.closer_id) ?? {
      total: 0,
      scheduled: 0,
      completed: 0,
      cancelled: 0,
      closed: 0,
      revenue: 0,
    };
    agg.total += 1;
    if (call.status === "scheduled") agg.scheduled += 1;
    if (call.status === "completed") agg.completed += 1;
    if (call.status === "cancelled") agg.cancelled += 1;
    if (call.status === "closed") {
      agg.closed += 1;
      agg.revenue += Number(call.amount_closed ?? 0);
    }
    callAgg.set(call.closer_id, agg);
  }

  // Agrupar scores por closer
  const scoreAgg = new Map<string, number[]>();
  for (const a of analyses ?? []) {
    if (!a.closer_id) continue;
    const scores = scoreAgg.get(a.closer_id) ?? [];
    if (a.overall_score != null) scores.push(a.overall_score);
    scoreAgg.set(a.closer_id, scores);
  }

  return (profiles ?? []).map((p) => {
    const agg = callAgg.get(p.id) ?? {
      total: 0,
      scheduled: 0,
      completed: 0,
      cancelled: 0,
      closed: 0,
      revenue: 0,
    };
    const scores = scoreAgg.get(p.id) ?? [];
    const avgScore =
      scores.length > 0
        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
        : null;
    const relevantCalls = agg.completed + agg.closed;
    const conversionPct =
      relevantCalls > 0 ? Math.round((agg.closed / relevantCalls) * 100) : 0;
    const commissionPct = Number(p.commission_pct ?? 0);
    const commissionAmount = (agg.revenue * commissionPct) / 100;

    return {
      closerId: p.id,
      closerName: p.full_name,
      closerEmail: p.email,
      avatarUrl: p.avatar_url,
      commissionPct,
      totalCalls: agg.total,
      scheduledCalls: agg.scheduled,
      completedCalls: agg.completed,
      cancelledCalls: agg.cancelled,
      closedCalls: agg.closed,
      conversionPct,
      totalRevenue: agg.revenue,
      commissionAmount,
      avgScore,
      calendlyConnected: integrationMap.get(p.id) ?? false,
    };
  });
}

/**
 * Actualiza el % de comisión de un closer (solo admins/owners).
 */
export async function updateCloserCommissionAction(
  closerId: string,
  commissionPct: number
): Promise<void> {
  const organizationId = await requireOrganizationId();
  const supabase = await createClient();

  // Verificar que el profile pertenece a la org
  const { error } = await supabase
    .from("profiles")
    .update({ commission_pct: commissionPct })
    .eq("id", closerId)
    .eq("organization_id", organizationId);

  if (error) throw new Error(error.message);
}

/**
 * Dispara un sync manual de Calendly para el closer actual (o un closerId específico).
 */
export async function syncCloserCalendlyAction(
  closerId?: string
): Promise<CloserSyncResult> {
  const organizationId = await requireOrganizationId();

  const targetId = closerId ?? (await getCurrentProfile())?.id;
  if (!targetId) throw new Error("No se pudo determinar el closer");

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("team_member_integrations")
    .select("user_id, organization_id, config, last_sync_at")
    .eq("organization_id", organizationId)
    .eq("user_id", targetId)
    .eq("integration_type", "calendly")
    .maybeSingle();

  if (error || !data) {
    throw new Error("No se encontró integración Calendly para este closer");
  }

  return syncCloserCalendlyEvents({
    user_id: data.user_id,
    organization_id: data.organization_id,
    config: data.config as Parameters<typeof syncCloserCalendlyEvents>[0]["config"],
    last_sync_at: data.last_sync_at,
  });
}

/**
 * Estado de la integración Calendly del closer actual.
 */
export async function getMyCalendlyIntegrationAction() {
  if (!isSupabaseConfigured()) return { connected: false };

  const profile = await getCurrentProfile();
  if (!profile?.id || !profile?.organization_id) return { connected: false };

  return getCloserCalendlyIntegration(profile.organization_id, profile.id);
}

/**
 * Desconectar Calendly del closer actual.
 */
export async function disconnectMyCalendlyAction(): Promise<void> {
  const profile = await getCurrentProfile();
  if (!profile?.id || !profile?.organization_id) {
    throw new Error("Sesión no válida");
  }
  await disconnectCloserCalendly(profile.organization_id, profile.id);
}

/**
 * Llamadas de un closer específico (para vista de detalle).
 */
export async function getCloserCallsAction(closerId: string) {
  if (!isSupabaseConfigured()) return [];

  const organizationId = await requireOrganizationId();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("closing_calls")
    .select("*")
    .eq("organization_id", organizationId)
    .eq("closer_id", closerId)
    .order("scheduled_at", { ascending: false })
    .limit(100);

  if (error) {
    console.error("[getCloserCallsAction]", error.message);
    return [];
  }
  return data ?? [];
}
