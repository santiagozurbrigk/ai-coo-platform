import type { User } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { ensureUserBootstrap } from "@/lib/auth/bootstrap";
import {
  readAccountType,
  resolveEffectiveOrganizationId,
} from "@/lib/holding/resolve-org";
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
    .select("organization_id, role, organizations(account_type)")
    .eq("id", user.id)
    .maybeSingle();

  let organizationId: string | null = profile?.organization_id ?? null;
  let role = profile?.role ?? "founder";
  let organizationsField = profile?.organizations ?? null;

  if (!organizationId) {
    try {
      const boot = await ensureUserBootstrap(user);
      organizationId = boot.organization_id;
      role = boot.role;
      organizationsField = null;
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

  if (!organizationId) {
    return {
      ok: false,
      error: NextResponse.json(
        { error: "Organización no encontrada" },
        { status: 403 }
      ),
    };
  }

  const accountType = readAccountType(
    organizationsField as { account_type?: string } | null
  );
  const orgId = await resolveEffectiveOrganizationId(
    organizationId,
    accountType
  );

  return {
    ok: true,
    user,
    orgId,
    role: role ?? "founder",
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
