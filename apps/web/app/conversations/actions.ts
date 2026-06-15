"use server";

import {
  isMissingTableError,
  tryRequireOrganizationId,
} from "@/lib/auth/bootstrap";
import { repairClosingConversationLinks } from "@/lib/conversations/repair-links";
import {
  patchToConversationUpdateRow,
  rowToConversation,
  type ConversationRow,
} from "@/lib/conversations/mapper";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
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

export async function listConversationsAction(): Promise<Conversation[]> {
  if (!isSupabaseConfigured()) return [];

  const organizationId = await tryRequireOrganizationId();
  if (!organizationId) return [];

  const supabase = await createClient();

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
