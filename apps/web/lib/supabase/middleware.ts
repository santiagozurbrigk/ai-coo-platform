import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { paths } from "@/routes";
import { ACTIVE_ORG_COOKIE } from "@/lib/holding/constants";
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

export async function updateSession(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.next({ request });
  }

  const requestHeaders = new Headers(request.headers);
  const activeOrg = request.cookies.get(ACTIVE_ORG_COOKIE)?.value;
  if (activeOrg) {
    requestHeaders.set("x-active-org-id", activeOrg);
  }
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

  const { pathname } = request.nextUrl;

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
    url.pathname =
      user.email && (await isSuperAdminEmail(user.email))
        ? paths.superAdmin.organizations
        : paths.platform.dashboard;
    return NextResponse.redirect(url);
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
