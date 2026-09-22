"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const MIN_PASSWORD_LENGTH = 8;

/**
 * Cambia la contraseña y recién entonces baja la marca de contraseña temporal.
 *
 * Las dos cosas van juntas en el servidor a propósito: si el cliente cambiaba la
 * contraseña y después llamaba a una acción que sólo limpiaba la marca, alcanzaba
 * con llamar a la acción para que la contraseña temporal quedara permanente.
 */
export async function completePasswordChangeAction(newPassword: string) {
  if (typeof newPassword !== "string" || newPassword.length < MIN_PASSWORD_LENGTH) {
    return {
      ok: false as const,
      error: `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres`,
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("No autenticado");

  const { error: updateError } = await supabase.auth.updateUser({
    password: newPassword,
  });
  if (updateError) {
    return { ok: false as const, error: "Error al actualizar la contraseña" };
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("profiles")
    .update({
      must_change_password: false,
      temp_password_expires_at: null,
    })
    .eq("id", user.id);

  if (error) throw new Error(error.message);

  return { ok: true as const };
}
