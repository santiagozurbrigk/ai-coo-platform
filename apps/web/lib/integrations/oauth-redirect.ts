import { NextResponse } from "next/server";
import { paths } from "@/routes";

export type IntegrationOAuthProvider =
  | "typeform"
  | "google_forms"
  | "youtube"
  | "fathom"
  | "calendly";

/** Redirect absoluto a Integraciones (evita 500 por URL relativa en producción). */
export function integrationsOAuthRedirect(
  origin: string,
  provider: IntegrationOAuthProvider,
  status: "connected" | "error",
  cookieName?: string
): NextResponse {
  const target = new URL(paths.platform.integrations, origin);
  target.searchParams.set(provider, status);
  const res = NextResponse.redirect(target);
  if (cookieName) {
    res.cookies.delete(cookieName);
  }
  return res;
}
