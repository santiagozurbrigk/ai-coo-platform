import type { User } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export async function isSuperAdminEmail(email: string): Promise<boolean> {
  if (!email.trim() || !isSupabaseConfigured()) return false;

  const admin = createAdminClient();
  const { data } = await admin
    .from("super_admin_users")
    .select("id")
    .eq("email", email.trim().toLowerCase())
    .maybeSingle();

  return Boolean(data);
}

export async function requireSuperAdmin(): Promise<User> {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase no configurado");
  }

  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user?.email) {
    throw new Error("No autenticado");
  }

  if (!(await isSuperAdminEmail(user.email))) {
    throw new Error("Sin permisos de super admin");
  }

  return user;
}

export async function isSuperAdminUser(): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) return false;
  return isSuperAdminEmail(user.email);
}
