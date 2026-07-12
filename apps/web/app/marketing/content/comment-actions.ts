"use server";

import { requireOrganizationId } from "@/lib/auth/bootstrap";
import { createClient } from "@/lib/supabase/server";
import {
  getZernioClientForOrganization,
  getZernioIntegrationForOrg,
} from "@/lib/zernio/integration";
import type { ZernioPostCommentsResponse } from "@/lib/zernio/client";

export async function getContentPieceCommentsAction(
  contentPieceId: string,
  cursor?: string
): Promise<ZernioPostCommentsResponse> {
  const organizationId = await requireOrganizationId();
  const supabase = await createClient();

  const { data: piece, error } = await supabase
    .from("content_pieces")
    .select("platform_post_id, platform")
    .eq("id", contentPieceId)
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!piece?.platform_post_id) {
    throw new Error("Esta pieza no tiene un post de plataforma asociado");
  }

  const integration = await getZernioIntegrationForOrg(organizationId);
  if (!integration) {
    throw new Error("Zernio no está conectado");
  }

  const platform = String(piece.platform ?? "instagram").toLowerCase();
  const account =
    integration.connected_accounts.find(
      (item) => item.platform.toLowerCase() === platform
    ) ??
    integration.connected_accounts.find(
      (item) => item.platform.toLowerCase() === "instagram"
    );

  if (!account) {
    throw new Error("No hay una cuenta de Instagram conectada en Zernio");
  }

  const client = await getZernioClientForOrganization(organizationId);
  return client.getPostComments(
    String(piece.platform_post_id),
    account.accountId,
    25,
    cursor
  );
}
