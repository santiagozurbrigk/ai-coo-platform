export type UnipileProvider = "instagram" | "whatsapp";

export const UNIPILE_HOSTED_PROVIDERS: Record<UnipileProvider, string> = {
  instagram: "INSTAGRAM",
  whatsapp: "WHATSAPP",
};

export function getUnipileConfig() {
  const accessToken =
    process.env.UNIPILE_API_KEY?.trim() ||
    process.env.UNIPILE_ACCESS_TOKEN?.trim() ||
    "";
  return {
    dsn: process.env.UNIPILE_DSN?.trim() ?? "",
    accessToken,
    webhookSecret: process.env.UNIPILE_WEBHOOK_SECRET?.trim() ?? "",
  };
}

export function normalizeUnipileApiUrl(dsn: string): string {
  const trimmed = dsn.trim().replace(/\/$/, "");
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export function assertUnipileConfig() {
  const { dsn, accessToken } = getUnipileConfig();
  if (!dsn || !accessToken) {
    throw new Error(
      "Unipile no configurado (UNIPILE_DSN / UNIPILE_ACCESS_TOKEN o UNIPILE_API_KEY)"
    );
  }
  return { dsn, accessToken };
}

export function getAppBaseUrl(): string {
  const base = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (!base) {
    throw new Error("NEXT_PUBLIC_APP_URL no configurado");
  }
  return base.replace(/\/$/, "");
}
