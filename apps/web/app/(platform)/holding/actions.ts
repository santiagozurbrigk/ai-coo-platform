"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { generateTempPassword } from "@/lib/auth/generate-temp-password";
import type { TempCredentials } from "@/lib/auth/temp-credentials";
import {
  computeHoldingRevenue,
  type HoldingBillingModel,
} from "@/lib/holding/billing";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { ACTIVE_ORG_COOKIE } from "@/lib/holding/constants";
import { getHoldingBusinesses } from "@/lib/holding/switch-org";
import { runMutation, type MutationResult } from "@/lib/server/action-result";
import { paths } from "@/routes";

async function requireHoldingProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");

  const { data: profile } = await supabase
    .from("profiles")
    .select("organization_id, organizations(account_type, holding_billing_model)")
    .eq("id", user.id)
    .single();

  if (!profile?.organization_id) throw new Error("Sin perfil");

  const org = profile.organizations as {
    account_type?: string;
    holding_billing_model?: HoldingBillingModel | null;
  } | null;
  if (org?.account_type !== "holding") {
    throw new Error("No sos dueño de un holding");
  }

  return {
    holdingOrgId: profile.organization_id,
    userId: user.id,
    billingModel: org.holding_billing_model ?? null,
  };
}

export async function addBusinessToMyHoldingAction(input: {
  businessName: string;
  revenueSharePct?: number;
  fixedFeeAmount?: number;
  fixedFeeCurrency?: string;
  founderEmail?: string;
}): Promise<
  MutationResult<{ orgId: string; tempCredentials?: TempCredentials }>
> {
  return runMutation(async () => {
    const { holdingOrgId, billingModel } = await requireHoldingProfile();
    const admin = createAdminClient();

    const businessName = input.businessName.trim();
    if (!businessName) throw new Error("El nombre del negocio es obligatorio.");

    if (!billingModel) {
      throw new Error(
        "Completá el onboarding del holding antes de agregar negocios"
      );
    }

    let revenueSharePct: number | null = null;
    let fixedFeeAmount: number | null = null;
    let fixedFeeCurrency: string | null = null;

    if (billingModel === "revenue_share") {
      const pct = Number(input.revenueSharePct);
      if (Number.isNaN(pct) || pct < 0 || pct > 100) {
        throw new Error("El % de revenue share debe estar entre 0 y 100.");
      }
      revenueSharePct = pct;
    } else {
      const amount = Number(input.fixedFeeAmount);
      if (Number.isNaN(amount) || amount <= 0) {
        throw new Error("El monto fijo debe ser mayor a 0.");
      }
      fixedFeeAmount = amount;
      fixedFeeCurrency = input.fixedFeeCurrency?.trim() || "USD";
    }

    const { data: newOrg, error: orgError } = await admin
      .from("organizations")
      .insert({
        name: businessName,
        status: "active",
        account_type: "founder",
        skip_onboarding: true,
      })
      .select("id")
      .single();

    if (orgError || !newOrg) {
      throw new Error(orgError?.message ?? "Error creando el negocio");
    }

    const { error: linkError } = await admin.from("holding_businesses").insert({
      holding_org_id: holdingOrgId,
      business_org_id: newOrg.id,
      business_name: businessName,
      revenue_share_pct: revenueSharePct,
      fixed_fee_amount: fixedFeeAmount,
      fixed_fee_currency: fixedFeeCurrency,
      status: "active",
    });

    if (linkError) {
      await admin.from("organizations").delete().eq("id", newOrg.id);
      throw new Error(linkError.message);
    }

    const founderEmail = input.founderEmail?.trim().toLowerCase();
    let tempCredentials: TempCredentials | undefined;

    if (founderEmail) {
      const tempPassword = generateTempPassword();
      const { data: authUser, error: authError } =
        await admin.auth.admin.createUser({
          email: founderEmail,
          password: tempPassword,
          email_confirm: true,
          user_metadata: { full_name: "Founder" },
        });

      if (authError || !authUser.user) {
        throw new Error(
          authError?.message ?? "Error creando usuario del founder"
        );
      }

      const { error: profileError } = await admin.from("profiles").insert({
        id: authUser.user.id,
        email: founderEmail,
        full_name: "Founder",
        role: "founder",
        organization_id: newOrg.id,
        must_change_password: true,
      });

      if (profileError) {
        await admin.auth.admin.deleteUser(authUser.user.id);
        throw new Error(profileError.message);
      }

      void admin.rpc("create_default_roles", { org_id: newOrg.id });
      tempCredentials = { email: founderEmail, tempPassword };
    }

    revalidatePath(paths.platform.holding);
    revalidatePath("/", "layout");

    return { orgId: newOrg.id, tempCredentials };
  });
}

export async function getHoldingDashboardAction() {
  const { holdingOrgId, billingModel } = await requireHoldingProfile();
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

      const holdingRevenue = computeHoldingRevenue({
        billingModel,
        mrr,
        revenueSharePct: b.revenue_share_pct,
        fixedFeeAmount: b.fixed_fee_amount,
      });

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
    billingModel,
    businesses: businessesWithMetrics,
    kpis: {
      totalBusinesses: businesses.length,
      totalMRR,
      totalHoldingRevenue,
      totalConversations,
    },
  };
}

export async function enterBusinessAction(businessOrgId: string) {
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

export async function exitBusinessAction() {
  await requireHoldingProfile();

  const cookieStore = await cookies();
  cookieStore.delete(ACTIVE_ORG_COOKIE);

  revalidatePath("/", "layout");
  redirect(paths.platform.holding);
}

/** @deprecated Usar enterBusinessAction */
export async function switchActiveBusinessAction(businessOrgId: string) {
  return enterBusinessAction(businessOrgId);
}

/** @deprecated Usar exitBusinessAction */
export async function resetToHoldingViewAction() {
  return exitBusinessAction();
}
