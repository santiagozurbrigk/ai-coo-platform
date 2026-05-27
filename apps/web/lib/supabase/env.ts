function trimEnv(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed || undefined;
}

/** Clave pública de Supabase: anon JWT (legacy) o publishable (`sb_publishable_...`). */
export function getSupabaseAnonKey(): string {
  const key =
    trimEnv(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) ??
    trimEnv(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
  if (!key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_ANON_KEY or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"
    );
  }
  return key;
}

export function isSupabaseConfigured(): boolean {
  return Boolean(trimEnv(process.env.NEXT_PUBLIC_SUPABASE_URL) && getSupabaseAnonKeyOrNull());
}

function getSupabaseAnonKeyOrNull(): string | undefined {
  return (
    trimEnv(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) ??
    trimEnv(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)
  );
}

export function getSupabaseUrl(): string {
  const url = trimEnv(process.env.NEXT_PUBLIC_SUPABASE_URL);
  if (!url) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
  return url;
}

export function getSupabaseServiceRoleKey(): string {
  const key =
    trimEnv(process.env.SUPABASE_SERVICE_ROLE_KEY) ??
    trimEnv(process.env.SUPABASE_SECRET_KEY);
  if (!key) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY or SUPABASE_SECRET_KEY");
  }
  return key;
}
