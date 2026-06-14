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
import {
  getMockOrganizationDetail,
  getMockProfitabilityData,
  getMockTokenCostDaily,
  getMockTokenUsageBreakdown,
  mockAiCostDashboard,
  mockOrganizationsList,
} from "@/mocks/super-admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/env";
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
  type SuperAdminPeriod,
} from "@/lib/super-admin/period";
import type {
  AdminAiCostDashboard,
  AdminOrgPlan,
  AdminOrganizationDetail,
  AdminOrganizationListRow,
  AdminProfitabilityOrgRow,
  AdminProfitabilitySummary,
  AdminUserRow,
  InfrastructureStats,
  OrganizationAiCostBreakdown,
  OrganizationIntegration,
  OrganizationNote,
  OrganizationUser,
  TokenUsageBreakdown,
  TokenUsageDailyPoint,
  ModelUsageRow,
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
  if (status === "trial") return "trial";
  return "inactive";
}

function inferPlan(mrrUsd: number, status: string): AdminOrgPlan {
  if (status === "trial") return "trial";
  if (mrrUsd >= 50000) return "enterprise";
  if (mrrUsd >= 30000) return "growth";
  return "starter";
}

function aggregateAiCostFromTokenRows(
  rows: { model: string; feature: string | null; total_cost_usd: number }[]
): OrganizationAiCostBreakdown {
  let haikuUsd = 0;
  let sonnetUsd = 0;
  let opusUsd = 0;
  let embeddingsUsd = 0;

  for (const row of rows) {
    const cost = Number(row.total_cost_usd);
    const model = row.model.toLowerCase();
    const feature = (row.feature ?? "").toLowerCase();

    if (model.includes("haiku")) haikuUsd += cost;
    else if (model.includes("opus")) opusUsd += cost;
    else if (model.includes("sonnet")) sonnetUsd += cost;
    else if (model.includes("embed") || feature.includes("embed")) embeddingsUsd += cost;
    else sonnetUsd += cost;
  }

  const storageUsd = Math.max(1.2, haikuUsd * 0.08);
  const infrastructureUsd = Math.max(2, (haikuUsd + sonnetUsd + opusUsd) * 0.12);
  const totalUsd =
    haikuUsd + sonnetUsd + opusUsd + embeddingsUsd + storageUsd + infrastructureUsd;

  return {
    haikuUsd,
    sonnetUsd,
    opusUsd,
    embeddingsUsd,
    storageUsd,
    infrastructureUsd,
    totalUsd,
  };
}

function aggregateModelUsage(
  rows: {
    model: string;
    input_tokens: number;
    output_tokens: number;
    input_cost_usd: number;
    output_cost_usd: number;
  }[]
): ModelUsageRow[] {
  const byModel = new Map<
    string,
    {
      requests: number;
      inputTokens: number;
      outputTokens: number;
      inputCostUsd: number;
      outputCostUsd: number;
    }
  >();

  for (const row of rows) {
    const current = byModel.get(row.model) ?? {
      requests: 0,
      inputTokens: 0,
      outputTokens: 0,
      inputCostUsd: 0,
      outputCostUsd: 0,
    };
    current.requests += 1;
    current.inputTokens += Number(row.input_tokens);
    current.outputTokens += Number(row.output_tokens);
    current.inputCostUsd += Number(row.input_cost_usd);
    current.outputCostUsd += Number(row.output_cost_usd);
    byModel.set(row.model, current);
  }

  return [...byModel.entries()]
    .map(([model, v]) => ({
      model,
      requests: v.requests,
      inputTokens: v.inputTokens,
      outputTokens: v.outputTokens,
      inputCostUsd: v.inputCostUsd,
      outputCostUsd: v.outputCostUsd,
      totalCostUsd: v.inputCostUsd + v.outputCostUsd,
    }))
    .sort((a, b) => b.totalCostUsd - a.totalCostUsd);
}

export async function loadAiCostDashboard(): Promise<AdminAiCostDashboard> {
  if (!isSupabaseConfigured()) return mockAiCostDashboard;

  const { summary, orgRows } = await loadProfitabilityData();
  const orgs = await loadOrganizationsList();
  const admin = createAdminClient();
  const month = getCurrentMonthRange();

  const [{ data: byokRows }, { data: tokenRows }] = await Promise.all([
    admin
      .from("organizations")
      .select("id, claude_api_key_encrypted, claude_api_key_status"),
    admin
      .from("token_usage")
      .select(
        "model, input_tokens, output_tokens, input_cost_usd, output_cost_usd"
      )
      .gte("created_at", month.start)
      .lte("created_at", month.end),
  ]);

  const byokOrgIds = new Set(
    (byokRows ?? [])
      .filter(
        (row) =>
          row.claude_api_key_encrypted &&
          row.claude_api_key_status === "valid"
      )
      .map((row) => row.id as string)
  );

  const organizations = orgRows.map((row) => {
    const org = orgs.find((o) => o.id === row.orgId);
    const totalMonthUsd = row.tokenCostMonthUsd;
    const ratio = totalMonthUsd > 0 ? 1 : 0;
    return {
      orgId: row.orgId,
      orgName: row.orgName,
      plan: org?.plan ?? "starter",
      mrrUsd: row.mrrUsd,
      claudeHaikuUsd: totalMonthUsd * 0.22 * ratio,
      claudeSonnetUsd: totalMonthUsd * 0.52 * ratio,
      claudeOpusUsd: totalMonthUsd * 0.14 * ratio,
      embeddingsUsd: totalMonthUsd * 0.06 * ratio,
      storageUsd: totalMonthUsd * 0.03 * ratio,
      infrastructureUsd: totalMonthUsd * 0.03 * ratio,
      totalMonthUsd,
      marginUsd: row.estimatedMarginUsd,
      marginPercent:
        row.mrrUsd > 0 ? (row.estimatedMarginUsd / row.mrrUsd) * 100 : 0,
      aiKeySource: byokOrgIds.has(row.orgId) ? ("byok" as const) : ("otc" as const),
    };
  });

  return {
    summary: {
      ...summary,
      totalInfraCostUsd: organizations.reduce(
        (s, o) => s + o.storageUsd + o.infrastructureUsd,
        0
      ),
      globalMarginPercent:
        summary.totalMrrUsd > 0
          ? (summary.estimatedGrossMarginUsd / summary.totalMrrUsd) * 100
          : 0,
    },
    organizations,
    profitabilityChart: organizations
      .filter((o) => o.mrrUsd > 0)
      .map((o) => ({
        orgName: o.orgName,
        mrrUsd: o.mrrUsd,
        costUsd: o.totalMonthUsd,
        marginUsd: o.marginUsd,
      })),
    modelUsage: aggregateModelUsage(tokenRows ?? []),
  };
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
  if (!isSupabaseConfigured()) return mockOrganizationsList;

  const admin = createAdminClient();
  const month = getCurrentMonthRange();

  const [orgsRes, foundersRes, profilesRes, convRes, closingRes, clientsRes] =
    await Promise.all([
      admin
        .from("organizations")
        .select("id, name, status, created_at, mrr_usd")
        .order("created_at", { ascending: false }),
      admin
        .from("profiles")
        .select("id, organization_id, email, full_name, role")
        .eq("role", "founder"),
      admin.from("profiles").select("organization_id"),
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

  const userCounts = countByOrg(
    (profilesRes.data ?? []) as { organization_id: string }[]
  );

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
    const mrrUsd = Number(org.mrr_usd ?? 0);
    const status = mapOrgStatus(org.status);
    const founderLastLogin = founder ? loginMap.get(founder.id) ?? null : null;

    return {
      id: org.id,
      name: org.name,
      founderName: founder?.full_name ?? "—",
      founderEmail: founder?.email ?? "—",
      founderId: founder?.id ?? null,
      status,
      plan: inferPlan(mrrUsd, org.status),
      usersCount: userCounts.get(org.id) ?? 0,
      createdAt: org.created_at,
      lastActivityAt: founderLastLogin,
      founderLastLogin,
      conversationsThisMonth: convCounts.get(org.id) ?? 0,
      dealsClosedThisMonth: dealCounts.get(org.id) ?? 0,
      billingThisMonth: billing,
      billingThisMonthLabel: formatUsd(billing),
      mrrUsd,
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
  if (!isSupabaseConfigured()) return getMockOrganizationDetail(orgId);

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
    usersRes,
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
      .from("profiles")
      .select("id, email, full_name, role")
      .eq("organization_id", orgId),
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
      .select("model, feature, total_cost_usd, created_at")
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
  const mrrUsd = Number(org.mrr_usd ?? 0);
  const status = mapOrgStatus(org.status);

  const users: OrganizationUser[] = await Promise.all(
    ((usersRes.data ?? []) as { id: string; email: string; full_name: string | null; role: string }[]).map(
      async (profile) => {
        const { data: authUser } = await admin.auth.admin.getUserById(profile.id);
        return {
          id: profile.id,
          name: profile.full_name ?? profile.email,
          email: profile.email,
          role: profile.role,
          lastLogin: authUser.user?.last_sign_in_at ?? null,
        };
      }
    )
  );

  const monthTokenRows = tokenRows.filter((r) => r.created_at >= month.start);
  const aiCost = aggregateAiCostFromTokenRows(monthTokenRows);

  return {
    id: org.id,
    name: org.name,
    status,
    plan: inferPlan(mrrUsd, org.status),
    createdAt: org.created_at,
    mrrUsd,
    founder: {
      id: founder?.id ?? null,
      name: founder?.full_name ?? "—",
      email: founder?.email ?? "—",
      lastLogin: founderLastLogin,
    },
    users,
    onboarding: onboarding ?? null,
    metrics: {
      conversationsThisMonth: convCountRes.count ?? 0,
      dealsClosedThisMonth: closingCountRes.count ?? 0,
      billingThisMonth: billing,
      cashCollectedThisMonth: cash,
    },
    integrations,
    notes: (notesRes.data ?? []) as OrganizationNote[],
    aiCost,
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
  if (!isSupabaseConfigured()) return getMockProfitabilityData();

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
      marginPercent: mrr > 0 ? (margin / mrr) * 100 : 0,
      trend,
    };
  });

  const totalMrr = orgRows.reduce((s, r) => s + r.mrrUsd, 0);
  const totalTokenCost = [...monthCosts.values()].reduce((s, v) => s + v, 0);
  const grossMargin = totalMrr - totalTokenCost;
  const totalInfraCostUsd = totalTokenCost * 0.15;

  return {
    summary: {
      totalMrrUsd: totalMrr,
      totalTokenCostMonthUsd: totalTokenCost,
      totalInfraCostUsd,
      estimatedGrossMarginUsd: grossMargin,
      globalMarginPercent: totalMrr > 0 ? (grossMargin / totalMrr) * 100 : 0,
      activeOrganizations: orgRows.length,
    },
    orgRows,
  };
}

export async function loadTokenUsageBreakdown(
  period: SuperAdminPeriod,
  organizationId?: string
): Promise<TokenUsageBreakdown> {
  if (!isSupabaseConfigured()) return getMockTokenUsageBreakdown(period);

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
  if (!isSupabaseConfigured()) return getMockTokenCostDaily();

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
