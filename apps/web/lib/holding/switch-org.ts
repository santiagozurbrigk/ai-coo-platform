import { cookies } from "next/headers";
import { isMissingTableError } from "@/lib/auth/bootstrap";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { ACTIVE_ORG_COOKIE } from "@/lib/holding/constants";

export type HoldingBusinessRow = {
  id: string;
  business_name: string | null;
  revenue_share_pct: number | null;
  status: string;
  business_org: {
    id: string;
    name: string;
    industry: string | null;
    status: string;
  } | null;
};

export async function verifyHoldingBusinessAccess(
  holdingOrgId: string,
  businessOrgId: string
): Promise<boolean> {
  if (holdingOrgId === businessOrgId) return true;

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("holding_businesses")
    .select("id")
    .eq("holding_org_id", holdingOrgId)
    .eq("business_org_id", businessOrgId)
    .eq("status", "active")
    .maybeSingle();

  if (error) {
    if (isMissingTableError(error.message)) return false;
    throw new Error(error.message);
  }

  return Boolean(data);
}

export async function getActiveOrgForHolding(
  holdingOrgId: string
): Promise<string> {
  const cookieStore = await cookies();
  const activeOrg = cookieStore.get(ACTIVE_ORG_COOKIE)?.value;

  if (activeOrg && (await verifyHoldingBusinessAccess(holdingOrgId, activeOrg))) {
    return activeOrg;
  }

  return holdingOrgId;
}

type OrgEmbed = {
  id: string;
  name: string;
  industry?: string | null;
  status?: string;
};

function normalizeOrgEmbed(
  org: OrgEmbed | OrgEmbed[] | null | undefined
): HoldingBusinessRow["business_org"] {
  if (!org) return null;
  const row = Array.isArray(org) ? org[0] : org;
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    industry: row.industry ?? null,
    status: row.status ?? "active",
  };
}

export async function getHoldingBusinesses(
  holdingOrgId: string
): Promise<HoldingBusinessRow[]> {
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("holding_businesses")
    .select(
      `
      id,
      business_name,
      revenue_share_pct,
      status,
      business_org:organizations!holding_businesses_business_org_id_fkey(
        id, name, industry, status
      )
    `
    )
    .eq("holding_org_id", holdingOrgId)
    .eq("status", "active")
    .order("added_at", { ascending: true });

  if (error) {
    if (isMissingTableError(error.message)) return [];
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => ({
    id: row.id as string,
    business_name: row.business_name as string | null,
    revenue_share_pct: row.revenue_share_pct as number | null,
    status: row.status as string,
    business_org: normalizeOrgEmbed(
      row.business_org as OrgEmbed | OrgEmbed[] | null
    ),
  }));
}

type OrgAccountType = { account_type?: string };

export async function isHoldingUser(): Promise<{
  isHolding: boolean;
  holdingOrgId?: string;
  businesses?: HoldingBusinessRow[];
}> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { isHolding: false };

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("organization_id, organizations(account_type)")
    .eq("id", user.id)
    .maybeSingle();

  if (error || !profile?.organization_id) return { isHolding: false };

  const org = profile.organizations as OrgAccountType | OrgAccountType[] | null;
  const accountType = Array.isArray(org) ? org[0]?.account_type : org?.account_type;

  if (accountType !== "holding") return { isHolding: false };

  const businesses = await getHoldingBusinesses(profile.organization_id);

  return {
    isHolding: true,
    holdingOrgId: profile.organization_id,
    businesses,
  };
}
