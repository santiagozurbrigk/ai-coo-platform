import { requireSuperAdmin } from "@/lib/auth/require-super-admin";
import { isMissingTableError } from "@/lib/auth/bootstrap";
import { createAdminClient } from "@/lib/supabase/admin";

export type AdminHoldingBusinessLink = {
  id: string;
  business_name: string | null;
  revenue_share_pct: number | null;
  business_org: { id: string; name: string } | null;
};

export type AdminHoldingRow = {
  id: string;
  name: string;
  status: string;
  created_at: string;
  founderEmail: string | null;
  founderName: string | null;
  businesses: AdminHoldingBusinessLink[];
  portfolioMrr: number;
};

export type AvailableBusinessOrg = {
  id: string;
  name: string;
  status: string;
};

type BusinessOrgEmbed = { id: string; name: string };

function normalizeBusinessLink(
  row: {
    id: string;
    business_name: string | null;
    revenue_share_pct: number | null;
    business_org: BusinessOrgEmbed | BusinessOrgEmbed[] | null;
  }
): AdminHoldingBusinessLink {
  const org = row.business_org;
  const businessOrg = Array.isArray(org) ? org[0] ?? null : org;
  return {
    id: row.id,
    business_name: row.business_name,
    revenue_share_pct: row.revenue_share_pct,
    business_org: businessOrg,
  };
}

export async function loadHoldingsForAdmin(): Promise<AdminHoldingRow[]> {
  await requireSuperAdmin();
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("organizations")
    .select(
      `
      id,
      name,
      status,
      created_at,
      holding_businesses!holding_businesses_holding_org_id_fkey(
        id,
        business_name,
        revenue_share_pct,
        business_org:organizations!holding_businesses_business_org_id_fkey(id, name)
      ),
      profiles(email, full_name, role)
    `
    )
    .eq("account_type", "holding")
    .order("created_at", { ascending: false });

  if (error) {
    if (isMissingTableError(error.message)) return [];
    throw new Error(error.message);
  }

  const holdings = data ?? [];
  const allBusinessOrgIds = holdings.flatMap((h) =>
    (
      (h.holding_businesses ?? []) as {
        id: string;
        business_name: string | null;
        revenue_share_pct: number | null;
        business_org: BusinessOrgEmbed | BusinessOrgEmbed[] | null;
      }[]
    )
      .map(normalizeBusinessLink)
      .map((b) => b.business_org?.id)
      .filter((id): id is string => Boolean(id))
  );

  let mrrByOrg = new Map<string, number>();
  if (allBusinessOrgIds.length > 0) {
    const { data: clients } = await admin
      .from("clients")
      .select("organization_id, total_amount")
      .in("organization_id", allBusinessOrgIds);

    for (const row of clients ?? []) {
      const orgId = row.organization_id as string;
      mrrByOrg.set(
        orgId,
        (mrrByOrg.get(orgId) ?? 0) + Number(row.total_amount ?? 0)
      );
    }
  }

  return holdings.map((row) => {
    const profiles = (row.profiles ?? []) as {
      email: string;
      full_name: string | null;
      role: string;
    }[];
    const founder =
      profiles.find((p) => p.role === "founder") ?? profiles[0] ?? null;
    const businesses = (
      (row.holding_businesses ?? []) as {
        id: string;
        business_name: string | null;
        revenue_share_pct: number | null;
        business_org: BusinessOrgEmbed | BusinessOrgEmbed[] | null;
      }[]
    ).map(normalizeBusinessLink);

    const portfolioMrr = businesses.reduce(
      (sum, b) => sum + (mrrByOrg.get(b.business_org?.id ?? "") ?? 0),
      0
    );

    return {
      id: row.id as string,
      name: row.name as string,
      status: row.status as string,
      created_at: row.created_at as string,
      founderEmail: founder?.email ?? null,
      founderName: founder?.full_name ?? null,
      businesses,
      portfolioMrr,
    };
  });
}

export async function loadAvailableBusinessOrgs(): Promise<
  AvailableBusinessOrg[]
> {
  await requireSuperAdmin();
  const admin = createAdminClient();

  const [orgsRes, linksRes] = await Promise.all([
    admin
      .from("organizations")
      .select("id, name, status, account_type")
      .neq("account_type", "holding")
      .order("name"),
    admin.from("holding_businesses").select("business_org_id"),
  ]);

  if (orgsRes.error) {
    if (isMissingTableError(orgsRes.error.message)) return [];
    throw new Error(orgsRes.error.message);
  }

  const linkedIds = new Set(
    (linksRes.data ?? []).map((r) => r.business_org_id as string)
  );

  return (orgsRes.data ?? [])
    .filter((o) => !linkedIds.has(o.id as string))
    .map((o) => ({
      id: o.id as string,
      name: o.name as string,
      status: o.status as string,
    }));
}
