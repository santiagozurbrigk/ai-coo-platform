import type {
  AdminAiCostDashboard,
  AdminOrganizationDetail,
  AdminOrganizationListRow,
  AdminProfitabilityOrgRow,
  AdminProfitabilitySummary,
  AdminUserRow,
  OrgAiCostRow,
  TokenUsageBreakdown,
} from "@/types/super-admin";
import type { SuperAdminPeriod } from "@/lib/super-admin/period";

export const mockOrganizationsList: AdminOrganizationListRow[] = [
  {
    id: "org1",
    name: "Acme Coaching Co.",
    industry: "Coaching",
    founderName: "Jane Doe",
    founderEmail: "jane@acme.co",
    founderId: "f1",
    status: "active",
    plan: "growth",
    usersCount: 8,
    byokEnabled: true,
    createdAt: "2025-11-12T10:00:00Z",
    lastActivityAt: "2026-05-25T14:30:00Z",
    founderLastLogin: "2026-05-25T09:15:00Z",
    conversationsThisMonth: 342,
    dealsClosedThisMonth: 12,
    billingThisMonth: 84200,
    billingThisMonthLabel: "$84.200",
    mrrUsd: 84200,
  },
  {
    id: "org2",
    name: "Scale Mentors LLC",
    founderName: "John Smith",
    founderEmail: "john@scalementors.com",
    founderId: "f2",
    status: "active",
    plan: "enterprise",
    usersCount: 14,
    industry: null,
    byokEnabled: false,
    createdAt: "2025-08-03T08:00:00Z",
    lastActivityAt: "2026-05-24T18:00:00Z",
    founderLastLogin: "2026-05-24T16:45:00Z",
    conversationsThisMonth: 218,
    dealsClosedThisMonth: 9,
    billingThisMonth: 42000,
    billingThisMonthLabel: "$42.000",
    mrrUsd: 42000,
  },
  {
    id: "org3",
    name: "Creator Labs",
    founderName: "Alex Kim",
    founderEmail: "alex@creatorlabs.io",
    founderId: "f3",
    status: "trial",
    plan: "trial",
    usersCount: 3,
    industry: null,
    byokEnabled: false,
    createdAt: "2026-04-01T12:00:00Z",
    lastActivityAt: "2026-05-23T11:20:00Z",
    founderLastLogin: "2026-05-23T11:20:00Z",
    conversationsThisMonth: 47,
    dealsClosedThisMonth: 2,
    billingThisMonth: 0,
    billingThisMonthLabel: "$0",
    mrrUsd: 18000,
  },
  {
    id: "org4",
    name: "Momentum Academy",
    founderName: "Sofía Ruiz",
    founderEmail: "sofia@momentum.academy",
    founderId: "f4",
    status: "active",
    plan: "starter",
    usersCount: 5,
    industry: null,
    byokEnabled: false,
    createdAt: "2026-01-15T09:00:00Z",
    lastActivityAt: "2026-05-22T20:10:00Z",
    founderLastLogin: "2026-05-22T08:00:00Z",
    conversationsThisMonth: 128,
    dealsClosedThisMonth: 5,
    billingThisMonth: 24900,
    billingThisMonthLabel: "$24.900",
    mrrUsd: 24900,
  },
  {
    id: "org5",
    name: "Peak Performance Co.",
    founderName: "Marco Bellini",
    founderEmail: "marco@peakperf.co",
    founderId: "f5",
    status: "inactive",
    plan: "starter",
    usersCount: 2,
    industry: null,
    byokEnabled: false,
    createdAt: "2025-06-20T14:00:00Z",
    lastActivityAt: "2026-03-10T10:00:00Z",
    founderLastLogin: "2026-03-08T15:30:00Z",
    conversationsThisMonth: 0,
    dealsClosedThisMonth: 0,
    billingThisMonth: 0,
    billingThisMonthLabel: "$0",
    mrrUsd: 0,
  },
];

const MOCK_ORG_COSTS: OrgAiCostRow[] = [
  {
    orgId: "org1",
    orgName: "Acme Coaching Co.",
    plan: "growth",
    mrrUsd: 84200,
    claudeHaikuUsd: 28.4,
    claudeSonnetUsd: 62.1,
    claudeOpusUsd: 18.5,
    embeddingsUsd: 8.2,
    storageUsd: 4.8,
    infrastructureUsd: 12.0,
    totalMonthUsd: 134.0,
    marginUsd: 84066,
    marginPercent: 99.8,
    aiKeySource: "byok",
  },
  {
    orgId: "org2",
    orgName: "Scale Mentors LLC",
    plan: "enterprise",
    mrrUsd: 42000,
    claudeHaikuUsd: 22.1,
    claudeSonnetUsd: 48.3,
    claudeOpusUsd: 12.0,
    embeddingsUsd: 5.6,
    storageUsd: 3.2,
    infrastructureUsd: 9.8,
    totalMonthUsd: 101.0,
    marginUsd: 41899,
    marginPercent: 99.8,
    aiKeySource: "otc",
  },
  {
    orgId: "org3",
    orgName: "Creator Labs",
    plan: "trial",
    mrrUsd: 18000,
    claudeHaikuUsd: 8.5,
    claudeSonnetUsd: 14.2,
    claudeOpusUsd: 3.1,
    embeddingsUsd: 2.4,
    storageUsd: 1.8,
    infrastructureUsd: 4.0,
    totalMonthUsd: 34.0,
    marginUsd: 17966,
    marginPercent: 99.8,
    aiKeySource: "otc",
  },
  {
    orgId: "org4",
    orgName: "Momentum Academy",
    plan: "starter",
    mrrUsd: 24900,
    claudeHaikuUsd: 12.8,
    claudeSonnetUsd: 28.4,
    claudeOpusUsd: 6.2,
    embeddingsUsd: 3.1,
    storageUsd: 2.0,
    infrastructureUsd: 6.5,
    totalMonthUsd: 59.0,
    marginUsd: 24841,
    marginPercent: 99.8,
    aiKeySource: "otc",
  },
  {
    orgId: "org5",
    orgName: "Peak Performance Co.",
    plan: "starter",
    mrrUsd: 0,
    claudeHaikuUsd: 0,
    claudeSonnetUsd: 0,
    claudeOpusUsd: 0,
    embeddingsUsd: 0.5,
    storageUsd: 1.2,
    infrastructureUsd: 2.0,
    totalMonthUsd: 3.7,
    marginUsd: -3.7,
    marginPercent: 0,
    aiKeySource: "otc",
  },
];

export const mockAiCostDashboard: AdminAiCostDashboard = {
  summary: {
    totalMrrUsd: 169100,
    totalTokenCostMonthUsd: 251.7,
    totalInfraCostUsd: 82.3,
    estimatedGrossMarginUsd: 168765.7,
    globalMarginPercent: 99.8,
    activeOrganizations: 4,
  },
  organizations: MOCK_ORG_COSTS,
  profitabilityChart: MOCK_ORG_COSTS.filter((o) => o.mrrUsd > 0).map((o) => ({
    orgName: o.orgName,
    mrrUsd: o.mrrUsd,
    costUsd: o.totalMonthUsd,
    marginUsd: o.marginUsd,
  })),
  modelUsage: [
    {
      model: "claude-haiku-4-5-20251001",
      requests: 145,
      inputTokens: 2_100_000,
      outputTokens: 180_000,
      inputCostUsd: 1.68,
      outputCostUsd: 0.72,
      totalCostUsd: 2.4,
    },
    {
      model: "claude-sonnet-4-6",
      requests: 23,
      inputTokens: 890_000,
      outputTokens: 120_000,
      inputCostUsd: 2.67,
      outputCostUsd: 1.8,
      totalCostUsd: 4.47,
    },
  ],
};

export function getMockOrganizationDetail(
  id: string
): AdminOrganizationDetail | null {
  const org = mockOrganizationsList.find((o) => o.id === id);
  const costs = MOCK_ORG_COSTS.find((c) => c.orgId === id);
  if (!org || !costs) return null;

  const usersByOrg: Record<string, AdminOrganizationDetail["users"]> = {
    org1: [
      { id: "u1", name: "Jane Doe", email: "jane@acme.co", role: "Founder", lastLogin: "2026-05-25T09:15:00Z" },
      { id: "u2", name: "María López", email: "maria@acme.co", role: "Setter", lastLogin: "2026-05-25T08:00:00Z" },
      { id: "u3", name: "Jordan Lee", email: "jordan@acme.co", role: "Operador", lastLogin: "2026-05-24T17:00:00Z" },
    ],
    org2: [
      { id: "u4", name: "John Smith", email: "john@scalementors.com", role: "Founder", lastLogin: "2026-05-24T16:45:00Z" },
      { id: "u5", name: "Sam Ortiz", email: "sam@scalementors.com", role: "Gestor", lastLogin: "2026-05-23T12:00:00Z" },
    ],
    org3: [
      { id: "u6", name: "Alex Kim", email: "alex@creatorlabs.io", role: "Founder", lastLogin: "2026-05-23T11:20:00Z" },
    ],
    org4: [
      { id: "u7", name: "Sofía Ruiz", email: "sofia@momentum.academy", role: "Founder", lastLogin: "2026-05-22T08:00:00Z" },
      { id: "u8", name: "Carlos Vega", email: "carlos@momentum.academy", role: "Closer", lastLogin: "2026-05-21T19:00:00Z" },
    ],
    org5: [
      { id: "u9", name: "Marco Bellini", email: "marco@peakperf.co", role: "Founder", lastLogin: "2026-03-08T15:30:00Z" },
    ],
  };

  return {
    id: org.id,
    name: org.name,
    status: org.status,
    plan: org.plan,
    createdAt: org.createdAt,
    mrrUsd: org.mrrUsd,
    founder: {
      id: org.founderId,
      name: org.founderName,
      email: org.founderEmail,
      lastLogin: org.founderLastLogin,
    },
    users: usersByOrg[id] ?? [],
    onboarding: {
      businessType: "Coaching grupal high-ticket",
      revenueRange: "$50K–$150K/mes",
      teamSize: String(org.usersCount),
      challenges: "Escalar delivery sin aumentar headcount",
    },
    metrics: {
      conversationsThisMonth: org.conversationsThisMonth,
      dealsClosedThisMonth: org.dealsClosedThisMonth,
      billingThisMonth: org.billingThisMonth,
      cashCollectedThisMonth: org.billingThisMonth * 0.85,
    },
    integrations: [
      { id: "manychat", name: "ManyChat", connected: true, detail: "Page conectada" },
      { id: "calendly", name: "Calendly", connected: true, detail: "OAuth activo" },
      { id: "fathom", name: "Fathom", connected: id !== "org5", detail: id === "org5" ? "No conectado" : "API key" },
      { id: "youtube", name: "YouTube", connected: id === "org1" || id === "org2" },
      { id: "stripe", name: "Stripe", connected: id === "org1" },
    ],
    notes: [
      {
        id: "n1",
        note: "Cliente enterprise — revisar límites de tokens mensuales.",
        created_by: "super_admin",
        created_at: "2026-05-20T10:00:00Z",
      },
    ],
    aiCost: {
      haikuUsd: costs.claudeHaikuUsd,
      sonnetUsd: costs.claudeSonnetUsd,
      opusUsd: costs.claudeOpusUsd,
      embeddingsUsd: costs.embeddingsUsd,
      storageUsd: costs.storageUsd,
      infrastructureUsd: costs.infrastructureUsd,
      totalUsd: costs.totalMonthUsd,
    },
    tokenUsage: {
      costMonthUsd: costs.totalMonthUsd,
      daily: Array.from({ length: 14 }, (_, i) => ({
        date: `2026-05-${String(i + 12).padStart(2, "0")}`,
        costUsd: costs.totalMonthUsd / 14 + (i % 3) * 2,
      })),
    },
  };
}

export function getMockProfitabilityData(): {
  summary: AdminProfitabilitySummary;
  orgRows: AdminProfitabilityOrgRow[];
} {
  const orgRows: AdminProfitabilityOrgRow[] = MOCK_ORG_COSTS.map((c) => ({
    orgId: c.orgId,
    orgName: c.orgName,
    mrrUsd: c.mrrUsd,
    tokenCostMonthUsd: c.totalMonthUsd,
    tokenCostPrevMonthUsd: c.totalMonthUsd * 0.92,
    estimatedMarginUsd: c.marginUsd,
    marginPercent: c.marginPercent,
    trend: c.orgId === "org3" ? "up" : c.orgId === "org5" ? "down" : "flat",
  }));

  return {
    summary: mockAiCostDashboard.summary,
    orgRows,
  };
}

export function getMockTokenUsageBreakdown(
  period: SuperAdminPeriod
): TokenUsageBreakdown {
  const multiplier =
    period === "day" ? 0.03 : period === "week" ? 0.22 : period === "year" ? 12 : 1;

  return {
    period,
    inputTokens: Math.round(645000 * multiplier),
    outputTokens: Math.round(210000 * multiplier),
    totalCostUsd: 251.7 * multiplier,
    byModel: [
      { model: "claude-haiku", tokens: 420000, costUsd: 61.8 * multiplier },
      { model: "claude-sonnet", tokens: 310000, costUsd: 152.8 * multiplier },
      { model: "claude-opus", tokens: 45000, costUsd: 39.8 * multiplier },
    ],
    byFeature: [
      { feature: "executive_reports", tokens: 280000, costUsd: 98.2 * multiplier },
      { feature: "sop_generation", tokens: 120000, costUsd: 42.5 * multiplier },
      { feature: "sales_insights", tokens: 95000, costUsd: 38.1 * multiplier },
      { feature: "embeddings", tokens: 360000, costUsd: 19.4 * multiplier },
    ],
  };
}

export function getMockTokenCostDaily() {
  return MOCK_ORG_COSTS.flatMap((org) =>
    Array.from({ length: 10 }, (_, i) => ({
      date: `2026-05-${String(i + 16).padStart(2, "0")}`,
      orgId: org.orgId,
      orgName: org.orgName,
      costUsd: org.totalMonthUsd / 30 + (i % 2),
    }))
  );
}

export const mockAdminUsers: AdminUserRow[] = [
  {
    id: "u1",
    name: "Jane Doe",
    email: "jane@acme.co",
    organizationId: "org1",
    organizationName: "Acme Coaching Co.",
    role: "founder",
    status: "active",
    lastLogin: "2026-05-25T09:15:00Z",
  },
  {
    id: "u2",
    name: "María López",
    email: "maria@acme.co",
    organizationId: "org1",
    organizationName: "Acme Coaching Co.",
    role: "operator",
    status: "active",
    lastLogin: "2026-05-25T08:00:00Z",
  },
];

/** @deprecated */
export const mockOrganizations = mockOrganizationsList.map((o) => ({
  id: o.id,
  name: o.name,
  founder: o.founderName,
  mrr: o.billingThisMonthLabel,
  status: o.status === "trial" ? "trial" as const : o.status === "active" ? "active" as const : "churned" as const,
  aiCostMonth: `$${MOCK_ORG_COSTS.find((c) => c.orgId === o.id)?.totalMonthUsd ?? 0}`,
}));

export const mockAiUsage = MOCK_ORG_COSTS.map((c) => ({
  orgId: c.orgId,
  orgName: c.orgName,
  haikuTokens: 420000,
  sonnetTokens: 180000,
  opusTokens: 45000,
  totalCost: `$${c.totalMonthUsd.toFixed(0)}`,
}));

export const mockFounders = mockOrganizationsList.map((o) => ({
  id: o.founderId ?? o.id,
  name: o.founderName,
  email: o.founderEmail,
  organization: o.name,
  mrr: o.billingThisMonthLabel,
  status: o.status === "trial" ? "trial" as const : "active" as const,
}));

export const mockTeamAccounts = mockAdminUsers.map((u) => ({
  id: u.id,
  name: u.name,
  email: u.email,
  organization: u.organizationName,
  role: u.role,
  lastLogin: u.lastLogin ?? "",
}));
