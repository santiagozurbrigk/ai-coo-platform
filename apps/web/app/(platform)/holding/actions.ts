"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { ACTIVE_ORG_COOKIE } from "@/lib/holding/constants";
import { getHoldingBusinesses } from "@/lib/holding/switch-org";
import { paths } from "@/routes";

async function requireHoldingProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");

  const { data: profile } = await supabase
    .from("profiles")
    .select("organization_id, organizations(account_type)")
    .eq("id", user.id)
    .single();

  if (!profile?.organization_id) throw new Error("Sin perfil");

  const org = profile.organizations as { account_type?: string } | null;
  if (org?.account_type !== "holding") {
    throw new Error("No es una cuenta holding");
  }

  return { holdingOrgId: profile.organization_id };
}

export async function switchActiveBusinessAction(businessOrgId: string) {
  const { holdingOrgId } = await requireHoldingProfile();

  const adminClient = createAdminClient();
  const { data: business } = await adminClient
    .from("holding_businesses")
    .select("id")
    .eq("holding_org_id", holdingOrgId)
    .eq("business_org_id", businessOrgId)
    .eq("status", "active")
    .maybeSingle();

  if (!business) throw new Error("Sin acceso a ese negocio");

  const cookieStore = await cookies();
  cookieStore.set(ACTIVE_ORG_COOKIE, businessOrgId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24,
    path: "/",
  });

  revalidatePath("/", "layout");
  redirect(paths.platform.dashboard);
}

export async function resetToHoldingViewAction() {
  await requireHoldingProfile();

  const cookieStore = await cookies();
  cookieStore.delete(ACTIVE_ORG_COOKIE);

  revalidatePath("/", "layout");
  redirect(paths.platform.holding);
}

export async function getHoldingDashboardAction() {
  const { holdingOrgId } = await requireHoldingProfile();
  const adminClient = createAdminClient();
  const businesses = await getHoldingBusinesses(holdingOrgId);
  const thirtyDaysAgo = new Date(
    Date.now() - 30 * 24 * 60 * 60 * 1000
  ).toISOString();

  const businessesWithMetrics = await Promise.all(
    businesses.map(async (b) => {
      const orgId = b.business_org?.id ?? "";
      if (!orgId) {
        return {
          ...b,
          metrics: {
            mrr: 0,
            holdingRevenue: 0,
            activeConversations: 0,
            closedCalls: 0,
          },
        };
      }

      const [clientsRes, conversationsRes, closingRes] = await Promise.all([
        adminClient
          .from("clients")
          .select("total_amount")
          .eq("organization_id", orgId),
        adminClient
          .from("conversations")
          .select("id", { count: "exact", head: true })
          .eq("organization_id", orgId)
          .gte("created_at", thirtyDaysAgo),
        adminClient
          .from("closing_calls")
          .select("id", { count: "exact", head: true })
          .eq("organization_id", orgId)
          .eq("status", "closed")
          .gte("scheduled_at", thirtyDaysAgo),
      ]);

      const mrr =
        (clientsRes.data ?? []).reduce(
          (sum, c) => sum + Number(c.total_amount ?? 0),
          0
        ) ?? 0;

      const sharePct = Number(b.revenue_share_pct ?? 0);
      const holdingRevenue = sharePct > 0 ? mrr * (sharePct / 100) : 0;

      return {
        ...b,
        metrics: {
          mrr,
          holdingRevenue,
          activeConversations: conversationsRes.count ?? 0,
          closedCalls: closingRes.count ?? 0,
        },
      };
    })
  );

  const totalMRR = businessesWithMetrics.reduce(
    (sum, b) => sum + b.metrics.mrr,
    0
  );
  const totalHoldingRevenue = businessesWithMetrics.reduce(
    (sum, b) => sum + b.metrics.holdingRevenue,
    0
  );
  const totalConversations = businessesWithMetrics.reduce(
    (sum, b) => sum + b.metrics.activeConversations,
    0
  );

  return {
    businesses: businessesWithMetrics,
    kpis: {
      totalBusinesses: businesses.length,
      totalMRR,
      totalHoldingRevenue,
      totalConversations,
    },
  };
}
