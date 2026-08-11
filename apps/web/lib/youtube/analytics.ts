import { createAdminClient } from "@/lib/supabase/admin";
import { refreshGoogleAccessToken } from "@/lib/google/refresh-token";
import { estimateRetentionAtCTA } from "@/lib/youtube/retention";

type YoutubeIntegrationRow = {
  access_token: string | null;
  refresh_token: string | null;
  token_expires_at: string | null;
  granted_scopes: string | null;
};

const ANALYTICS_SCOPE = "https://www.googleapis.com/auth/yt-analytics.readonly";

/** Devuelve un access token válido con scope yt-analytics, o null si no existe. */
async function getAnalyticsToken(
  organizationId: string
): Promise<string | null> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("youtube_integrations")
    .select("access_token, refresh_token, token_expires_at, granted_scopes")
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (!data) return null;

  const row = data as YoutubeIntegrationRow;

  // Verificar que el token tiene el scope de analytics
  const scopes = (row.granted_scopes ?? "").split(/\s+/);
  if (!scopes.includes(ANALYTICS_SCOPE)) {
    console.info("[YouTubeAnalytics] token sin scope yt-analytics.readonly", {
      organizationId,
      grantedScopes: row.granted_scopes,
    });
    return null;
  }

  if (!row.access_token) return null;

  // Refrescar si está por vencer (< 60 seg)
  const expiresAt = row.token_expires_at
    ? new Date(row.token_expires_at).getTime()
    : null;

  if (expiresAt && expiresAt < Date.now() + 60_000 && row.refresh_token) {
    const refreshed = await refreshGoogleAccessToken(row.refresh_token).catch(() => null);
    if (refreshed?.access_token) {
      await admin
        .from("youtube_integrations")
        .update({
          access_token: refreshed.access_token,
          token_expires_at: refreshed.expires_in
            ? new Date(Date.now() + refreshed.expires_in * 1000).toISOString()
            : null,
        })
        .eq("organization_id", organizationId);
      return refreshed.access_token;
    }
  }

  return row.access_token;
}

/**
 * Fetchea la curva de retención real del video desde YouTube Analytics API.
 * Retorna un array de { elapsedVideoTimeRatio, audienceWatchRatio } o null si falla.
 */
async function fetchRetentionCurve(
  videoId: string,
  accessToken: string
): Promise<{ elapsedVideoTimeRatio: number; audienceWatchRatio: number }[] | null> {
  try {
    const url = new URL("https://youtubeanalytics.googleapis.com/v2/reports");
    url.searchParams.set("ids", "channel==MINE");
    url.searchParams.set("dimensions", "elapsedVideoTimeRatio");
    url.searchParams.set("metrics", "audienceWatchRatio");
    url.searchParams.set("filters", `video==${videoId}`);
    url.searchParams.set("startDate", "2020-01-01");
    url.searchParams.set("endDate", "2099-12-31");

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.warn("[YouTubeAnalytics] API error", {
        videoId,
        status: res.status,
        body: text.slice(0, 200),
      });
      return null;
    }

    const json = (await res.json()) as {
      columnHeaders?: { name: string }[];
      rows?: number[][];
    };

    const headers = json.columnHeaders?.map((h) => h.name) ?? [];
    const ratioIdx = headers.indexOf("elapsedVideoTimeRatio");
    const watchIdx = headers.indexOf("audienceWatchRatio");

    if (ratioIdx === -1 || watchIdx === -1 || !json.rows?.length) return null;

    return json.rows.map((row) => ({
      elapsedVideoTimeRatio: row[ratioIdx] ?? 0,
      audienceWatchRatio: row[watchIdx] ?? 0,
    }));
  } catch (err) {
    console.warn("[YouTubeAnalytics] fetch failed", { videoId, err });
    return null;
  }
}

/**
 * Retorna el % de retención en el segundo del CTA.
 * Intenta con datos reales de YouTube Analytics; si no tiene token/datos,
 * cae al modelo estimado de `estimateRetentionAtCTA`.
 *
 * @param organizationId  ID de la org (para leer el token de YouTube)
 * @param videoId         YouTube video ID (ej. "dQw4w9WgXcQ")
 * @param ctaSecond       Segundo donde aparece el CTA
 * @param durationSeconds Duración total del video en segundos
 */
export async function getRetentionAtCTA(
  organizationId: string,
  videoId: string | null | undefined,
  ctaSecond: number,
  durationSeconds: number
): Promise<number> {
  // Sin videoId no podemos consultar la API
  if (!videoId) {
    return estimateRetentionAtCTA(ctaSecond, durationSeconds);
  }

  try {
    const token = await getAnalyticsToken(organizationId);
    if (!token) return estimateRetentionAtCTA(ctaSecond, durationSeconds);

    const curve = await fetchRetentionCurve(videoId, token);
    if (!curve?.length) return estimateRetentionAtCTA(ctaSecond, durationSeconds);

    // Encontrar el punto más cercano al segundo del CTA
    const ctaRatio = ctaSecond / durationSeconds;
    let closest = curve[0];
    let minDist = Math.abs((closest?.elapsedVideoTimeRatio ?? 0) - ctaRatio);

    for (const point of curve) {
      const dist = Math.abs(point.elapsedVideoTimeRatio - ctaRatio);
      if (dist < minDist) {
        minDist = dist;
        closest = point;
      }
    }

    const pct = Math.round((closest?.audienceWatchRatio ?? 0) * 100);
    return Math.max(0, Math.min(100, pct));
  } catch {
    return estimateRetentionAtCTA(ctaSecond, durationSeconds);
  }
}
