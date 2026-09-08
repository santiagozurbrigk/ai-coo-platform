import { headers, cookies } from "next/headers";
import { readActiveOrgCookie } from "@/lib/holding/constants";
import { verifyHoldingBusinessAccess } from "@/lib/holding/switch-org";

type OrgAccountType = { account_type?: string };

export function readAccountType(
  organizations: OrgAccountType | OrgAccountType[] | null | undefined
): string | null {
  if (!organizations) return null;
  if (Array.isArray(organizations)) return organizations[0]?.account_type ?? null;
  return organizations.account_type ?? null;
}

export async function resolveEffectiveOrganizationId(
  holdingOrgId: string,
  accountType: string | null
): Promise<string> {
  if (accountType !== "holding") return holdingOrgId;

  const headersList = await headers();
  const fromHeader = headersList.get("x-active-org-id");
  if (
    fromHeader &&
    (await verifyHoldingBusinessAccess(holdingOrgId, fromHeader))
  ) {
    return fromHeader;
  }

  const cookieStore = await cookies();
  const fromCookie = readActiveOrgCookie(cookieStore);
  if (
    fromCookie &&
    (await verifyHoldingBusinessAccess(holdingOrgId, fromCookie))
  ) {
    return fromCookie;
  }

  return holdingOrgId;
}
