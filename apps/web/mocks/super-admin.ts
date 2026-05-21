import type {
  AdminFounder,
  AdminOrganization,
  AdminTeamAccount,
  AdminUsageRow,
} from "@/types/super-admin";

export const mockOrganizations: AdminOrganization[] = [
  { id: "org1", name: "Acme Coaching Co.", founder: "Jane Doe", mrr: "$84.2K", status: "active", aiCostMonth: "$124" },
  { id: "org2", name: "Scale Mentors LLC", founder: "John Smith", mrr: "$42K", status: "active", aiCostMonth: "$89" },
  { id: "org3", name: "Creator Labs", founder: "Alex Kim", mrr: "$18K", status: "trial", aiCostMonth: "$32" },
];

export const mockAiUsage: AdminUsageRow[] = [
  { orgId: "org1", orgName: "Acme Coaching Co.", haikuTokens: 420000, sonnetTokens: 180000, opusTokens: 45000, totalCost: "$124" },
  { orgId: "org2", orgName: "Scale Mentors LLC", haikuTokens: 310000, sonnetTokens: 120000, opusTokens: 20000, totalCost: "$89" },
  { orgId: "org3", orgName: "Creator Labs", haikuTokens: 95000, sonnetTokens: 40000, opusTokens: 5000, totalCost: "$32" },
];

export const mockFounders: AdminFounder[] = [
  { id: "f1", name: "Jane Doe", email: "jane@acme.co", organization: "Acme Coaching Co.", mrr: "$84.2K", status: "active" },
  { id: "f2", name: "John Smith", email: "john@scalementors.com", organization: "Scale Mentors LLC", mrr: "$42K", status: "active" },
  { id: "f3", name: "Alex Kim", email: "alex@creatorlabs.io", organization: "Creator Labs", mrr: "$18K", status: "trial" },
];

export const mockTeamAccounts: AdminTeamAccount[] = [
  { id: "ta1", name: "Alex Rivera", email: "alex@acme.co", organization: "Acme Coaching Co.", role: "Setter", lastLogin: "2026-05-21T09:00:00Z" },
  { id: "ta2", name: "Jordan Lee", email: "jordan@acme.co", organization: "Acme Coaching Co.", role: "Operador", lastLogin: "2026-05-20T14:30:00Z" },
  { id: "ta3", name: "Sam Ortiz", email: "sam@scalementors.com", organization: "Scale Mentors LLC", role: "Gestor de proyecto", lastLogin: "2026-05-19T11:00:00Z" },
];
