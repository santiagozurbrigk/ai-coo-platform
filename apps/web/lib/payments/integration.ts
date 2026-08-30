/**
 * lib/payments/integration.ts
 *
 * Credenciales de Whop y Fanbasis por organización.
 *
 * Sólo servidor y sólo con admin client: `payment_integrations` guarda secretos
 * y no tiene políticas de RLS de lectura, igual que el resto de las tablas de
 * integraciones del repo.
 */

import { createAdminClient } from "@/lib/supabase/admin";
import { decrypt } from "@/lib/security/encryption";
import type { PaymentProvider } from "./types";

export type PaymentIntegrationRow = {
  organization_id: string;
  provider: PaymentProvider;
  webhook_secret_encrypted: string | null;
  api_key_encrypted: string | null;
  is_active: boolean;
};

/**
 * Resuelve a qué organización pertenece un webhook y con qué secreto verificarlo.
 *
 * El proveedor no conoce el `organization_id` de OTC, así que la URL del webhook
 * lo lleva como parámetro. Eso NO es autenticación: el secreto de la firma es lo
 * que prueba que el evento es legítimo.
 */
export async function getPaymentIntegration(
  organizationId: string,
  provider: PaymentProvider
): Promise<PaymentIntegrationRow | null> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("payment_integrations")
    .select("organization_id, provider, webhook_secret_encrypted, api_key_encrypted, is_active")
    .eq("organization_id", organizationId)
    .eq("provider", provider)
    .eq("is_active", true)
    .maybeSingle();

  if (error || !data) return null;
  return data as PaymentIntegrationRow;
}

export async function getWebhookSecret(
  organizationId: string,
  provider: PaymentProvider
): Promise<string | null> {
  const integration = await getPaymentIntegration(organizationId, provider);
  if (!integration?.webhook_secret_encrypted) return null;

  try {
    return decrypt(integration.webhook_secret_encrypted);
  } catch {
    console.error(`[payments] no se pudo descifrar el secreto de ${provider}`);
    return null;
  }
}
