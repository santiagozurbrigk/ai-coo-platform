import { requireOrganizationId } from "@/lib/auth/bootstrap";
import { isMissingTableError } from "@/lib/auth/bootstrap";
import { rowToClient, type ClientRow } from "@/lib/clients/mapper";
import {
  buildAvatarInsights,
  computeLadderStepMetrics,
  computeOfferStats,
  type ProductMetricsInput,
} from "@/lib/product/offer-metrics";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import {
  buildProductData,
  buildSpatialNodes,
  emptyProductData,
  rowToValueProposition,
  type CustomerAvatarRow,
  type ProductRow,
  type ValueLadderRow,
  type ValuePropositionRow,
} from "./mapper";
import type { ProductData, SpatialProductNode } from "@/types/product";

export type ProductPageData = {
  productData: ProductData;
  spatialNodes: SpatialProductNode[];
  hasRealData: boolean;
  canEdit: boolean;
};

function enrichWithMetrics(
  productData: ProductData,
  metricsInput: ProductMetricsInput
): ProductData {
  return {
    ...productData,
    avatars: productData.avatars.map((avatar) => ({
      ...avatar,
      aiInsights: buildAvatarInsights(avatar, metricsInput.topOrgObjection),
    })),
    offers: productData.offers.map((offer) => ({
      ...offer,
      stats: computeOfferStats(offer.name, metricsInput),
      mainObjection: "",
      objectionHandler: "",
      aiInsight:
        metricsInput.topOrgObjection?.trim()
          ? `Objeción frecuente detectada en ventas: ${metricsInput.topOrgObjection}`
          : "",
    })),
    valueLadder: productData.valueLadder.map((step) => ({
      ...step,
      ...computeLadderStepMetrics(step.name, metricsInput),
    })),
  };
}

async function loadProductMetricsInput(
  organizationId: string
): Promise<ProductMetricsInput> {
  const supabase = await createClient();

  const [clientsRes, paymentsRes, callsRes] = await Promise.all([
    supabase
      .from("clients")
      .select("id, offered_product, total_amount, status, join_date, ai_insights")
      .eq("organization_id", organizationId),
    supabase
      .from("client_payments")
      .select("client_id, amount")
      .eq("organization_id", organizationId),
    supabase
      .from("closing_calls")
      .select("status")
      .eq("organization_id", organizationId),
  ]);

  const paidByClientId: Record<string, number> = {};
  for (const row of paymentsRes.data ?? []) {
    const clientId = row.client_id as string;
    paidByClientId[clientId] =
      (paidByClientId[clientId] ?? 0) + Number(row.amount);
  }

  const clients = ((clientsRes.data ?? []) as ClientRow[]).map((row) => {
    const client = rowToClient(row);
    return {
      id: client.id,
      offeredProduct: client.offeredProduct,
      totalAmount: client.totalAmount,
      status: client.status,
      joinDate: client.joinDate,
    };
  });

  const calls = callsRes.data ?? [];
  const closedCallsCount = calls.filter((c) => c.status === "closed").length;

  return {
    clients,
    paidByClientId,
    closedCallsCount,
    totalCallsCount: calls.length,
  };
}

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

    const [avatarsRes, productsRes, ladderRes, propositionRes, metricsInput] =
      await Promise.all([
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
          .select(
            "*, product:products(id, name, price, currency, type, billing_type, description, is_core_offer)"
          )
          .eq("organization_id", organizationId)
          .order("level", { ascending: true }),
        supabase
          .from("value_propositions")
          .select("*")
          .eq("organization_id", organizationId)
          .maybeSingle(),
        loadProductMetricsInput(organizationId),
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

    const savedProposition = propositionRes.data
      ? rowToValueProposition(propositionRes.data as ValuePropositionRow)
      : null;

    const hasRealData = avatarRows.length > 0 || productRows.length > 0;

    if (!hasRealData) {
      return {
        productData: emptyProductData,
        spatialNodes: [],
        hasRealData: false,
        canEdit: true,
      };
    }

    const base = buildProductData(
      avatarRows,
      productRows,
      ladderRows,
      savedProposition
    );
    const productData = enrichWithMetrics(base, metricsInput);

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
