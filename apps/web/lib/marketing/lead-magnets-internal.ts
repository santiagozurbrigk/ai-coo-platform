import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Helpers internos de lead magnets que escriben con service role.
 *
 * ⚠️ No van en un archivo "use server": ahí cada export es un endpoint POST
 * público, y estos reciben `organizationId` como argumento. Los llaman acciones
 * que ya resolvieron la org con `requireOrganizationId()`.
 */

// ─── Registro de lead desde Instagram DM (llamado desde análisis Zernio) ─────

export async function registerLeadMagnetFromDm({
  organizationId,
  conversationId,
  participantName,
  leadMagnetId,
}: {
  organizationId: string;
  conversationId: string;
  participantName: string;
  leadMagnetId: string;
}): Promise<void> {
  const admin = createAdminClient();

  // Evitar duplicados por conversación + LM
  const { data: existing } = await admin
    .from("lead_magnet_leads")
    .select("id")
    .eq("organization_id", organizationId)
    .eq("conversation_id", conversationId)
    .eq("lead_magnet_id", leadMagnetId)
    .maybeSingle();

  if (existing) return;

  await admin.from("lead_magnet_leads").insert({
    organization_id: organizationId,
    lead_magnet_id: leadMagnetId,
    name: participantName,
    channel: "instagram_dm",
    conversation_id: conversationId,
  });
}

// ─── Atribución automática al crear cliente ───────────────────────────────────

export async function attributeLeadMagnetToClient({
  organizationId,
  clientId,
  clientEmail,
  clientName,
}: {
  organizationId: string;
  clientId: string;
  clientEmail?: string | null;
  clientName?: string | null;
  revenueAmount?: number;
}): Promise<void> {
  const admin = createAdminClient();

  if (!clientEmail && !clientName) return;

  // Buscar leads que matcheen por email (preferido) o nombre, tomar el más reciente
  const baseQuery = admin
    .from("lead_magnet_leads")
    .select("id, lead_magnet_id, captured_at")
    .eq("organization_id", organizationId)
    .is("attributed_client_id", null)
    .order("captured_at", { ascending: false })
    .limit(1);

  const matchQuery = clientEmail
    ? baseQuery.eq("email", clientEmail)
    : baseQuery.ilike("name", `%${clientName}%`);

  const { data: leads } = await matchQuery;
  if (!leads || leads.length === 0) return;

  const lead = leads[0];
  await admin
    .from("lead_magnet_leads")
    .update({
      attributed_client_id: clientId,
      attributed_at: new Date().toISOString(),
    })
    .eq("id", lead.id);
}

// ─── Detección de LM en análisis de DM (helper para Zernio actions) ──────────

export async function getLeadMagnetUrlsForOrg(
  organizationId: string
): Promise<Array<{ id: string; name: string; assetUrl: string | null; redirectUrl: string | null }>> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("lead_magnets")
    .select("id, name, asset_url, redirect_url")
    .eq("organization_id", organizationId)
    .eq("status", "active");

  return (data ?? []).map((lm) => ({
    id: lm.id,
    name: lm.name,
    assetUrl: lm.asset_url,
    redirectUrl: lm.redirect_url,
  }));
}
