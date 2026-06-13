import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { paths } from "@/routes";
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
  if (pathname === "/api/waitlist") return true;
  if (pathname.startsWith("/api/utm/")) return true;
  if (pathname.startsWith("/api/cron/")) return true;
  if (pathname.startsWith("/api/integrations/")) {
    if (
      pathname.includes("/webhook") ||
      pathname.includes("/oauth/callback") ||
      pathname.includes("/oauth/start") ||
      pathname.endsWith("/sync") ||
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

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        supabaseResponse = NextResponse.next({ request });
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
    url.pathname = paths.platform.dashboard;
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
