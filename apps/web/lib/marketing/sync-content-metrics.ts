import { createAdminClient } from "@/lib/supabase/admin";
import {
  getZernioClientForOrganization,
  getZernioIntegrationForOrg,
} from "@/lib/zernio/integration";
import type { ContentMetrics } from "@/types/content";

const METRICS_BATCH_LIMIT = 50;

type PlatformMetrics = {
  impressions?: number;
  likes?: number;
  comments?: number;
  shares?: number;
  reach?: number;
  clicks?: number;
  saves?: number;
};

function aggregatePlatformMetrics(
  platforms: Record<string, PlatformMetrics>
): ContentMetrics {
  let likes = 0;
  let comments = 0;
  let shares = 0;
  let saves = 0;
  let reach = 0;
  let impressions = 0;

  for (const metrics of Object.values(platforms)) {
    likes += metrics.likes ?? 0;
    comments += metrics.comments ?? 0;
    shares += metrics.shares ?? 0;
    saves += metrics.saves ?? 0;
    reach += metrics.reach ?? 0;
    impressions += metrics.impressions ?? 0;
  }

  return {
    likes,
    comments,
    shares,
    saves,
    reach,
    impressions,
    views: impressions || reach,
  };
}

export type SyncContentMetricsResult = {
  attempted: number;
  updated: number;
  failed: number;
};

/**
 * Sincroniza métricas de Zernio para piezas de contenido de una organización.
 * Usa el admin client para poder ejecutarse desde crons (sin sesión de usuario).
 *
 * @param contentPieceIds - opcional; si se omite, sincroniza todas las piezas
 *   con platform_post_id de la org (hasta METRICS_BATCH_LIMIT).
 */
export async function syncContentMetricsForOrg(
  organizationId: string,
  contentPieceIds?: string[]
): Promise<SyncContentMetricsResult> {
  const empty: SyncContentMetricsResult = { attempted: 0, updated: 0, failed: 0 };

  const integration = await getZernioIntegrationForOrg(organizationId);
  if (!integration) return empty;

  const admin = createAdminClient();

  let query = admin
    .from("content_pieces")
    .select("id, platform_post_id")
    .eq("organization_id", organizationId)
    .eq("source", "zernio")
    .not("platform_post_id", "is", null);

  if (contentPieceIds && contentPieceIds.length > 0) {
    query = query.in("id", contentPieceIds);
  }

  const { data: pieces, error } = await query.limit(METRICS_BATCH_LIMIT);
  if (error) throw new Error(error.message);
  if (!pieces || pieces.length === 0) return empty;

  const client = await getZernioClientForOrganization(organizationId);

  const results = await Promise.allSettled(
    pieces.map(async (piece) => {
      const postId = piece.platform_post_id as string;
      const analytics = await client.getPostAnalytics(postId);
      const metrics = aggregatePlatformMetrics(
        (analytics.platforms ?? {}) as Record<string, PlatformMetrics>
      );

      const { error: updateError } = await admin
        .from("content_pieces")
        .update({
          metrics,
          metrics_updated_at: new Date().toISOString(),
        })
        .eq("id", piece.id as string)
        .eq("organization_id", organizationId);

      if (updateError) throw new Error(updateError.message);
      return piece.id as string;
    })
  );

  const updated = results.filter((r) => r.status === "fulfilled").length;
  const failed = results.length - updated;

  if (failed > 0) {
    const firstError = results.find(
      (r): r is PromiseRejectedResult => r.status === "rejected"
    );
    console.warn("[syncContentMetrics] algunas piezas fallaron", {
      organizationId,
      attempted: results.length,
      updated,
      failed,
      firstError:
        firstError?.reason instanceof Error
          ? firstError.reason.message
          : String(firstError?.reason),
    });
  }

  return { attempted: results.length, updated, failed };
}

/**
 * Sincroniza métricas para todas las organizaciones con Zernio activo.
 * Pensado para el cron diario.
 */
export async function syncContentMetricsAllOrgs(): Promise<{
  organizations: number;
  results: Array<{ organizationId: string } & SyncContentMetricsResult>;
}> {
  const admin = createAdminClient();

  const { data: integrations, error } = await admin
    .from("zernio_integrations")
    .select("organization_id")
    .eq("is_active", true);

  if (error) throw new Error(error.message);

  const orgIds = [
    ...new Set((integrations ?? []).map((row) => row.organization_id as string)),
  ];

  const results: Array<{ organizationId: string } & SyncContentMetricsResult> = [];

  for (const organizationId of orgIds) {
    try {
      const result = await syncContentMetricsForOrg(organizationId);
      results.push({ organizationId, ...result });
    } catch (err) {
      console.error("[syncContentMetrics] org falló completa", {
        organizationId,
        error: err instanceof Error ? err.message : String(err),
      });
      results.push({ organizationId, attempted: 0, updated: 0, failed: 0 });
    }
  }

  return { organizations: orgIds.length, results };
}
