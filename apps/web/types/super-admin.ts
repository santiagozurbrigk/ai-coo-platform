export type AdminOrganization = {
  id: string;
  name: string;
  founder: string;
  mrr: string;
  status: "active" | "trial" | "churned";
  aiCostMonth: string;
};

export type AdminUsageRow = {
  orgId: string;
  orgName: string;
  haikuTokens: number;
  sonnetTokens: number;
  opusTokens: number;
  totalCost: string;
};

export type AdminFounder = {
  id: string;
  name: string;
  email: string;
  organization: string;
  mrr: string;
  status: "active" | "trial";
};

export type AdminTeamAccount = {
  id: string;
  name: string;
  email: string;
  organization: string;
  role: string;
  lastLogin: string;
};
