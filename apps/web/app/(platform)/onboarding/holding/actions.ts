"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isMissingTableError } from "@/lib/auth/bootstrap";
import {
  computeHoldingRevenue,
  type HoldingBillingModel,
  type HoldingOnboardingData,
} from "@/lib/holding/billing";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { paths } from "@/routes";

async function requireHoldingOrgId(): Promise<string> {
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
    throw new Error("Esta acción es solo para cuentas holding");
  }

  return profile.organization_id;
}

async function markHoldingOnboardingComplete(
  organizationId: string,
  payload: HoldingOnboardingData
) {
  const supabase = await createClient();
  const now = new Date().toISOString();

  const { data: existing } = await supabase
    .from("onboarding_responses")
    .select("id")
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("onboarding_responses")
      .update({
        data: payload,
        completed_at: now,
        updated_at: now,
      })
      .eq("organization_id", organizationId);

    if (error) throw new Error(error.message);
    return;
  }

  const { error } = await supabase.from("onboarding_responses").insert({
    organization_id: organizationId,
    data: payload,
    completed_at: now,
  });

  if (error) {
    if (isMissingTableError(error.message)) {
      throw new Error(
        "Falta la tabla onboarding_responses. Ejecuta la migración en Supabase."
      );
    }
    throw new Error(error.message);
  }
}

export async function saveHoldingBillingModelAction(
  model: HoldingBillingModel
) {
  const holdingOrgId = await requireHoldingOrgId();
  const admin = createAdminClient();

  const { error } = await admin
    .from("organizations")
    .update({ holding_billing_model: model })
    .eq("id", holdingOrgId);

  if (error) throw new Error(error.message);

  return { ok: true as const };
}

export async function completeHoldingOnboardingAction(data: {
  businesses: Array<{
    name: string;
    revenueSharePct?: number;
    fixedFeeAmount?: number;
    fixedFeeCurrency?: string;
  }>;
}) {
  const holdingOrgId = await requireHoldingOrgId();
  const admin = createAdminClient();

  const { data: holdingOrg, error: holdingError } = await admin
    .from("organizations")
    .select("holding_billing_model")
    .eq("id", holdingOrgId)
    .single();

  if (holdingError || !holdingOrg?.holding_billing_model) {
    throw new Error("Elegí primero tu modelo de cobro");
  }

  const billingModel = holdingOrg.holding_billing_model as HoldingBillingModel;
  const businesses = data.businesses
    .map((b) => ({ ...b, name: b.name.trim() }))
    .filter((b) => b.name.length > 0);

  if (businesses.length === 0) {
    throw new Error("Agregá al menos un negocio");
  }

  for (const business of businesses) {
    if (billingModel === "revenue_share") {
      const pct = Number(business.revenueSharePct);
      if (Number.isNaN(pct) || pct < 0 || pct > 100) {
        throw new Error(
          `El % de revenue share de "${business.name}" debe estar entre 0 y 100`
        );
      }
    } else {
      const amount = Number(business.fixedFeeAmount);
      if (Number.isNaN(amount) || amount <= 0) {
        throw new Error(
          `El monto fijo de "${business.name}" debe ser mayor a 0`
        );
      }
    }

    const { data: newOrg, error: orgError } = await admin
      .from("organizations")
      .insert({
        name: business.name,
        status: "active",
        account_type: "founder",
      })
      .select("id")
      .single();

    if (orgError || !newOrg) {
      throw new Error(orgError?.message ?? `Error creando "${business.name}"`);
    }

    const { error: linkError } = await admin.from("holding_businesses").insert({
      holding_org_id: holdingOrgId,
      business_org_id: newOrg.id,
      business_name: business.name,
      revenue_share_pct:
        billingModel === "revenue_share"
          ? Number(business.revenueSharePct)
          : null,
      fixed_fee_amount:
        billingModel === "fixed_fee"
          ? Number(business.fixedFeeAmount)
          : null,
      fixed_fee_currency:
        billingModel === "fixed_fee"
          ? business.fixedFeeCurrency ?? "USD"
          : null,
      status: "active",
    });

    if (linkError) {
      await admin.from("organizations").delete().eq("id", newOrg.id);
      throw new Error(linkError.message);
    }
  }

  await markHoldingOnboardingComplete(holdingOrgId, {
    kind: "holding",
    billingModel,
    businessCount: businesses.length,
  });

  revalidatePath(paths.platform.holding);
  revalidatePath(paths.platform.holdingOnboarding);
  redirect(paths.platform.holding);
}

export async function getHoldingOnboardingStateAction() {
  const holdingOrgId = await requireHoldingOrgId();
  const admin = createAdminClient();

  const { data: org } = await admin
    .from("organizations")
    .select("holding_billing_model")
    .eq("id", holdingOrgId)
    .maybeSingle();

  return {
    billingModel: (org?.holding_billing_model as HoldingBillingModel | null) ?? null,
  };
}
