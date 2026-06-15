import { createAdminClient } from "@/lib/supabase/admin";
import { requireSuperAdmin } from "@/lib/auth/require-super-admin";
import type { OrgHealthRow } from "@/types/super-admin";

export type { OrgHealthRow };
export type OrgHealthStatus = OrgHealthRow["status"];

function scoreToStatus(score: number): OrgHealthStatus {
  if (score >= 75) return "healthy";
  if (score >= 50) return "warning";
  return "critical";
}

function countByOrg(rows: { organization_id: string }[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const row of rows) {
    map.set(row.organization_id, (map.get(row.organization_id) ?? 0) + 1);
  }
  return map;
}

export async function loadOrgHealthScores(): Promise<OrgHealthRow[]> {
  await requireSuperAdmin();

  const admin = createAdminClient();
  const thirtyDaysAgo = new Date(
    Date.now() - 30 * 24 * 60 * 60 * 1000
  ).toISOString();

  const [orgsRes, convRes, fathomRes, sopsRes, weeklyRes] = await Promise.all([
    admin.from("organizations").select("id, name").order("name"),
    admin
      .from("conversations")
      .select("organization_id")
      .gte("created_at", thirtyDaysAgo),
    admin
      .from("fathom_calls")
      .select("organization_id")
      .gte("created_at", thirtyDaysAgo),
    admin.from("sops").select("organization_id").eq("status", "active"),
    admin
      .from("weekly_inputs")
      .select("organization_id")
      .gte("created_at", thirtyDaysAgo),
  ]);

  const convCounts = countByOrg(
    (convRes.data ?? []) as { organization_id: string }[]
  );
  const fathomCounts = countByOrg(
    (fathomRes.data ?? []) as { organization_id: string }[]
  );
  const sopsCounts = countByOrg(
    (sopsRes.data ?? []) as { organization_id: string }[]
  );
  const weeklyCounts = countByOrg(
    (weeklyRes.data ?? []) as { organization_id: string }[]
  );

  const rows: OrgHealthRow[] = (orgsRes.data ?? []).map((org) => {
    const conversations = convCounts.get(org.id) ?? 0;
    const fathomCalls = fathomCounts.get(org.id) ?? 0;
    const sops = sopsCounts.get(org.id) ?? 0;
    const weeklyInputs = weeklyCounts.get(org.id) ?? 0;

    let healthScore = 0;
    if (conversations > 0) healthScore += 25;
    if (fathomCalls > 0) healthScore += 25;
    if (sops > 0) healthScore += 25;
    if (weeklyInputs > 0) healthScore += 25;

    return {
      orgId: org.id,
      orgName: org.name,
      healthScore,
      conversations,
      fathomCalls,
      sops,
      weeklyInputs,
      status: scoreToStatus(healthScore),
    };
  });

  return rows.sort((a, b) => a.healthScore - b.healthScore);
}
