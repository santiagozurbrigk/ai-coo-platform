"use server";

import {
  isMissingTableError,
  requireOrganizationId,
  tryRequireOrganizationId,
} from "@/lib/auth/bootstrap";
import {
  closingCallToInsertRow,
  patchToClosingUpdateRow,
  rowToClosingCall,
  type ClosingCallRow,
} from "@/lib/closing/mapper";
import type { ClosingCall } from "@/types/closing";
import { repairClosingConversationLinks } from "@/lib/conversations/repair-links";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import {
  firstZodError,
  updateClosingCallSchema,
  uuidSchema,
} from "@/lib/validations";
function mapDbError(msg: string): string {
  if (isMissingTableError(msg)) {
    return "Falta la tabla closing_calls. Ejecuta supabase/migrations/20260521300000_closing_calls.sql en Supabase.";
  }
  if (msg.includes("infinite recursion")) {
    return "Error RLS en Supabase. Ejecuta 20260521200000_fix_rls_recursion.sql.";
  }
  return msg;
}

export async function listClosingCallsAction(): Promise<ClosingCall[]> {
  if (!isSupabaseConfigured()) return [];

  const organizationId = await tryRequireOrganizationId();
  if (!organizationId) return [];

  const supabase = await createClient();

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
  patch: unknown
): Promise<ClosingCall> {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase no configurado");
  }

  const idParsed = uuidSchema.safeParse(id);
  if (!idParsed.success) {
    throw new Error(firstZodError(idParsed.error));
  }

  const patchParsed = updateClosingCallSchema.safeParse(patch);
  if (!patchParsed.success) {
    throw new Error(firstZodError(patchParsed.error));
  }

  const organizationId = await requireOrganizationId();
  const supabase = await createClient();
  const updateRow = patchToClosingUpdateRow(patchParsed.data);

  const { data, error } = await supabase
    .from("closing_calls")
    .update(updateRow)
    .eq("id", idParsed.data)
    .eq("organization_id", organizationId)
    .select()
    .single();

  if (error || !data) {
    throw new Error(mapDbError(error?.message ?? "No se pudo actualizar la llamada"));
  }

  return rowToClosingCall(data as ClosingCallRow);
}

export type ImportClosingCallsRowError = {
  row: number;
  message: string;
};

export type ImportClosingCallsResult = {
  insertedCount: number;
  errors: ImportClosingCallsRowError[];
};

export async function importClosingCallsAction(
  calls: Omit<ClosingCall, "id">[]
): Promise<ImportClosingCallsResult> {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase no configurado");
  }

  if (calls.length === 0) {
    return { insertedCount: 0, errors: [] };
  }

  const organizationId = await requireOrganizationId();
  const supabase = await createClient();

  const rows = calls.map((call) =>
    closingCallToInsertRow(call, organizationId)
  );

  const { data, error } = await supabase
    .from("closing_calls")
    .insert(rows)
    .select("id");

  if (error) {
    throw new Error(mapDbError(error.message));
  }

  return {
    insertedCount: data?.length ?? 0,
    errors: [],
  };
}
