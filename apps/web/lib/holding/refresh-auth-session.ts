import { createClient } from "@/lib/supabase/server";

/**
 * Regenera el JWT (dispara custom_access_token_hook) tras cambiar
 * holding_active_sessions. refreshSession() usa authentication_method
 * token_refresh, que ejecuta el hook en Supabase Auth.
 */
export async function refreshAuthSessionAfterHoldingSwitch(): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.auth.refreshSession();

  if (error) {
    throw new Error(
      `No se pudo actualizar la sesión tras cambiar de negocio: ${error.message}`
    );
  }
}
