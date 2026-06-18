import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { paths } from "@/routes";
import { ACTIVE_ORG_COOKIE } from "@/lib/holding/constants";
import {
  isTempPasswordExpired,
  TEMP_PASSWORD_EXPIRED_QUERY,
} from "@/lib/auth/temp-password-expiry";
import { createAdminClient } from "./admin";
import { isSuperAdminEmail } from "@/lib/auth/require-super-admin";
import { getSupabaseAnonKey, getSupabaseUrl, isSupabaseConfigured } from "./env";

/** POST de Server Actions: no redirigir a login (devolvería HTML y rompe el cliente). */
function isServerActionRequest(request: NextRequest): boolean {
  return (
    request.headers.has("next-action") ||
    request.headers.has("Next-Action")
  );
}

const PUBLIC_PATHS = [
  paths.auth.login,
  paths.auth.callback,
  paths.auth.recover,
  paths.auth.updatePassword,
  paths.demo,
  paths.designSystem,
  paths.superAdmin.login,
  "/superadmin",
  "/super-admin",
  "/founder",
] as const;

function isPublicPath(pathname: string): boolean {
  if (pathname === paths.home) return true;
  if (pathname === paths.superAdmin.login) return true;
  if (pathname.startsWith(`${paths.superAdmin.login}/`)) return true;
  if (pathname === "/api/waitlist") return true;
  if (pathname.startsWith("/api/utm/")) return true;
  if (pathname.startsWith("/api/cron/")) return true;
  if (pathname.startsWith("/api/rag/")) return true;
  if (pathname.startsWith("/invite")) return true;
  if (pathname.startsWith("/api/invite/")) return true;
  if (pathname.startsWith("/api/webhooks/instagram/")) return true;
  if (pathname.startsWith("/api/integrations/")) {
    if (
      pathname.includes("/webhook") ||
      pathname.includes("/oauth/callback") ||
      pathname.includes("/oauth/start") ||
      pathname.endsWith("/sync") ||
      pathname.endsWith("/poll") ||
      pathname.endsWith("/process") ||
      pathname.endsWith("/reanalyze")
    ) {
      return true;
    }
  }
  return PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
}

function isForcePasswordChangePath(pathname: string): boolean {
  return (
    pathname === paths.auth.forcePasswordChange ||
    pathname.startsWith(`${paths.auth.forcePasswordChange}/`)
  );
}

async function resolveHoldingHomePath(
  admin: ReturnType<typeof createAdminClient>,
  holdingOrgId: string
): Promise<string> {
  const { data } = await admin
    .from("onboarding_responses")
    .select("completed_at")
    .eq("organization_id", holdingOrgId)
    .maybeSingle();

  if (!data?.completed_at) {
    return paths.platform.holdingOnboarding;
  }

  return paths.platform.holding;
}

export async function updateSession(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.next({ request });
  }

  const requestHeaders = new Headers(request.headers);
  const activeOrg = request.cookies.get(ACTIVE_ORG_COOKIE)?.value;
  if (activeOrg) {
    requestHeaders.set("x-active-org-id", activeOrg);
  }
  const { pathname } = request.nextUrl;
  requestHeaders.set("x-pathname", pathname);
  const forwardedRequest = { headers: requestHeaders };

  let supabaseResponse = NextResponse.next({ request: forwardedRequest });

  const supabase = createServerClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        supabaseResponse = NextResponse.next({ request: forwardedRequest });
        cookiesToSet.forEach(({ name, value, options }) => {
          supabaseResponse.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const admin = createAdminClient();
    const { data: profile } = await admin
      .from("profiles")
      .select("must_change_password, temp_password_expires_at")
      .eq("id", user.id)
      .maybeSingle();

    if (
      isTempPasswordExpired(
        profile?.must_change_password,
        profile?.temp_password_expires_at
      )
    ) {
      await supabase.auth.signOut();
      if (isServerActionRequest(request)) {
        return supabaseResponse;
      }
      const url = request.nextUrl.clone();
      url.pathname = paths.auth.login;
      url.searchParams.set("error", TEMP_PASSWORD_EXPIRED_QUERY);
      return NextResponse.redirect(url);
    }

    if (
      profile?.must_change_password &&
      !isForcePasswordChangePath(pathname)
    ) {
      if (isServerActionRequest(request)) {
        return supabaseResponse;
      }
      const url = request.nextUrl.clone();
      url.pathname = paths.auth.forcePasswordChange;
      return NextResponse.redirect(url);
    }
  }

  if (!user && !isPublicPath(pathname)) {
    if (isServerActionRequest(request)) {
      return supabaseResponse;
    }
    const url = request.nextUrl.clone();
    url.pathname = paths.auth.login;
    return NextResponse.redirect(url);
  }

  if (user && pathname === paths.auth.login) {
    const url = request.nextUrl.clone();
    if (user.email && (await isSuperAdminEmail(user.email))) {
      url.pathname = paths.superAdmin.organizations;
    } else {
      const admin = createAdminClient();
      const { data: profile } = await admin
        .from("profiles")
        .select("organization_id, organizations(account_type)")
        .eq("id", user.id)
        .maybeSingle();

      const orgField = profile?.organizations as
        | { account_type?: string }
        | { account_type?: string }[]
        | null;
      const accountType = Array.isArray(orgField)
        ? orgField[0]?.account_type
        : orgField?.account_type;
      const hasActiveBusiness = Boolean(
        request.cookies.get(ACTIVE_ORG_COOKIE)?.value
      );

      if (accountType === "holding" && !hasActiveBusiness && profile?.organization_id) {
        url.pathname = await resolveHoldingHomePath(
          admin,
          profile.organization_id
        );
      } else {
        url.pathname = paths.platform.dashboard;
      }
    }
    return NextResponse.redirect(url);
  }

  if (
    user &&
    pathname === paths.platform.dashboard &&
    !request.cookies.get(ACTIVE_ORG_COOKIE)?.value
  ) {
    const admin = createAdminClient();
    const { data: profile } = await admin
      .from("profiles")
      .select("organization_id, organizations(account_type)")
      .eq("id", user.id)
      .maybeSingle();

    const orgField = profile?.organizations as
      | { account_type?: string }
      | { account_type?: string }[]
      | null;
    const accountType = Array.isArray(orgField)
      ? orgField[0]?.account_type
      : orgField?.account_type;

    if (accountType === "holding" && profile?.organization_id) {
      const url = request.nextUrl.clone();
      url.pathname = await resolveHoldingHomePath(
        admin,
        profile.organization_id
      );
      return NextResponse.redirect(url);
    }
  }

  if (
    user?.email &&
    (await isSuperAdminEmail(user.email)) &&
    pathname === paths.auth.onboarding
  ) {
    const url = request.nextUrl.clone();
    url.pathname = paths.superAdmin.organizations;
    return NextResponse.redirect(url);
  }

  if (user?.id) {
    void (async () => {
      try {
        await createAdminClient()
          .from("profiles")
          .update({ last_login_at: new Date().toISOString() })
          .eq("id", user.id);
      } catch {
        // no bloquear la request
      }
    })();
  }

  return supabaseResponse;
}
