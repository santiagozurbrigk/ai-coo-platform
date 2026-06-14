"use server";

import { revalidatePath } from "next/cache";
import {
  isMissingTableError,
  requireOrganizationId,
} from "@/lib/auth/bootstrap";
import {
  buildProductContextText,
  type CustomerAvatarRow,
  type ProductAgentContext,
  type ProductRow,
  type SalesFrameworkRow,
} from "@/lib/product/mapper";
import {
  actionErrorMessage,
  runMutation,
  type MutationResult,
} from "@/lib/server/action-result";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { paths } from "@/routes/paths";

function revalidateProduct() {
  revalidatePath(paths.platform.product.root);
  revalidatePath(paths.platform.product.valueLadder);
  revalidatePath(paths.platform.product.proposition);
}

export async function getAvatarsAction(): Promise<CustomerAvatarRow[]> {
  if (!isSupabaseConfigured()) return [];

  const organizationId = await requireOrganizationId();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("customer_avatars")
    .select("*")
    .eq("organization_id", organizationId)
    .order("is_primary", { ascending: false });

  if (error) {
    if (isMissingTableError(error.message)) return [];
    throw new Error(error.message);
  }

  return (data ?? []) as CustomerAvatarRow[];
}

export async function saveAvatarAction(data: {
  id?: string;
  name: string;
  ageRange?: string;
  occupation?: string;
  location?: string;
  incomeRange?: string;
  mainPain: string;
  secondaryPains?: string[];
  desires?: string[];
  fears?: string[];
  objections?: string[];
  whereTheyHang?: string;
  languageTheyUse?: string;
  isPrimary?: boolean;
}): Promise<MutationResult<{ ok: true }>> {
  return runMutation(async () => {
    const organizationId = await requireOrganizationId();
    const supabase = await createClient();

    if (data.isPrimary) {
      await supabase
        .from("customer_avatars")
        .update({ is_primary: false })
        .eq("organization_id", organizationId);
    }

    const payload = {
      organization_id: organizationId,
      name: data.name.trim(),
      age_range: data.ageRange ?? null,
      occupation: data.occupation ?? null,
      location: data.location ?? null,
      income_range: data.incomeRange ?? null,
      main_pain: data.mainPain.trim(),
      secondary_pains: data.secondaryPains ?? [],
      desires: data.desires ?? [],
      fears: data.fears ?? [],
      objections: data.objections ?? [],
      where_they_hang: data.whereTheyHang ?? null,
      language_they_use: data.languageTheyUse ?? null,
      is_primary: data.isPrimary ?? false,
      updated_at: new Date().toISOString(),
    };

    if (data.id) {
      const { error } = await supabase
        .from("customer_avatars")
        .update(payload)
        .eq("id", data.id)
        .eq("organization_id", organizationId);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabase.from("customer_avatars").insert(payload);
      if (error) throw new Error(error.message);
    }

    revalidateProduct();
    return { ok: true };
  });
}

export async function deleteAvatarAction(
  avatarId: string
): Promise<MutationResult<{ ok: true }>> {
  return runMutation(async () => {
    const organizationId = await requireOrganizationId();
    const supabase = await createClient();

    const { error } = await supabase
      .from("customer_avatars")
      .delete()
      .eq("id", avatarId)
      .eq("organization_id", organizationId);

    if (error) throw new Error(error.message);

    revalidateProduct();
    return { ok: true };
  });
}

export async function getProductsAction(): Promise<ProductRow[]> {
  if (!isSupabaseConfigured()) return [];

  const organizationId = await requireOrganizationId();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select("*, target_avatar:customer_avatars(name)")
    .eq("organization_id", organizationId)
    .order("value_ladder_position", { ascending: true });

  if (error) {
    if (isMissingTableError(error.message)) return [];
    throw new Error(error.message);
  }

  return (data ?? []) as ProductRow[];
}

export async function saveProductAction(data: {
  id?: string;
  name: string;
  description?: string;
  type?: string;
  price?: number;
  currency?: string;
  billingType?: string;
  valueLadderPosition?: number;
  bonuses?: string[];
  guarantee?: string;
  targetAvatarId?: string;
  isActive?: boolean;
}): Promise<MutationResult<{ ok: true }>> {
  return runMutation(async () => {
    const organizationId = await requireOrganizationId();
    const supabase = await createClient();

    const payload = {
      organization_id: organizationId,
      name: data.name.trim(),
      description: data.description ?? null,
      type: data.type ?? "otro",
      price: data.price ?? null,
      currency: data.currency ?? "USD",
      billing_type: data.billingType ?? "unico",
      value_ladder_position: data.valueLadderPosition ?? 1,
      bonuses: data.bonuses ?? [],
      guarantee: data.guarantee ?? null,
      target_avatar_id: data.targetAvatarId ?? null,
      is_active: data.isActive ?? true,
      updated_at: new Date().toISOString(),
    };

    if (data.id) {
      const { error } = await supabase
        .from("products")
        .update(payload)
        .eq("id", data.id)
        .eq("organization_id", organizationId);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabase.from("products").insert(payload);
      if (error) throw new Error(error.message);
    }

    revalidateProduct();
    return { ok: true };
  });
}

export async function deleteProductAction(
  productId: string
): Promise<MutationResult<{ ok: true }>> {
  return runMutation(async () => {
    const organizationId = await requireOrganizationId();
    const supabase = await createClient();

    const { error } = await supabase
      .from("products")
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq("id", productId)
      .eq("organization_id", organizationId);

    if (error) throw new Error(error.message);

    revalidateProduct();
    return { ok: true };
  });
}

export async function getValueLadderAction() {
  if (!isSupabaseConfigured()) return [];

  const organizationId = await requireOrganizationId();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("value_ladder")
    .select("*, product:products(name, price, currency, type, billing_type, description)")
    .eq("organization_id", organizationId)
    .order("level", { ascending: true });

  if (error) {
    if (isMissingTableError(error.message)) return [];
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function getSalesFrameworksAction(): Promise<SalesFrameworkRow[]> {
  if (!isSupabaseConfigured()) return [];

  const organizationId = await requireOrganizationId();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("sales_frameworks")
    .select("*")
    .eq("organization_id", organizationId)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) {
    if (isMissingTableError(error.message)) return [];
    throw new Error(error.message);
  }

  return (data ?? []) as SalesFrameworkRow[];
}

export async function saveSalesFrameworkAction(data: {
  id?: string;
  name: string;
  description?: string;
  content: string;
  type?: string;
}): Promise<MutationResult<{ ok: true }>> {
  return runMutation(async () => {
    const organizationId = await requireOrganizationId();
    const supabase = await createClient();

    const payload = {
      organization_id: organizationId,
      name: data.name.trim(),
      description: data.description ?? null,
      content: data.content,
      type: data.type ?? "otro",
      updated_at: new Date().toISOString(),
    };

    if (data.id) {
      const { error } = await supabase
        .from("sales_frameworks")
        .update(payload)
        .eq("id", data.id)
        .eq("organization_id", organizationId);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabase.from("sales_frameworks").insert(payload);
      if (error) throw new Error(error.message);
    }

    revalidateProduct();
    return { ok: true };
  });
}

export async function getProductContextForOrg(
  organizationId: string
): Promise<ProductAgentContext> {
  const supabase = await createClient();

  const [avatars, products, frameworks] = await Promise.all([
    supabase
      .from("customer_avatars")
      .select("*")
      .eq("organization_id", organizationId)
      .eq("is_primary", true)
      .limit(1),
    supabase
      .from("products")
      .select("*")
      .eq("organization_id", organizationId)
      .eq("is_active", true)
      .order("value_ladder_position"),
    supabase
      .from("sales_frameworks")
      .select("name, content, type")
      .eq("organization_id", organizationId)
      .eq("is_active", true),
  ]);

  return {
    primaryAvatar: (avatars.data?.[0] as CustomerAvatarRow) ?? null,
    products: (products.data ?? []) as ProductRow[],
    frameworks: (frameworks.data ?? []) as ProductAgentContext["frameworks"],
  };
}

export async function getProductContextForAgentAction(): Promise<ProductAgentContext> {
  const organizationId = await requireOrganizationId();
  return getProductContextForOrg(organizationId);
}

export async function getProductContextTextForOrg(
  organizationId: string
): Promise<string> {
  try {
    const ctx = await getProductContextForOrg(organizationId);
    return buildProductContextText(ctx);
  } catch (error) {
    console.warn("[getProductContextTextForOrg]", actionErrorMessage(error));
    return "";
  }
}

export { buildProductContextText };
