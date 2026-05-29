"use server";

import {
  isMissingTableError,
  tryRequireOrganizationId,
} from "@/lib/auth/bootstrap";
import {
  getConversationIdByExternalRef,
  seedConversationsIfEmpty,
} from "@/app/conversations/actions";
import {
  closingCallToInsertRow,
  patchToClosingUpdateRow,
  rowToClosingCall,
  type ClosingCallRow,
} from "@/lib/closing/mapper";
import { repairClosingConversationLinks } from "@/lib/conversations/repair-links";
import { mockClosingCalls } from "@/mocks/closing";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { ClosingCall } from "@/types/closing";

function mapDbError(msg: string): string {
  if (isMissingTableError(msg)) {
    return "Falta la tabla closing_calls. Ejecuta supabase/migrations/20260521300000_closing_calls.sql en Supabase.";
  }
  if (msg.includes("infinite recursion")) {
    return "Error RLS en Supabase. Ejecuta 20260521200000_fix_rls_recursion.sql.";
  }
  return msg;
}

/** Datos demo iniciales para orgs sin llamadas (misma UX que mocks Fase 0). */
async function seedClosingCallsIfEmpty(
  supabase: Awaited<ReturnType<typeof createClient>>,
  organizationId: string
) {
  const { count, error: countError } = await supabase
    .from("closing_calls")
    .select("id", { count: "exact", head: true });

  if (countError || (count ?? 0) > 0) return;

  await seedConversationsIfEmpty(supabase, organizationId);

  const rows = await Promise.all(
    mockClosingCalls.map(async (call) => {
      const { id: _id, conversationId: legacyConvId, ...rest } = call;
      void _id;
      let conversationId: string | undefined;
      if (legacyConvId) {
        const resolved = await getConversationIdByExternalRef(
          supabase,
          organizationId,
          legacyConvId
        );
        conversationId = resolved ?? undefined;
      }
      return closingCallToInsertRow(
        { ...rest, conversationId },
        organizationId
      );
    })
  );

  const { error } = await supabase.from("closing_calls").insert(rows);
  if (error) {
    console.error("[seedClosingCalls]", error.message);
  }
}

export async function listClosingCallsAction(): Promise<ClosingCall[]> {
  if (!isSupabaseConfigured()) return [];

  const organizationId = await tryRequireOrganizationId();
  if (!organizationId) return [];

  const supabase = await createClient();

  await seedConversationsIfEmpty(supabase, organizationId);
  await seedClosingCallsIfEmpty(supabase, organizationId);
  await repairClosingConversationLinks(supabase, organizationId);

  const { data, error } = await supabase
    .from("closing_calls")
    .select("*")
    .order("scheduled_at", { ascending: true });

  if (error) {
    console.error("[listClosingCalls]", error.message);
    return [];
  }

  return (data as ClosingCallRow[]).map(rowToClosingCall);
}

export async function updateClosingCallAction(
  id: string,
  patch: Partial<ClosingCall>
): Promise<ClosingCall> {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase no configurado");
  }

  const supabase = await createClient();
  const updateRow = patchToClosingUpdateRow(patch);

  const { data, error } = await supabase
    .from("closing_calls")
    .update(updateRow)
    .eq("id", id)
    .select()
    .single();

  if (error || !data) {
    throw new Error(mapDbError(error?.message ?? "No se pudo actualizar la llamada"));
  }

  return rowToClosingCall(data as ClosingCallRow);
}
