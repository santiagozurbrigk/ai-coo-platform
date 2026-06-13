export type AdminOrgStatus = "active" | "inactive" | "trial";

export type AdminOrgPlan = "starter" | "growth" | "enterprise" | "trial";

export type AdminOrganizationListRow = {
  id: string;
  name: string;
  founderName: string;
  founderEmail: string;
  founderId: string | null;
  status: AdminOrgStatus;
  plan: AdminOrgPlan;
  usersCount: number;
  createdAt: string;
  lastActivityAt: string | null;
  founderLastLogin: string | null;
  conversationsThisMonth: number;
  dealsClosedThisMonth: number;
  billingThisMonth: number;
  billingThisMonthLabel: string;
  mrrUsd: number;
};

/** @deprecated Usar AdminOrganizationListRow */
export type AdminOrganization = {
  id: string;
  name: string;
  founder: string;
  mrr: string;
  status: "active" | "trial" | "churned";
  aiCostMonth: string;
};

export type OrganizationNote = {
  id: string;
  note: string;
  created_by: string | null;
  created_at: string;
};

export type OrganizationIntegration = {
  id: string;
  name: string;
  connected: boolean;
  detail?: string;
};

export type OrganizationUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  lastLogin: string | null;
};

export type OrganizationAiCostBreakdown = {
  haikuUsd: number;
  sonnetUsd: number;
  opusUsd: number;
  embeddingsUsd: number;
  storageUsd: number;
  infrastructureUsd: number;
  totalUsd: number;
};

export type TokenUsageDailyPoint = {
  date: string;
  costUsd: number;
};

export type AdminOrganizationDetail = {
  id: string;
  name: string;
  status: AdminOrgStatus;
  plan: AdminOrgPlan;
  createdAt: string;
  mrrUsd: number;
  founder: {
    id: string | null;
    name: string;
    email: string;
    lastLogin: string | null;
  };
  users: OrganizationUser[];
  onboarding: Record<string, unknown> | null;
  metrics: {
    conversationsThisMonth: number;
    dealsClosedThisMonth: number;
    billingThisMonth: number;
    cashCollectedThisMonth: number;
  };
  integrations: OrganizationIntegration[];
  notes: OrganizationNote[];
  aiCost: OrganizationAiCostBreakdown;
  tokenUsage: {
    costMonthUsd: number;
    daily: TokenUsageDailyPoint[];
  };
};

export type AdminUserRow = {
  id: string;
  name: string;
  email: string;
  organizationId: string;
  organizationName: string;
  role: string;
  status: "active" | "inactive";
  lastLogin: string | null;
};

export type AdminProfitabilitySummary = {
  totalMrrUsd: number;
  totalTokenCostMonthUsd: number;
  totalInfraCostUsd: number;
  estimatedGrossMarginUsd: number;
  globalMarginPercent: number;
  activeOrganizations: number;
};

export type AdminProfitabilityOrgRow = {
  orgId: string;
  orgName: string;
  mrrUsd: number;
  tokenCostMonthUsd: number;
  tokenCostPrevMonthUsd: number;
  estimatedMarginUsd: number;
  marginPercent: number;
  trend: "up" | "down" | "flat";
};

export type OrgAiCostRow = {
  orgId: string;
  orgName: string;
  plan: AdminOrgPlan;
  mrrUsd: number;
  claudeHaikuUsd: number;
  claudeSonnetUsd: number;
  claudeOpusUsd: number;
  embeddingsUsd: number;
  storageUsd: number;
  infrastructureUsd: number;
  totalMonthUsd: number;
  marginUsd: number;
  marginPercent: number;
  aiKeySource: "byok" | "otc";
};

export type AdminAiCostDashboard = {
  summary: AdminProfitabilitySummary;
  organizations: OrgAiCostRow[];
  profitabilityChart: {
    orgName: string;
    mrrUsd: number;
    costUsd: number;
    marginUsd: number;
  }[];
};

export type TokenUsageBreakdown = {
  period: "day" | "week" | "month" | "year";
  inputTokens: number;
  outputTokens: number;
  totalCostUsd: number;
  byModel: { model: string; tokens: number; costUsd: number }[];
  byFeature: { feature: string; tokens: number; costUsd: number }[];
};

export type InfrastructureStats = {
  organizations: number;
  users: number;
  conversations: number;
  closingCalls: number;
  clients: number;
  aiBrainDocuments: number;
};

export type CreateFounderResult = {
  organizationId: string;
  organizationName: string;
  email: string;
  password: string;
  emailSent: boolean;
  emailError?: string;
};

/** @deprecated */
export type AdminUsageRow = {
  orgId: string;
  orgName: string;
  haikuTokens: number;
  sonnetTokens: number;
  opusTokens: number;
  totalCost: string;
};

/** @deprecated */
export type AdminFounder = {
  id: string;
  name: string;
  email: string;
  organization: string;
  mrr: string;
  status: "active" | "trial";
};

/** @deprecated */
export type AdminTeamAccount = {
  id: string;
  name: string;
  email: string;
  organization: string;
  role: string;
  lastLogin: string;
};
