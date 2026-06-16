import { cookies } from "next/headers";
import { ACTIVE_ORG_COOKIE } from "@/lib/holding/constants";
import {
  getHoldingBusinesses,
  type HoldingBusinessRow,
} from "@/lib/holding/switch-org";
import { readAccountType } from "@/lib/holding/resolve-org";
import { createClient } from "@/lib/supabase/server";

export type HoldingSessionState = {
  isHolding: boolean;
  holdingOrgId?: string;
  activeOrgId?: string;
  viewingBusiness: boolean;
  activeBusinessName?: string;
  businesses: HoldingBusinessRow[];
};

const EMPTY: HoldingSessionState = {
  isHolding: false,
  viewingBusiness: false,
  businesses: [],
};

export async function getHoldingSessionState(): Promise<HoldingSessionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return EMPTY;

  const { data: profile } = await supabase
    .from("profiles")
    .select("organization_id, organizations(account_type)")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.organization_id) return EMPTY;

  const accountType = readAccountType(
    profile.organizations as { account_type?: string } | null
  );

  if (accountType !== "holding") return EMPTY;

  const holdingOrgId = profile.organization_id;
  const businesses = await getHoldingBusinesses(holdingOrgId);
  const cookieStore = await cookies();
  const cookieOrg = cookieStore.get(ACTIVE_ORG_COOKIE)?.value;

  let activeOrgId = holdingOrgId;
  let viewingBusiness = false;
  let activeBusinessName: string | undefined;

  if (cookieOrg && cookieOrg !== holdingOrgId) {
    const activeBusiness = businesses.find(
      (b) => b.business_org?.id === cookieOrg
    );
    if (activeBusiness) {
      activeOrgId = cookieOrg;
      viewingBusiness = true;
      activeBusinessName =
        activeBusiness.business_name ??
        activeBusiness.business_org?.name ??
        undefined;
    }
  }

  return {
    isHolding: true,
    holdingOrgId,
    activeOrgId,
    viewingBusiness,
    activeBusinessName,
    businesses,
  };
}
