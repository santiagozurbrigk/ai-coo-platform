import * as Sentry from "@sentry/nextjs";
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
    // Este error es crítico: si el JWT no se refresca, el contexto de negocio
    // queda desincronizado. Capturar en Sentry para detectar problemas del hook.
    Sentry.captureException(new Error(error.message), {
      tags: { feature: "holding", action: "refreshAuthSession" },
      extra: { supabaseError: error },
    });
    throw new Error(
      `No se pudo actualizar la sesión tras cambiar de negocio: ${error.message}`
    );
  }
}
