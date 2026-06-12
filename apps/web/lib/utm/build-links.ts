export function getDefaultUtmBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
    "https://www.optimizatucontrol.com"
  );
}

export function resolveUtmBaseUrl(websiteUrl?: string | null): string {
  const custom = websiteUrl?.trim().replace(/\/$/, "");
  if (custom) return custom;
  return getDefaultUtmBaseUrl();
}

export function buildManychatRef(utmCampaign: string): string {
  return `yt-${utmCampaign}`;
}

export function normalizeInstagramUsername(value: string): string {
  return value.replace(/^@+/, "").trim();
}

export function buildLandingUtmUrl(
  utmCampaign: string,
  utmContent?: string | null,
  baseUrl?: string | null
): string {
  const base = resolveUtmBaseUrl(baseUrl);
  const params = new URLSearchParams({
    utm_source: "youtube",
    utm_medium: "video",
    utm_campaign: utmCampaign,
  });
  if (utmContent) params.set("utm_content", utmContent);
  return `${base}?${params.toString()}`;
}

export function buildManychatUrl(input: {
  utmCampaign: string;
  instagramUsername?: string | null;
  manychatPageId?: string | null;
}): { ref: string; url: string | null } {
  const ref = buildManychatRef(input.utmCampaign);
  const instagram = input.instagramUsername
    ? normalizeInstagramUsername(input.instagramUsername)
    : "";
  if (instagram) {
    return {
      ref,
      url: `https://ig.me/m/${instagram}?ref=${encodeURIComponent(ref)}`,
    };
  }

  const pageId = input.manychatPageId?.trim();
  if (pageId) {
    return {
      ref,
      url: `https://m.me/${pageId}?ref=${encodeURIComponent(ref)}`,
    };
  }

  return { ref, url: null };
}

export type UtmLinkType = "landing" | "manychat" | "both";

export function resolveUtmLinkType(manychatUrl: string | null): UtmLinkType {
  return manychatUrl ? "both" : "landing";
}
