"use server";

import {
  isMissingTableError,
  requireOrganizationId,
} from "@/lib/auth/bootstrap";
import { repairClosingConversationLinks } from "@/lib/conversations/repair-links";
import {
  conversationToInsertRow,
  patchToConversationUpdateRow,
  rowToConversation,
  type ConversationRow,
} from "@/lib/conversations/mapper";
import { getManyChatIntegrationForOrganization } from "@/lib/manychat/integration";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { mockConversations } from "@/mocks/sales";
import type { Conversation, ConversationTagId } from "@/types/sales";

export async function getConversationIdByExternalRef(
  supabase: Awaited<ReturnType<typeof createClient>>,
  organizationId: string,
  externalRef: string
): Promise<string | null> {
  const { data } = await supabase
    .from("conversations")
    .select("id")
    .eq("organization_id", organizationId)
    .eq("external_ref", externalRef)
    .maybeSingle();

  return data?.id ?? null;
}

/** Datos demo iniciales (misma UX que mocks Fase 0). */
export async function seedConversationsIfEmpty(
  supabase: Awaited<ReturnType<typeof createClient>>,
  organizationId: string
): Promise<void> {
  const { count, error: countError } = await supabase
    .from("conversations")
    .select("id", { count: "exact", head: true })
    .eq("organization_id", organizationId);

  if (countError || (count ?? 0) > 0) return;

  const manychat = await getManyChatIntegrationForOrganization(organizationId);
  if (manychat) return;

  const rows = mockConversations.map((conv) => {
    const { id: legacyId, ...rest } = conv;
    return conversationToInsertRow(rest, organizationId, legacyId);
  });

  const { error } = await supabase.from("conversations").insert(rows);
  if (error) {
    console.error("[seedConversations]", error.message);
  }
}

export async function listConversationsAction(): Promise<Conversation[]> {
  if (!isSupabaseConfigured()) return [];

  const organizationId = await requireOrganizationId();
  const supabase = await createClient();

  await seedConversationsIfEmpty(supabase, organizationId);
  await repairClosingConversationLinks(supabase, organizationId);

  const { data, error } = await supabase
    .from("conversations")
    .select("*")
    .eq("organization_id", organizationId)
    .order("last_message_at", { ascending: false });

  if (error) {
    if (isMissingTableError(error.message)) {
      console.error(
        "[listConversations] Ejecuta supabase/migrations/20260521500000_conversations.sql"
      );
    } else {
      console.error("[listConversations]", error.message);
    }
    return [];
  }

  return (data as ConversationRow[]).map(rowToConversation);
}

export async function updateConversationTagAction(
  id: string,
  tag: ConversationTagId | null
): Promise<Conversation> {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase no configurado");
  }

  const supabase = await createClient();
  const updateRow = patchToConversationUpdateRow({ tag });

  const { data, error } = await supabase
    .from("conversations")
    .update(updateRow)
    .eq("id", id)
    .select()
    .single();

  if (error || !data) {
    throw new Error(mapConversationError(error?.message ?? "No se pudo actualizar"));
  }

  return rowToConversation(data as ConversationRow);
}

function mapConversationError(msg: string): string {
  if (isMissingTableError(msg)) {
    return "Falta la tabla conversations. Ejecuta la migración en Supabase SQL Editor.";
  }
  return msg;
}
