import type { User } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

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

  const admin = createAdminClient();
  const { data: superAdmin } = await admin
    .from("super_admin_users")
    .select("id")
    .eq("email", user.email.toLowerCase())
    .maybeSingle();

  if (!superAdmin) {
    throw new Error("Sin permisos de super admin");
  }

  return user;
}

export async function isSuperAdminUser(): Promise<boolean> {
  try {
    await requireSuperAdmin();
    return true;
  } catch {
    return false;
  }
}
