import { generateTempPassword } from "@/lib/auth/generate-temp-password";
import type { TempCredentials } from "@/lib/auth/temp-credentials";
import { getTempPasswordExpiresAt } from "@/lib/auth/temp-password-expiry";
import { createAdminClient } from "@/lib/supabase/admin";

export async function regenerateUserTempPassword(
  userId: string
): Promise<TempCredentials> {
  const admin = createAdminClient();

  const { data: profile } = await admin
    .from("profiles")
    .select("id, email")
    .eq("id", userId)
    .maybeSingle();

  if (!profile?.email) {
    throw new Error("Usuario no encontrado");
  }

  const tempPassword = generateTempPassword();
  const { error: authError } = await admin.auth.admin.updateUserById(userId, {
    password: tempPassword,
  });

  if (authError) {
    throw new Error(authError.message);
  }

  const { error: profileError } = await admin
    .from("profiles")
    .update({
      must_change_password: true,
      temp_password_expires_at: getTempPasswordExpiresAt(),
    })
    .eq("id", userId);

  if (profileError) {
    throw new Error(profileError.message);
  }

  return { email: profile.email, tempPassword };
}
