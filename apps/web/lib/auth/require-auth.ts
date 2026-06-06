import type { User } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { ensureUserBootstrap } from "@/lib/auth/bootstrap";
import { createClient } from "@/lib/supabase/server";

export type AuthContext = {
  user: User;
  orgId: string;
  role: string;
  supabase: Awaited<ReturnType<typeof createClient>>;
};

type AuthSuccess = AuthContext & { ok: true };
type AuthFailure = { ok: false; error: NextResponse };

async function resolveAuthContext(): Promise<AuthSuccess | AuthFailure> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      ok: false,
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  let { data: profile } = await supabase
    .from("profiles")
    .select("organization_id, role")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.organization_id) {
    try {
      profile = await ensureUserBootstrap(user);
    } catch {
      return {
        ok: false,
        error: NextResponse.json(
          { error: "No se pudo vincular la organización" },
          { status: 403 }
        ),
      };
    }
  }

  if (!profile?.organization_id) {
    return {
      ok: false,
      error: NextResponse.json(
        { error: "Organización no encontrada" },
        { status: 403 }
      ),
    };
  }

  return {
    ok: true,
    user,
    orgId: profile.organization_id,
    role: profile.role ?? "founder",
    supabase,
  };
}

/** Verifica sesión con getUser() para API routes. */
export async function requireAuth(): Promise<AuthSuccess | AuthFailure> {
  return resolveAuthContext();
}

/** Igual que requireAuth pero lanza Error (server actions). */
export async function requireAuthContext(): Promise<AuthContext> {
  const result = await resolveAuthContext();
  if (!result.ok) {
    throw new Error("Unauthorized");
  }
  return {
    user: result.user,
    orgId: result.orgId,
    role: result.role,
    supabase: result.supabase,
  };
}
