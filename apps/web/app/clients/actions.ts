"use server";

import {
  isMissingTableError,
  requireOrganizationId,
} from "@/lib/auth/bootstrap";
import {
  clientToInsertRow,
  patchToUpdateRow,
  rowToClient,
  type ClientRow,
} from "@/lib/clients/mapper";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { attributeSaleToUTM } from "@/lib/utm/attribute-booking";
import type { Client } from "@/types/clients";

export async function listClientsAction(): Promise<Client[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    if (isMissingTableError(error.message)) {
      console.error(
        "[listClients] Ejecuta supabase/migrations/20260521100000_clients.sql en el SQL Editor de Supabase."
      );
    } else {
      console.error("[listClients]", error.message);
    }
    return [];
  }

  return (data as ClientRow[]).map(rowToClient);
}

export async function createClientAction(
  client: Omit<Client, "id">
): Promise<Client> {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase no configurado");
  }

  const organizationId = await requireOrganizationId();

  const supabase = await createClient();
  const insertPayload = clientToInsertRow(client, organizationId);

  const { data, error } = await supabase
    .from("clients")
    .insert(insertPayload)
    .select()
    .single();

  if (error || !data) {
    const msg = error?.message ?? "No se pudo crear el cliente";
    if (isMissingTableError(msg)) {
      throw new Error(
        "Falta la tabla clients en Supabase. Ejecuta supabase/migrations/RUN_ALL_PHASE1.sql en el SQL Editor."
      );
    }
    if (msg.includes("infinite recursion")) {
      throw new Error(
        "Error de políticas RLS en Supabase. Ejecuta supabase/migrations/20260521200000_fix_rls_recursion.sql y vuelve a intentar."
      );
    }
    throw new Error(msg);
  }

  const saved = rowToClient(data as ClientRow);

  await attributeSaleToUTM({
    organizationId,
    clientId: saved.id,
    closingCallId: saved.closingCallId,
    revenue: saved.totalAmount,
  }).catch((err) => {
    console.error("[CreateClient] Error en atribución UTM de venta:", err);
  });

  return saved;
}

export async function updateClientAction(
  id: string,
  patch: Partial<Client>
): Promise<Client> {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase no configurado");
  }

  const supabase = await createClient();
  const updateRow = patchToUpdateRow(patch);

  const { data, error } = await supabase
    .from("clients")
    .update(updateRow)
    .eq("id", id)
    .select()
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "No se pudo actualizar el cliente");
  }

  return rowToClient(data as ClientRow);
}
