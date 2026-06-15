import { createAdminClient } from "@/lib/supabase/admin";
import { requireSuperAdmin } from "@/lib/auth/require-super-admin";
import { loadOrgHealthScores } from "@/lib/super-admin/org-health";
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

export type HoldingPortfolioData = {
  holdingName: string;
  combinedRevenue: number;
  totalActiveUsers: number;
  totalIntegrations: number;
  organizations: HoldingOrgCard[];
};

function inferPlan(mrrUsd: number, status: string): AdminOrgPlan {
  if (status === "trial") return "trial";
  if (mrrUsd >= 50000) return "enterprise";
  if (mrrUsd >= 30000) return "growth";
  return "starter";
}

function healthLabelFromScore(
  score: number
): HoldingOrgCard["healthLabel"] {
  if (score >= 75) return "excellent";
  if (score >= 50) return "good";
  return "at_risk";
}

async function countIntegrationsForOrg(
  admin: ReturnType<typeof createAdminClient>,
  orgId: string
): Promise<number> {
  const tables = [
    "calendly_integrations",
    "manychat_integrations",
    "instagram_integrations",
    "youtube_integrations",
    "fathom_integrations",
    "stripe_integrations",
  ] as const;

  const results = await Promise.all(
    tables.map((table) =>
      admin.from(table).select("organization_id").eq("organization_id", orgId).maybeSingle()
    )
  );

  return results.filter((r) => Boolean(r.data)).length;
}

export async function loadHoldingPortfolio(): Promise<HoldingPortfolioData> {
  await requireSuperAdmin();

  const admin = createAdminClient();
  const [orgsRes, profilesRes, healthRows] = await Promise.all([
    admin
      .from("organizations")
      .select("id, name, status, mrr_usd")
      .eq("status", "active")
      .order("name"),
    admin.from("profiles").select("organization_id, is_active"),
    loadOrgHealthScores(),
  ]);

  const healthByOrg = new Map(healthRows.map((h) => [h.orgId, h]));
  const usersByOrg = new Map<string, number>();

  for (const profile of profilesRes.data ?? []) {
    if (profile.is_active === false) continue;
    const orgId = profile.organization_id as string;
    usersByOrg.set(orgId, (usersByOrg.get(orgId) ?? 0) + 1);
  }

  const organizations: HoldingOrgCard[] = await Promise.all(
    (orgsRes.data ?? []).map(async (org) => {
      const mrrUsd = Number(org.mrr_usd ?? 0);
      const health = healthByOrg.get(org.id);
      const healthScore = health?.healthScore ?? 0;

      return {
        id: org.id,
        name: org.name,
        plan: inferPlan(mrrUsd, org.status),
        mrrUsd,
        activeUsers: usersByOrg.get(org.id) ?? 0,
        activeIntegrations: await countIntegrationsForOrg(admin, org.id),
        healthScore,
        healthLabel: healthLabelFromScore(healthScore),
      };
    })
  );

  return {
    holdingName: "Portfolio OTC",
    combinedRevenue: organizations.reduce((sum, o) => sum + o.mrrUsd, 0),
    totalActiveUsers: organizations.reduce((sum, o) => sum + o.activeUsers, 0),
    totalIntegrations: organizations.reduce(
      (sum, o) => sum + o.activeIntegrations,
      0
    ),
    organizations,
  };
}
