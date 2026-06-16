import { NextResponse } from "next/server";
import { ensureUserBootstrap } from "@/lib/auth/bootstrap";
import { isSuperAdminEmail } from "@/lib/auth/require-super-admin";
import { createClient } from "@/lib/supabase/server";
import { paths } from "@/routes";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const next = searchParams.get("next") ?? paths.platform.dashboard;
  const supabase = await createClient();

  if (tokenHash && type === "recovery") {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: "recovery",
    });

    if (!error) {
      return NextResponse.redirect(`${origin}${paths.auth.updatePassword}`);
    }
  }

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      if (type === "recovery") {
        return NextResponse.redirect(`${origin}${paths.auth.updatePassword}`);
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user && !next.includes("/invite")) {
        await ensureUserBootstrap(user);
      }

      const destination =
        user?.email && (await isSuperAdminEmail(user.email))
          ? paths.superAdmin.organizations
          : next;

      return NextResponse.redirect(`${origin}${destination}`);
    }
  }

  return NextResponse.redirect(`${origin}${paths.auth.login}?error=auth_callback`);
}
