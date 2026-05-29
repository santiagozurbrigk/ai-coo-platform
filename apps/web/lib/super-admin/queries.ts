import type { ClientRow } from "@/lib/clients/mapper";
import {
  buildContentBreakdown,
  buildCoverageAreas,
  buildBrainHealth,
  buildRecentItems,
  countByStatus,
  rowToBrainDocument,
  type AiBrainDocumentRow,
} from "@/lib/ai-brain/mapper";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  countByOrg,
  formatUsd,
  formatUsdPrecise,
  sumBillingInRange,
  sumCashCollectedInRange,
} from "@/lib/super-admin/org-metrics";
import {
  getCurrentMonthRange,
  getLastNDaysRange,
  getPreviousMonthRange,
  resolveSuperAdminPeriod,
  type DateRangeIso,
  type SuperAdminPeriod,
} from "@/lib/super-admin/period";
import type {
  AdminOrganizationDetail,
  AdminOrganizationListRow,
  AdminProfitabilityOrgRow,
  AdminProfitabilitySummary,
  AdminUserRow,
  InfrastructureStats,
  OrganizationIntegration,
  OrganizationNote,
  TokenUsageBreakdown,
  TokenUsageDailyPoint,
} from "@/types/super-admin";

type FounderProfile = {
  id: string;
  organization_id: string;
  email: string;
  full_name: string | null;
};

function mapOrgStatus(
  status: string
): AdminOrganizationListRow["status"] {
  if (status === "active") return "active";
  return "inactive";
}

async function fetchFounderLastLogins(
  founderIds: string[]
): Promise<Map<string, string | null>> {
  const admin = createAdminClient();
  const map = new Map<string, string | null>();
  await Promise.all(
    founderIds.map(async (id) => {
      const { data } = await admin.auth.admin.getUserById(id);
      map.set(id, data.user?.last_sign_in_at ?? null);
    })
  );
  return map;
}

export async function loadOrganizationsList(): Promise<
  AdminOrganizationListRow[]
> {
  const admin = createAdminClient();
  const month = getCurrentMonthRange();

  const [orgsRes, foundersRes, convRes, closingRes, clientsRes] =
    await Promise.all([
      admin
        .from("organizations")
        .select("id, name, status, created_at, mrr_usd")
        .order("created_at", { ascending: false }),
      admin
        .from("profiles")
        .select("id, organization_id, email, full_name, role")
        .eq("role", "founder"),
      admin
        .from("conversations")
        .select("organization_id")
        .gte("created_at", month.start)
        .lte("created_at", month.end),
      admin
        .from("closing_calls")
        .select("organization_id")
        .eq("status", "closed")
        .gte("scheduled_at", month.start)
        .lte("scheduled_at", month.end),
      admin.from("clients").select("*"),
    ]);

  if (orgsRes.error) throw new Error(orgsRes.error.message);

  const founders = (foundersRes.data ?? []) as FounderProfile[];
  const founderByOrg = new Map<string, FounderProfile>();
  for (const f of founders) {
    if (!founderByOrg.has(f.organization_id)) {
      founderByOrg.set(f.organization_id, f);
    }
  }

  const convCounts = countByOrg(
    (convRes.data ?? []) as { organization_id: string }[]
  );
  const dealCounts = countByOrg(
    (closingRes.data ?? []) as { organization_id: string }[]
  );

  const clientsByOrg = new Map<string, ClientRow[]>();
  for (const row of (clientsRes.data ?? []) as ClientRow[]) {
    const list = clientsByOrg.get(row.organization_id) ?? [];
    list.push(row);
    clientsByOrg.set(row.organization_id, list);
  }

  const loginMap = await fetchFounderLastLogins(
    founders.map((f) => f.id)
  );

  return (orgsRes.data ?? []).map((org) => {
    const founder = founderByOrg.get(org.id);
    const clients = clientsByOrg.get(org.id) ?? [];
    const billing = sumBillingInRange(clients, month);
    return {
      id: org.id,
      name: org.name,
      founderName: founder?.full_name ?? "—",
      founderEmail: founder?.email ?? "—",
      founderId: founder?.id ?? null,
      status: mapOrgStatus(org.status),
      createdAt: org.created_at,
      founderLastLogin: founder ? loginMap.get(founder.id) ?? null : null,
      conversationsThisMonth: convCounts.get(org.id) ?? 0,
      dealsClosedThisMonth: dealCounts.get(org.id) ?? 0,
      billingThisMonth: billing,
      billingThisMonthLabel: formatUsd(billing),
      mrrUsd: Number(org.mrr_usd ?? 0),
    };
  });
}

async function loadOrgIntegrations(
  orgId: string
): Promise<OrganizationIntegration[]> {
  const admin = createAdminClient();
  const [cal, mc] = await Promise.all([
    admin
      .from("calendly_integrations")
      .select("organization_id, calendly_org_uri, updated_at")
      .eq("organization_id", orgId)
      .maybeSingle(),
    admin
      .from("manychat_integrations")
      .select("organization_id, page_id, updated_at")
      .eq("organization_id", orgId)
      .maybeSingle(),
  ]);

  const items: OrganizationIntegration[] = [
    {
      id: "calendly",
      name: "Calendly",
      connected: Boolean(cal.data),
      detail: cal.data ? "OAuth conectado" : undefined,
    },
    {
      id: "manychat",
      name: "ManyChat",
      connected: Boolean(mc.data),
      detail: mc.data?.page_id ? `Page ${mc.data.page_id}` : undefined,
    },
    {
      id: "instagram",
      name: "Instagram / Meta",
      connected: false,
      detail: "Pendiente aprobación",
    },
    {
      id: "youtube",
      name: "YouTube API",
      connected: false,
      detail: "No configurado",
    },
  ];
  return items;
}

export async function loadOrganizationDetail(
  orgId: string
): Promise<AdminOrganizationDetail | null> {
  const admin = createAdminClient();
  const month = getCurrentMonthRange();

  const { data: org, error } = await admin
    .from("organizations")
    .select("id, name, status, created_at, mrr_usd")
    .eq("id", orgId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!org) return null;

  const [
    founderRes,
    onboardingRes,
    convCountRes,
    closingCountRes,
    clientsRes,
    notesRes,
    tokenMonthRes,
    integrations,
  ] = await Promise.all([
    admin
      .from("profiles")
      .select("id, email, full_name")
      .eq("organization_id", orgId)
      .eq("role", "founder")
      .maybeSingle(),
    admin
      .from("onboarding_responses")
      .select("data")
      .eq("organization_id", orgId)
      .maybeSingle(),
    admin
      .from("conversations")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", orgId)
      .gte("created_at", month.start)
      .lte("created_at", month.end),
    admin
      .from("closing_calls")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", orgId)
      .eq("status", "closed")
      .gte("scheduled_at", month.start)
      .lte("scheduled_at", month.end),
    admin.from("clients").select("*").eq("organization_id", orgId),
    admin
      .from("organization_notes")
      .select("id, note, created_by, created_at")
      .eq("organization_id", orgId)
      .order("created_at", { ascending: false }),
    admin
      .from("token_usage")
      .select("total_cost_usd, created_at")
      .eq("organization_id", orgId)
      .gte("created_at", getLastNDaysRange(30).start)
      .order("created_at", { ascending: true }),
    loadOrgIntegrations(orgId),
  ]);

  const founder = founderRes.data;
  let founderLastLogin: string | null = null;
  if (founder?.id) {
    const { data: authUser } = await admin.auth.admin.getUserById(founder.id);
    founderLastLogin = authUser.user?.last_sign_in_at ?? null;
  }

  const clients = (clientsRes.data ?? []) as ClientRow[];
  const billing = sumBillingInRange(clients, month);
  const cash = sumCashCollectedInRange(clients, month);

  const tokenRows = tokenMonthRes.data ?? [];
  const tokenByDay = new Map<string, number>();
  for (const row of tokenRows) {
    const day = row.created_at.slice(0, 10);
    tokenByDay.set(
      day,
      (tokenByDay.get(day) ?? 0) + Number(row.total_cost_usd)
    );
  }
  const tokenDaily: TokenUsageDailyPoint[] = [...tokenByDay.entries()].map(
    ([date, costUsd]) => ({ date, costUsd })
  );
  const tokenCostMonth = tokenRows
    .filter((r) => r.created_at >= month.start)
    .reduce((s, r) => s + Number(r.total_cost_usd), 0);

  const onboarding = onboardingRes.data?.data as Record<string, unknown> | null;

  return {
    id: org.id,
    name: org.name,
    status: mapOrgStatus(org.status),
    createdAt: org.created_at,
    mrrUsd: Number(org.mrr_usd ?? 0),
    founder: {
      id: founder?.id ?? null,
      name: founder?.full_name ?? "—",
      email: founder?.email ?? "—",
      lastLogin: founderLastLogin,
    },
    onboarding: onboarding ?? null,
    metrics: {
      conversationsThisMonth: convCountRes.count ?? 0,
      dealsClosedThisMonth: closingCountRes.count ?? 0,
      billingThisMonth: billing,
      cashCollectedThisMonth: cash,
    },
    integrations,
    notes: (notesRes.data ?? []) as OrganizationNote[],
    tokenUsage: {
      costMonthUsd: tokenCostMonth,
      daily: tokenDaily,
    },
  };
}

export async function loadAdminUsers(): Promise<AdminUserRow[]> {
  const admin = createAdminClient();
  const [{ data: profiles, error }, { data: orgs }] = await Promise.all([
    admin
      .from("profiles")
      .select("id, email, full_name, role, organization_id, created_at")
      .order("created_at", { ascending: false }),
    admin.from("organizations").select("id, name"),
  ]);

  if (error) throw new Error(error.message);

  const orgNames = new Map((orgs ?? []).map((o) => [o.id, o.name as string]));

  const rows: AdminUserRow[] = [];
  for (const p of profiles ?? []) {
    const orgName = orgNames.get(p.organization_id) ?? "—";
    const { data: authUser } = await admin.auth.admin.getUserById(p.id);
    const banned = Boolean(
      authUser.user?.banned_until &&
        new Date(authUser.user.banned_until) > new Date()
    );
    rows.push({
      id: p.id,
      name: p.full_name ?? "—",
      email: p.email,
      organizationId: p.organization_id,
      organizationName: orgName,
      role: p.role,
      status: banned ? "inactive" : "active",
      lastLogin: authUser.user?.last_sign_in_at ?? null,
    });
  }
  return rows;
}

export async function loadProfitabilityData(): Promise<{
  summary: AdminProfitabilitySummary;
  orgRows: AdminProfitabilityOrgRow[];
}> {
  const admin = createAdminClient();
  const month = getCurrentMonthRange();
  const prevMonth = getPreviousMonthRange();

  const [orgsRes, tokenMonthRes, tokenPrevRes] = await Promise.all([
    admin
      .from("organizations")
      .select("id, name, status, mrr_usd")
      .eq("status", "active"),
    admin
      .from("token_usage")
      .select("organization_id, total_cost_usd")
      .gte("created_at", month.start)
      .lte("created_at", month.end),
    admin
      .from("token_usage")
      .select("organization_id, total_cost_usd")
      .gte("created_at", prevMonth.start)
      .lte("created_at", prevMonth.end),
  ]);

  if (orgsRes.error) throw new Error(orgsRes.error.message);

  const sumByOrg = (rows: { organization_id: string | null; total_cost_usd: number }[]) => {
    const map = new Map<string, number>();
    for (const r of rows) {
      if (!r.organization_id) continue;
      map.set(
        r.organization_id,
        (map.get(r.organization_id) ?? 0) + Number(r.total_cost_usd)
      );
    }
    return map;
  };

  const monthCosts = sumByOrg(tokenMonthRes.data ?? []);
  const prevCosts = sumByOrg(tokenPrevRes.data ?? []);

  const orgRows: AdminProfitabilityOrgRow[] = (orgsRes.data ?? []).map((org) => {
    const mrr = Number(org.mrr_usd ?? 0);
    const tokenCost = monthCosts.get(org.id) ?? 0;
    const tokenCostPrev = prevCosts.get(org.id) ?? 0;
    const margin = mrr - tokenCost;
    let trend: AdminProfitabilityOrgRow["trend"] = "flat";
    if (tokenCost < tokenCostPrev) trend = "up";
    else if (tokenCost > tokenCostPrev) trend = "down";
    return {
      orgId: org.id,
      orgName: org.name,
      mrrUsd: mrr,
      tokenCostMonthUsd: tokenCost,
      tokenCostPrevMonthUsd: tokenCostPrev,
      estimatedMarginUsd: margin,
      trend,
    };
  });

  const totalMrr = orgRows.reduce((s, r) => s + r.mrrUsd, 0);
  const totalTokenCost = [...monthCosts.values()].reduce((s, v) => s + v, 0);
  const grossMargin = totalMrr - totalTokenCost;

  return {
    summary: {
      totalMrrUsd: totalMrr,
      totalTokenCostMonthUsd: totalTokenCost,
      estimatedGrossMarginUsd: grossMargin,
      activeOrganizations: orgRows.length,
    },
    orgRows,
  };
}

export async function loadTokenUsageBreakdown(
  period: SuperAdminPeriod,
  organizationId?: string
): Promise<TokenUsageBreakdown> {
  const admin = createAdminClient();
  const range = resolveSuperAdminPeriod(period);

  let query = admin
    .from("token_usage")
    .select(
      "model, feature, input_tokens, output_tokens, total_cost_usd"
    )
    .gte("created_at", range.start)
    .lte("created_at", range.end);

  if (organizationId) {
    query = query.eq("organization_id", organizationId);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  let inputTokens = 0;
  let outputTokens = 0;
  let totalCost = 0;
  const byModel = new Map<string, { tokens: number; cost: number }>();
  const byFeature = new Map<string, { tokens: number; cost: number }>();

  for (const row of data ?? []) {
    const input = Number(row.input_tokens);
    const output = Number(row.output_tokens);
    const cost = Number(row.total_cost_usd);
    inputTokens += input;
    outputTokens += output;
    totalCost += cost;

    const modelKey = row.model;
    const m = byModel.get(modelKey) ?? { tokens: 0, cost: 0 };
    m.tokens += input + output;
    m.cost += cost;
    byModel.set(modelKey, m);

    const feat = row.feature ?? "other";
    const f = byFeature.get(feat) ?? { tokens: 0, cost: 0 };
    f.tokens += input + output;
    f.cost += cost;
    byFeature.set(feat, f);
  }

  return {
    period,
    inputTokens,
    outputTokens,
    totalCostUsd: totalCost,
    byModel: [...byModel.entries()].map(([model, v]) => ({
      model,
      tokens: v.tokens,
      costUsd: v.cost,
    })),
    byFeature: [...byFeature.entries()].map(([feature, v]) => ({
      feature,
      tokens: v.tokens,
      costUsd: v.cost,
    })),
  };
}

export async function loadTokenCostDailyByOrg(
  days = 30
): Promise<{ date: string; orgId: string; orgName: string; costUsd: number }[]> {
  const admin = createAdminClient();
  const range = getLastNDaysRange(days);

  const [{ data: usage }, { data: orgs }] = await Promise.all([
    admin
      .from("token_usage")
      .select("organization_id, total_cost_usd, created_at")
      .gte("created_at", range.start)
      .not("organization_id", "is", null),
    admin.from("organizations").select("id, name"),
  ]);

  const orgNames = new Map(
    (orgs ?? []).map((o) => [o.id, o.name as string])
  );

  const points: {
    date: string;
    orgId: string;
    orgName: string;
    costUsd: number;
  }[] = [];

  const agg = new Map<string, number>();
  for (const row of usage ?? []) {
    if (!row.organization_id) continue;
    const day = row.created_at.slice(0, 10);
    const key = `${day}|${row.organization_id}`;
    agg.set(key, (agg.get(key) ?? 0) + Number(row.total_cost_usd));
  }

  for (const [key, costUsd] of agg) {
    const [date, orgId] = key.split("|");
    points.push({
      date,
      orgId,
      orgName: orgNames.get(orgId) ?? orgId,
      costUsd,
    });
  }

  return points.sort((a, b) => a.date.localeCompare(b.date));
}

export async function loadInfrastructureStats(): Promise<InfrastructureStats> {
  const admin = createAdminClient();
  const [
    orgs,
    profiles,
    conversations,
    closing,
    clients,
    brainDocs,
  ] = await Promise.all([
    admin.from("organizations").select("id", { count: "exact", head: true }),
    admin.from("profiles").select("id", { count: "exact", head: true }),
    admin.from("conversations").select("id", { count: "exact", head: true }),
    admin.from("closing_calls").select("id", { count: "exact", head: true }),
    admin.from("clients").select("id", { count: "exact", head: true }),
    admin
      .from("ai_brain_documents")
      .select("id", { count: "exact", head: true }),
  ]);

  return {
    organizations: orgs.count ?? 0,
    users: profiles.count ?? 0,
    conversations: conversations.count ?? 0,
    closingCalls: closing.count ?? 0,
    clients: clients.count ?? 0,
    aiBrainDocuments: brainDocs.count ?? 0,
  };
}

export async function loadAiBrainDashboard() {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("ai_brain_documents")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  const rows = (data ?? []) as AiBrainDocumentRow[];
  return {
    documents: rows.map(rowToBrainDocument),
    health: buildBrainHealth(rows),
    breakdown: buildContentBreakdown(rows),
    coverage: buildCoverageAreas(rows),
    recent: buildRecentItems(rows),
    statusCounts: countByStatus(rows),
  };
}

export async function loadAiBrainDocuments(filters?: {
  contentType?: string;
  status?: string;
  search?: string;
}) {
  const admin = createAdminClient();
  let query = admin.from("ai_brain_documents").select("*");

  if (filters?.contentType && filters.contentType !== "all") {
    const dbType =
      filters.contentType === "miro" ? "miro_board" : filters.contentType;
    query = query.eq("content_type", dbType);
  }
  if (filters?.status && filters.status !== "all") {
    const dbStatus =
      filters.status === "indexing" ? "pending_indexing" : filters.status;
    query = query.eq("status", dbStatus);
  }

  const { data, error } = await query.order("created_at", {
    ascending: false,
  });
  if (error) throw new Error(error.message);

  let rows = (data ?? []) as AiBrainDocumentRow[];
  if (filters?.search?.trim()) {
    const q = filters.search.trim().toLowerCase();
    rows = rows.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        (r.tags ?? []).some((t) => t.toLowerCase().includes(q))
    );
  }

  return rows.map(rowToBrainDocument);
}

export async function loadAiBrainDocument(id: string) {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("ai_brain_documents")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;

  const row = data as AiBrainDocumentRow;
  return { row, document: rowToBrainDocument(row) };
}

export async function getSignedFileUrl(
  storagePath: string,
  expiresIn = 3600
): Promise<string | null> {
  const admin = createAdminClient();
  const path = storagePath.replace(/^ai-brain-documents\//, "");
  const { data, error } = await admin.storage
    .from("ai-brain-documents")
    .createSignedUrl(path, expiresIn);

  if (error || !data?.signedUrl) return null;
  return data.signedUrl;
}

export { formatUsd, formatUsdPrecise };
