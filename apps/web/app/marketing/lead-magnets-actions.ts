"use server";

import { requireOrganizationId } from "@/lib/auth/bootstrap";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { revalidatePath } from "next/cache";

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type LeadMagnetType = "documento" | "loom" | "dashboard" | "landing" | "otro";
export type LeadMagnetChannel = "manychat" | "typeform" | "google_forms" | "landing" | "instagram_dm" | "manual";

export type LeadMagnet = {
  id: string;
  organizationId: string;
  name: string;
  description: string | null;
  type: LeadMagnetType;
  channel: LeadMagnetChannel;
  assetUrl: string | null;
  redirectUrl: string | null;
  manychatFlowId: string | null;
  manychatFlowName: string | null;
  formId: string | null;
  formSource: string | null;
  status: "active" | "paused" | "archived";
  createdAt: string;
  updatedAt: string;
  // métricas calculadas
  totalLeads: number;
  totalAttributedClients: number;
  totalRevenue: number;
};

export type LeadMagnetLead = {
  id: string;
  leadMagnetId: string;
  email: string | null;
  name: string | null;
  channel: LeadMagnetChannel;
  attributedClientId: string | null;
  attributedClientName: string | null;
  attributedRevenue: number | null;
  capturedAt: string;
  conversationId: string | null;
};

export type CreateLeadMagnetInput = {
  name: string;
  description?: string;
  type: LeadMagnetType;
  channel: LeadMagnetChannel;
  assetUrl?: string;
  manychatFlowId?: string;
  manychatFlowName?: string;
  formId?: string;
  formSource?: string;
};

// ─── CRUD Lead Magnets ────────────────────────────────────────────────────────

export async function getLeadMagnetsAction(): Promise<LeadMagnet[]> {
  if (!isSupabaseConfigured()) return [];
  const organizationId = await requireOrganizationId();
  const supabase = await createClient();

  const { data: lms, error } = await supabase
    .from("lead_magnets")
    .select("*")
    .eq("organization_id", organizationId)
    .neq("status", "archived")
    .order("created_at", { ascending: false });

  if (error || !lms) return [];

  // Leads y atribución para cada LM
  const { data: leads } = await supabase
    .from("lead_magnet_leads")
    .select("lead_magnet_id, attributed_client_id")
    .eq("organization_id", organizationId);

  // Revenue de clientes atribuidos
  const clientIds = (leads ?? [])
    .map((l) => l.attributed_client_id)
    .filter(Boolean) as string[];

  let revenueByClient: Record<string, number> = {};
  if (clientIds.length > 0) {
    const { data: clients } = await supabase
      .from("clients")
      .select("id, total_amount")
      .in("id", clientIds);
    revenueByClient = Object.fromEntries(
      (clients ?? []).map((c) => [c.id, c.total_amount ?? 0])
    );
  }

  return lms.map((lm) => {
    const lmLeads = (leads ?? []).filter((l) => l.lead_magnet_id === lm.id);
    const attributed = lmLeads.filter((l) => l.attributed_client_id);
    const revenue = attributed.reduce(
      (sum, l) => sum + (revenueByClient[l.attributed_client_id!] ?? 0),
      0
    );
    return {
      id: lm.id,
      organizationId: lm.organization_id,
      name: lm.name,
      description: lm.description,
      type: lm.type as LeadMagnetType,
      channel: lm.channel as LeadMagnetChannel,
      assetUrl: lm.asset_url,
      redirectUrl: lm.redirect_url,
      manychatFlowId: lm.manychat_flow_id,
      manychatFlowName: lm.manychat_flow_name,
      formId: lm.form_id,
      formSource: lm.form_source,
      status: lm.status as "active" | "paused" | "archived",
      createdAt: lm.created_at,
      updatedAt: lm.updated_at,
      totalLeads: lmLeads.length,
      totalAttributedClients: attributed.length,
      totalRevenue: revenue,
    };
  });
}

export async function createLeadMagnetAction(
  input: CreateLeadMagnetInput
): Promise<{ id: string }> {
  const organizationId = await requireOrganizationId();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("lead_magnets")
    .insert({
      organization_id: organizationId,
      name: input.name,
      description: input.description ?? null,
      type: input.type,
      channel: input.channel,
      asset_url: input.assetUrl ?? null,
      manychat_flow_id: input.manychatFlowId ?? null,
      manychat_flow_name: input.manychatFlowName ?? null,
      form_id: input.formId ?? null,
      form_source: input.formSource ?? null,
    })
    .select("id")
    .single();

  if (error || !data) throw new Error(error?.message ?? "Error al crear lead magnet");

  revalidatePath("/platform/marketing/lead-magnets");
  return { id: data.id };
}

export async function updateLeadMagnetAction(
  id: string,
  input: Partial<CreateLeadMagnetInput> & { status?: "active" | "paused" | "archived" }
): Promise<void> {
  const organizationId = await requireOrganizationId();
  const supabase = await createClient();

  const { error } = await supabase
    .from("lead_magnets")
    .update({
      ...(input.name !== undefined && { name: input.name }),
      ...(input.description !== undefined && { description: input.description }),
      ...(input.type !== undefined && { type: input.type }),
      ...(input.channel !== undefined && { channel: input.channel }),
      ...(input.assetUrl !== undefined && { asset_url: input.assetUrl }),
      ...(input.manychatFlowId !== undefined && { manychat_flow_id: input.manychatFlowId }),
      ...(input.manychatFlowName !== undefined && { manychat_flow_name: input.manychatFlowName }),
      ...(input.formId !== undefined && { form_id: input.formId }),
      ...(input.formSource !== undefined && { form_source: input.formSource }),
      ...(input.status !== undefined && { status: input.status }),
    })
    .eq("id", id)
    .eq("organization_id", organizationId);

  if (error) throw new Error(error.message);
  revalidatePath("/platform/marketing/lead-magnets");
}

export async function deleteLeadMagnetAction(id: string): Promise<void> {
  const organizationId = await requireOrganizationId();
  const supabase = await createClient();
  await supabase
    .from("lead_magnets")
    .update({ status: "archived" })
    .eq("id", id)
    .eq("organization_id", organizationId);
  revalidatePath("/platform/marketing/lead-magnets");
}

// ─── Leads de un LM ───────────────────────────────────────────────────────────

export async function getLeadMagnetLeadsAction(
  leadMagnetId: string
): Promise<LeadMagnetLead[]> {
  if (!isSupabaseConfigured()) return [];
  const organizationId = await requireOrganizationId();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("lead_magnet_leads")
    .select("*, clients(name, total_amount)")
    .eq("organization_id", organizationId)
    .eq("lead_magnet_id", leadMagnetId)
    .order("captured_at", { ascending: false });

  if (error || !data) return [];

  return data.map((row) => ({
    id: row.id,
    leadMagnetId: row.lead_magnet_id,
    email: row.email,
    name: row.name,
    channel: row.channel as LeadMagnetChannel,
    attributedClientId: row.attributed_client_id,
    attributedClientName: (row.clients as { name: string } | null)?.name ?? null,
    attributedRevenue: row.attributed_client_id
      ? ((row.clients as { total_amount: number } | null)?.total_amount ?? null)
      : null,
    capturedAt: row.captured_at,
    conversationId: row.conversation_id,
  }));
}

// ─── Registro de lead desde Instagram DM (llamado desde análisis Zernio) ─────

export async function registerLeadMagnetFromDmAction({
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

export async function attributeLeadMagnetToClientAction({
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

export async function getLeadMagnetUrlsForOrgAction(
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
