import type { User } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSuperAdminEmail } from "@/lib/auth/require-super-admin";
import {
  readAccountType,
  resolveEffectiveOrganizationId,
} from "@/lib/holding/resolve-org";
import { createClient } from "@/lib/supabase/server";

function defaultOrgName(email: string): string {
  const local = email.split("@")[0]?.trim();
  if (local) {
    return local.charAt(0).toUpperCase() + local.slice(1);
  }
  return "Mi organización";
}

/** Crea organización + perfil si el usuario aún no tiene fila en profiles. */
export async function ensureUserBootstrap(user: User) {
  const admin = createAdminClient();

  const { data: existing } = await admin
    .from("profiles")
    .select("id, organization_id, role")
    .eq("id", user.id)
    .maybeSingle();

  if (existing) return existing;

  const email = user.email ?? "";
  const fullName =
    (user.user_metadata?.full_name as string | undefined) ??
    (user.user_metadata?.name as string | undefined) ??
    null;

  if (email && (await isSuperAdminEmail(email))) {
    const { data: profile, error: profileError } = await admin
      .from("profiles")
      .insert({
        id: user.id,
        organization_id: null,
        email,
        full_name: fullName ?? "Super Admin",
        role: "founder",
      })
      .select("id, organization_id, role")
      .single();

    if (profileError || !profile) {
      throw new Error(profileError?.message ?? "No se pudo crear el perfil");
    }

    return profile;
  }

  const { data: org, error: orgError } = await admin
    .from("organizations")
    .insert({ name: defaultOrgName(email) })
    .select("id")
    .single();

  if (orgError || !org) {
    throw new Error(orgError?.message ?? "No se pudo crear la organización");
  }

  const { data: profile, error: profileError } = await admin
    .from("profiles")
    .insert({
      id: user.id,
      organization_id: org.id,
      email,
      full_name: fullName,
      role: "founder",
    })
    .select("id, organization_id, role")
    .single();

  if (profileError || !profile) {
    throw new Error(profileError?.message ?? "No se pudo crear el perfil");
  }

  void admin.rpc("create_default_roles", { org_id: org.id });

  return profile;
}

export async function ensureCurrentUserBootstrap() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error(error?.message ?? "Sesión no válida");
  }

  return ensureUserBootstrap(user);
}

export async function getCurrentProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, organization_id, email, full_name, role")
    .eq("id", user.id)
    .maybeSingle();

  return profile;
}

/** Tipo de cuenta del usuario autenticado (holding vs founder). */
export async function getCurrentProfileAccountType(): Promise<
  "founder" | "holding" | null
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("organizations(account_type)")
    .eq("id", user.id)
    .maybeSingle();

  const accountType = readAccountType(
    profile?.organizations as { account_type?: string } | null
  );

  return accountType === "holding" ? "holding" : "founder";
}

/** Garantiza org + perfil (repara usuarios creados antes del bootstrap). */
export async function requireOrganizationId(): Promise<string> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Sesión no válida");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("organization_id, organizations(account_type)")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.organization_id) {
    const boot = await ensureUserBootstrap(user);
    if (!boot.organization_id) {
      throw new Error(
        "No se pudo vincular tu cuenta a una organización. Revisa Supabase (tablas organizations y profiles)."
      );
    }
    return boot.organization_id;
  }

  const accountType = readAccountType(
    profile.organizations as { account_type?: string } | null
  );

  return resolveEffectiveOrganizationId(profile.organization_id, accountType);
}

/** Igual que requireOrganizationId pero sin lanzar (lecturas desde el cliente). */
export async function tryRequireOrganizationId(): Promise<string | null> {
  try {
    return await requireOrganizationId();
  } catch {
    return null;
  }
}

export function isMissingTableError(message: string): boolean {
  return (
    message.includes("Could not find the table") ||
    message.includes("does not exist") ||
    message.includes("schema cache")
  );
}
