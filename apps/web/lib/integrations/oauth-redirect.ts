import { NextResponse } from "next/server";
import { paths } from "@/routes";
import { withOAuthNoCache } from "@/lib/integrations/oauth-callback-headers";

export type IntegrationOAuthProvider =
  | "typeform"
  | "google_forms"
  | "youtube"
  | "calendly";

/** Redirect absoluto a Integraciones (evita 500 por URL relativa en producción). */
export type IntegrationOAuthStatus = "connected" | "error" | "permissions";

export function integrationsOAuthRedirect(
  origin: string,
  provider: IntegrationOAuthProvider,
  status: IntegrationOAuthStatus,
  cookieName?: string
): NextResponse {
  const target = new URL(paths.platform.integrations, origin);
  target.searchParams.set(provider, status);
  const res = NextResponse.redirect(target);
  if (cookieName) {
    res.cookies.delete(cookieName);
  }
  return withOAuthNoCache(res);
}
