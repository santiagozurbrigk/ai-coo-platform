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
import { attributeLeadMagnetToClientAction } from "@/app/marketing/lead-magnets-actions";
import { repairClosingConversationLinks } from "@/lib/conversations/repair-links";
import {
  createClientSchema,
  firstZodError,
  updateClientSchema,
  uuidSchema,
} from "@/lib/validations";
import type { Client } from "@/types/clients";

export type ImportClientsRowError = {
  row: number;
  message: string;
};

export type ImportClientsResult = {
  insertedCount: number;
  errors: ImportClientsRowError[];
};

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

export async function createClientAction(input: unknown): Promise<Client> {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase no configurado");
  }

  const organizationId = await requireOrganizationId();

  const parsed = createClientSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(firstZodError(parsed.error));
  }

  const supabase = await createClient();
  const insertPayload = clientToInsertRow(parsed.data, organizationId);

  if (parsed.data.closingCallId) {
    await repairClosingConversationLinks(supabase, organizationId);
  }

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

  // Atribuir al último Lead Magnet que recibió este lead (por nombre)
  await attributeLeadMagnetToClientAction({
    organizationId,
    clientId: saved.id,
    clientName: saved.name,
    revenueAmount: saved.totalAmount ?? undefined,
  }).catch((err) => {
    console.error("[CreateClient] Error en atribución Lead Magnet:", err);
  });

  return saved;
}

export async function importClientsAction(
  rows: unknown[]
): Promise<ImportClientsResult> {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase no configurado");
  }

  const organizationId = await requireOrganizationId();
  const errors: ImportClientsRowError[] = [];
  const parsedRows: Omit<Client, "id">[] = [];

  rows.forEach((row, index) => {
    const parsed = createClientSchema.safeParse(row);
    if (!parsed.success) {
      errors.push({ row: index + 2, message: firstZodError(parsed.error) });
      return;
    }
    parsedRows.push(parsed.data);
  });

  if (errors.length > 0) {
    return { insertedCount: 0, errors };
  }

  if (parsedRows.length === 0) {
    return {
      insertedCount: 0,
      errors: [{ row: 1, message: "El archivo no contiene clientes para importar" }],
    };
  }

  const supabase = await createClient();
  const insertPayload = parsedRows.map((client) =>
    clientToInsertRow(client, organizationId)
  );

  const { error } = await supabase.from("clients").insert(insertPayload);

  if (error) {
    throw new Error(error.message);
  }

  return { insertedCount: parsedRows.length, errors: [] };
}

export async function updateClientAction(
  id: string,
  patch: unknown
): Promise<Client> {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase no configurado");
  }

  const organizationId = await requireOrganizationId();

  const idParsed = uuidSchema.safeParse(id);
  if (!idParsed.success) {
    throw new Error(firstZodError(idParsed.error));
  }

  const patchParsed = updateClientSchema.safeParse(patch);
  if (!patchParsed.success) {
    throw new Error(firstZodError(patchParsed.error));
  }

  const supabase = await createClient();
  const updateRow = patchToUpdateRow(patchParsed.data);

  const { data, error } = await supabase
    .from("clients")
    .update(updateRow)
    .eq("id", idParsed.data)
    .eq("organization_id", organizationId)
    .select()
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "No se pudo actualizar el cliente");
  }

  return rowToClient(data as ClientRow);
}
