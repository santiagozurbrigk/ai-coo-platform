"use server";

import { requireOrganizationId } from "@/lib/auth/bootstrap";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import {
  rowToProposal,
  type GraphProposalRow,
} from "@/lib/agent/mapper";
import {
  saveAvatarAction,
  saveProductAction,
  saveSalesFrameworkAction,
  saveValuePropositionAction,
} from "@/app/product/actions";
import type { GraphProposal } from "@/types/agent";

export async function listProposalsByMessageAction(
  messageId: string
): Promise<GraphProposal[]> {
  if (!isSupabaseConfigured()) return [];

  const organizationId = await requireOrganizationId();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("agent_graph_proposals")
    .select("*")
    .eq("organization_id", organizationId)
    .eq("message_id", messageId)
    .order("created_at", { ascending: true });

  if (error) return [];
  return (data ?? []).map((r) => rowToProposal(r as GraphProposalRow));
}

export async function listPendingProposalsByConversationAction(
  conversationId: string
): Promise<GraphProposal[]> {
  if (!isSupabaseConfigured()) return [];

  const organizationId = await requireOrganizationId();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("agent_graph_proposals")
    .select("*")
    .eq("organization_id", organizationId)
    .eq("conversation_id", conversationId)
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  if (error) return [];
  return (data ?? []).map((r) => rowToProposal(r as GraphProposalRow));
}

export async function applyProposalAction(
  proposalId: string
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) return { success: false, error: "No configurado" };

  const organizationId = await requireOrganizationId();
  const supabase = await createClient();

  // Fetch the proposal
  const { data: row, error: fetchErr } = await supabase
    .from("agent_graph_proposals")
    .select("*")
    .eq("id", proposalId)
    .eq("organization_id", organizationId)
    .eq("status", "pending")
    .maybeSingle();

  if (fetchErr || !row) {
    return { success: false, error: "Propuesta no encontrada o ya procesada" };
  }

  const proposal = rowToProposal(row as GraphProposalRow);

  try {
    // Delegate to existing validated product server actions
    let result: { success: boolean; error?: string };

    if (proposal.entityType === "customer_avatar") {
      const input = {
        ...proposal.payload,
        id: proposal.action === "update" ? proposal.entityId : undefined,
      };
      result = await saveAvatarAction(input);
    } else if (
      proposal.entityType === "product" ||
      proposal.entityType === "value_ladder_step"
    ) {
      const input = {
        ...proposal.payload,
        id: proposal.action === "update" ? proposal.entityId : undefined,
      };
      result = await saveProductAction(input);
    } else if (proposal.entityType === "sales_framework") {
      const input = {
        ...proposal.payload,
        id: proposal.action === "update" ? proposal.entityId : undefined,
      };
      result = await saveSalesFrameworkAction(input);
    } else if (proposal.entityType === "value_proposition") {
      result = await saveValuePropositionAction(proposal.payload);
    } else {
      return { success: false, error: "Tipo de entidad no soportado" };
    }

    if (!result.success) {
      return { success: false, error: result.error ?? "Error al aplicar" };
    }

    // Mark as approved
    await supabase
      .from("agent_graph_proposals")
      .update({ status: "approved", updated_at: new Date().toISOString() })
      .eq("id", proposalId)
      .eq("organization_id", organizationId);

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Error inesperado",
    };
  }
}

export async function rejectProposalAction(
  proposalId: string
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) return { success: false, error: "No configurado" };

  const organizationId = await requireOrganizationId();
  const supabase = await createClient();

  const { error } = await supabase
    .from("agent_graph_proposals")
    .update({ status: "rejected", updated_at: new Date().toISOString() })
    .eq("id", proposalId)
    .eq("organization_id", organizationId)
    .eq("status", "pending");

  if (error) return { success: false, error: error.message };
  return { success: true };
}
