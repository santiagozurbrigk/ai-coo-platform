import type { AdminOrgPlan } from "@/types/super-admin";

export type HoldingOrgCard = {
  id: string;
  name: string;
  plan: AdminOrgPlan;
  mrrUsd: number;
  activeUsers: number;
  activeIntegrations: number;
  healthScore: number;
  healthLabel: "excellent" | "good" | "at_risk";
};

export const mockHoldingPortfolio = {
  holdingName: "OTC Ventures",
  combinedRevenue: 24_800,
  totalActiveUsers: 47,
  totalIntegrations: 18,
  organizations: [
    {
      id: "org-acme",
      name: "Acme Coaching",
      plan: "growth" as AdminOrgPlan,
      mrrUsd: 8_500,
      activeUsers: 18,
      activeIntegrations: 6,
      healthScore: 92,
      healthLabel: "excellent" as const,
    },
    {
      id: "org-scale",
      name: "Scale Mentors",
      plan: "enterprise" as AdminOrgPlan,
      mrrUsd: 12_300,
      activeUsers: 22,
      activeIntegrations: 8,
      healthScore: 78,
      healthLabel: "good" as const,
    },
    {
      id: "org-creator",
      name: "Creator Labs",
      plan: "starter" as AdminOrgPlan,
      mrrUsd: 4_000,
      activeUsers: 7,
      activeIntegrations: 4,
      healthScore: 61,
      healthLabel: "at_risk" as const,
    },
  ] satisfies HoldingOrgCard[],
};
