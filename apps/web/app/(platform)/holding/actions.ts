"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { generateTempPassword } from "@/lib/auth/generate-temp-password";
import { loadProfileOrganizationContext } from "@/lib/auth/bootstrap";
import { tempPasswordProfileFields } from "@/lib/auth/temp-password-expiry";
import { regenerateUserTempPassword } from "@/lib/auth/regenerate-temp-password";
import type { TempCredentials } from "@/lib/auth/temp-credentials";
import {
  computeHoldingRevenue,
  type HoldingBillingModel,
} from "@/lib/holding/billing";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { ACTIVE_ORG_COOKIE } from "@/lib/holding/constants";
import { refreshAuthSessionAfterHoldingSwitch } from "@/lib/holding/refresh-auth-session";
import { getHoldingBusinesses } from "@/lib/holding/switch-org";
import {
  actionErrorMessage,
  runMutation,
  type MutationResult,
} from "@/lib/server/action-result";
import {
  addBusinessToMyHoldingSchema,
  enterBusinessSchema,
  firstZodError,
  regenerateBusinessFounderTempPasswordSchema,
} from "@/lib/validations";
import type { z } from "zod";
import { paths } from "@/routes";

async function requireHoldingProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");

  const { organizationId, accountType } = await loadProfileOrganizationContext(
    user.id
  );

  if (!organizationId) throw new Error("Sin perfil");
  if (accountType !== "holding") {
    throw new Error("No sos dueño de un holding");
  }

  const admin = createAdminClient();
  const { data: org } = await admin
    .from("organizations")
    .select("holding_billing_model")
    .eq("id", organizationId)
    .single();

  return {
    holdingOrgId: organizationId,
    userId: user.id,
    billingModel: (org?.holding_billing_model as HoldingBillingModel | null) ?? null,
  };
}

type HoldingProfileContext = Awaited<ReturnType<typeof requireHoldingProfile>>;

async function requireHoldingProfileAndParse<T extends z.ZodTypeAny>(
  schema: T,
  input: unknown
): Promise<
  | { success: true; data: z.infer<T>; profile: HoldingProfileContext }
  | { success: false; error: string }
> {
  let profile: HoldingProfileContext;
  try {
    profile = await requireHoldingProfile();
  } catch (error) {
    return { success: false, error: actionErrorMessage(error) };
  }

  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: firstZodError(parsed.error) };
  }

  return { success: true, data: parsed.data, profile };
}

export async function addBusinessToMyHoldingAction(
  input: unknown
): Promise<
  MutationResult<{ orgId: string; tempCredentials?: TempCredentials }>
> {
  const auth = await requireHoldingProfileAndParse(
    addBusinessToMyHoldingSchema,
    input
  );
  if (!auth.success) {
    return { success: false, error: auth.error };
  }

  const { data, profile } = auth;
  const { holdingOrgId, billingModel } = profile;

  return runMutation(async () => {
    const admin = createAdminClient();

    if (!billingModel) {
      throw new Error(
        "Completá el onboarding del holding antes de agregar negocios"
      );
    }

    let revenueSharePct: number | null = null;
    let fixedFeeAmount: number | null = null;
    let fixedFeeCurrency: string | null = null;

    if (billingModel === "revenue_share") {
      const pct = data.revenueSharePct;
      if (pct == null || Number.isNaN(pct)) {
        throw new Error("El % de revenue share debe estar entre 0 y 100.");
      }
      revenueSharePct = pct;
    } else {
      const amount = data.fixedFeeAmount;
      if (amount == null || Number.isNaN(amount) || amount <= 0) {
        throw new Error("El monto fijo debe ser mayor a 0.");
      }
      fixedFeeAmount = amount;
      fixedFeeCurrency = data.fixedFeeCurrency ?? "USD";
    }

    const { data: newOrg, error: orgError } = await admin
      .from("organizations")
      .insert({
        name: data.businessName,
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
      business_name: data.businessName,
      revenue_share_pct: revenueSharePct,
      fixed_fee_amount: fixedFeeAmount,
      fixed_fee_currency: fixedFeeCurrency,
      status: "active",
    });

    if (linkError) {
      await admin.from("organizations").delete().eq("id", newOrg.id);
      throw new Error(linkError.message);
    }

    const founderEmail = data.founderEmail;
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
        ...tempPasswordProfileFields(),
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
  const supabase = await createClient();
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
        supabase
          .from("clients")
          .select("total_amount")
          .eq("organization_id", orgId),
        supabase
          .from("conversations")
          .select("id", { count: "exact", head: true })
          .eq("organization_id", orgId)
          .gte("created_at", thirtyDaysAgo),
        supabase
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
  let profile: HoldingProfileContext;
  try {
    profile = await requireHoldingProfile();
  } catch (error) {
    throw new Error(actionErrorMessage(error));
  }

  const parsed = enterBusinessSchema.safeParse({ businessOrgId });
  if (!parsed.success) {
    throw new Error(firstZodError(parsed.error));
  }

  const { holdingOrgId, userId } = profile;
  const orgId = parsed.data.businessOrgId;

  const adminClient = createAdminClient();
  const { data: business } = await adminClient
    .from("holding_businesses")
    .select("id")
    .eq("holding_org_id", holdingOrgId)
    .eq("business_org_id", orgId)
    .eq("status", "active")
    .maybeSingle();

  if (!business) throw new Error("Sin acceso a ese negocio");

  const { error: sessionError } = await adminClient
    .from("holding_active_sessions")
    .upsert({
      profile_id: userId,
      business_org_id: orgId,
      set_at: new Date().toISOString(),
    });

  if (sessionError) {
    throw new Error(sessionError.message);
  }

  await refreshAuthSessionAfterHoldingSwitch();

  const cookieStore = await cookies();
  cookieStore.set(ACTIVE_ORG_COOKIE, orgId, {
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
  const { userId } = await requireHoldingProfile();
  const adminClient = createAdminClient();

  const { error: deleteError } = await adminClient
    .from("holding_active_sessions")
    .delete()
    .eq("profile_id", userId);

  if (deleteError) {
    throw new Error(deleteError.message);
  }

  await refreshAuthSessionAfterHoldingSwitch();

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

export async function regenerateBusinessFounderTempPasswordAction(
  businessOrgId: string
): Promise<MutationResult<TempCredentials>> {
  const auth = await requireHoldingProfileAndParse(
    regenerateBusinessFounderTempPasswordSchema,
    { businessOrgId }
  );
  if (!auth.success) {
    return { success: false, error: auth.error };
  }

  const { holdingOrgId } = auth.profile;
  const orgId = auth.data.businessOrgId;

  return runMutation(async () => {
    const admin = createAdminClient();

    const { data: link } = await admin
      .from("holding_businesses")
      .select("business_org_id")
      .eq("holding_org_id", holdingOrgId)
      .eq("business_org_id", orgId)
      .eq("status", "active")
      .maybeSingle();

    if (!link) {
      throw new Error("Negocio no encontrado en tu holding");
    }

    const { data: founder } = await admin
      .from("profiles")
      .select("id")
      .eq("organization_id", orgId)
      .eq("role", "founder")
      .maybeSingle();

    if (!founder?.id) {
      throw new Error("Este negocio no tiene un founder asignado");
    }

    const credentials = await regenerateUserTempPassword(founder.id);
    revalidatePath(paths.platform.holding);
    return credentials;
  });
}
