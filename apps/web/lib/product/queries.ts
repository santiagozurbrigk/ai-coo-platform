import { requireOrganizationId } from "@/lib/auth/bootstrap";
import { isMissingTableError } from "@/lib/auth/bootstrap";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import {
  buildProductData,
  buildSpatialNodes,
  emptyProductData,
  type CustomerAvatarRow,
  type ProductRow,
  type ValueLadderRow,
} from "./mapper";
import type { ProductData, SpatialProductNode } from "@/types/product";

export type ProductPageData = {
  productData: ProductData;
  spatialNodes: SpatialProductNode[];
  hasRealData: boolean;
  canEdit: boolean;
};

export async function getProductPageData(): Promise<ProductPageData> {
  if (!isSupabaseConfigured()) {
    return {
      productData: emptyProductData,
      spatialNodes: [],
      hasRealData: false,
      canEdit: false,
    };
  }

  try {
    const organizationId = await requireOrganizationId();
    const supabase = await createClient();

    const [avatarsRes, productsRes, ladderRes] = await Promise.all([
      supabase
        .from("customer_avatars")
        .select("*")
        .eq("organization_id", organizationId)
        .order("is_primary", { ascending: false }),
      supabase
        .from("products")
        .select("*, target_avatar:customer_avatars(name)")
        .eq("organization_id", organizationId)
        .order("value_ladder_position", { ascending: true }),
      supabase
        .from("value_ladder")
        .select("*, product:products(name, price, currency, type, billing_type, description)")
        .eq("organization_id", organizationId)
        .order("level", { ascending: true }),
    ]);

    const errors = [avatarsRes.error, productsRes.error, ladderRes.error].filter(
      Boolean
    );
    if (errors.some((e) => e && !isMissingTableError(e.message))) {
      throw new Error(errors[0]?.message ?? "Error al cargar producto");
    }

    const avatarRows = (avatarsRes.data ?? []) as CustomerAvatarRow[];
    const productRows = (productsRes.data ?? []) as ProductRow[];
    const ladderRows = (ladderRes.data ?? []) as ValueLadderRow[];

    const hasRealData = avatarRows.length > 0 || productRows.length > 0;

    if (!hasRealData) {
      return {
        productData: emptyProductData,
        spatialNodes: [],
        hasRealData: false,
        canEdit: true,
      };
    }

    const productData = buildProductData(avatarRows, productRows, ladderRows);
    return {
      productData,
      spatialNodes: buildSpatialNodes(productData),
      hasRealData: true,
      canEdit: true,
    };
  } catch {
    return {
      productData: emptyProductData,
      spatialNodes: [],
      hasRealData: false,
      canEdit: true,
    };
  }
}

export async function getProductAvatarById(id: string) {
  const page = await getProductPageData();
  return page.productData.avatars.find((a) => a.id === id) ?? null;
}

export async function getProductOfferById(id: string) {
  const page = await getProductPageData();
  return page.productData.offers.find((o) => o.id === id) ?? null;
}
