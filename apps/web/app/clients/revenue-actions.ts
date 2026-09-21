"use server";

/**
 * La facturación del **negocio del cliente**, mes a mes.
 *
 * ⚠️ No confundir con `app/clients/payment-actions.ts`: eso es lo que el cliente
 * nos paga a nosotros. Esto es lo que el cliente gana, que es la métrica de si
 * el acompañamiento está sirviendo.
 */

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  getCurrentProfile,
  isMissingTableError,
  requireOrganizationId,
} from "@/lib/auth/bootstrap";
import { createClient } from "@/lib/supabase/server";
import { runMutation, type MutationResult } from "@/lib/server/action-result";
import { firstZodError } from "@/lib/validations";
import {
  normalizePeriod,
  rowToRevenueEntry,
  summarizeRevenue,
  type ClientRevenueEntry,
  type ClientRevenueRow,
  type RevenueSummary,
} from "@/lib/clients/revenue";
import { paths } from "@/routes";

const COLUMNS = "id, client_id, amount, currency, period, note, created_at";

const entrySchema = z.object({
  clientId: z.string().uuid(),
  amount: z
    .number({ error: "La facturación tiene que ser un número." })
    .finite()
    .min(0, "La facturación no puede ser negativa.")
    .max(1_000_000_000, "Ese monto es demasiado grande."),
  currency: z.enum(["USD", "ARS"]).default("USD"),
  period: z.string().min(4, "Elegí un mes."),
  note: z.string().trim().max(300).default(""),
});

export async function listClientRevenueAction(
  clientId: string
): Promise<ClientRevenueEntry[]> {
  const organizationId = await requireOrganizationId();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("client_revenue_entries")
    .select(COLUMNS)
    .eq("organization_id", organizationId)
    .eq("client_id", clientId)
    .order("period", { ascending: false });

  if (error) {
    // Sin la tabla, la ficha muestra la tarjeta vacía en vez de romperse.
    if (isMissingTableError(error.message)) return [];
    console.error("[client-revenue] list", error.message);
    return [];
  }

  return ((data ?? []) as ClientRevenueRow[]).map(rowToRevenueEntry);
}

/**
 * Carga (o corrige) la facturación de un mes.
 *
 * ⭐ Es un upsert por `(cliente, mes)`. Cargar dos veces el mismo mes lo
 * corrige; dos filas del mismo período serían dos verdades sobre lo mismo.
 */
export async function saveClientRevenueAction(
  input: z.input<typeof entrySchema>
): Promise<MutationResult<ClientRevenueEntry>> {
  return runMutation(async () => {
    const parsed = entrySchema.safeParse(input);
    if (!parsed.success) throw new Error(firstZodError(parsed.error));
    const values = parsed.data;

    const period = normalizePeriod(values.period);
    if (!period) throw new Error("Ese mes no se entiende. Elegilo del calendario.");

    const organizationId = await requireOrganizationId();
    const profile = await getCurrentProfile();
    const supabase = await createClient();

    // La pertenencia del cliente se chequea con la sesión del usuario.
    const { data: client } = await supabase
      .from("clients")
      .select("id")
      .eq("id", values.clientId)
      .eq("organization_id", organizationId)
      .maybeSingle();
    if (!client) throw new Error("No se encontró ese cliente en tu organización.");

    const { data, error } = await supabase
      .from("client_revenue_entries")
      .upsert(
        {
          organization_id: organizationId,
          client_id: values.clientId,
          amount: values.amount,
          currency: values.currency,
          period,
          note: values.note || null,
          recorded_by: profile?.id ?? null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "client_id,period" }
      )
      .select(COLUMNS)
      .single();

    if (error) throw new Error(error.message);

    revalidatePath(paths.platform.clients.detail(values.clientId));
    revalidatePath(paths.platform.clients.root);
    return rowToRevenueEntry(data as ClientRevenueRow);
  });
}

export async function deleteClientRevenueAction(
  entryId: string
): Promise<MutationResult<void>> {
  return runMutation(async () => {
    const organizationId = await requireOrganizationId();
    const supabase = await createClient();

    const { error } = await supabase
      .from("client_revenue_entries")
      .delete()
      .eq("id", entryId)
      .eq("organization_id", organizationId);

    if (error) throw new Error(error.message);
  });
}

/**
 * El último mes facturado de **cada** cliente, para la tabla.
 *
 * Una consulta para toda la organización, agrupada en memoria: pedir el
 * historial por fila sería una consulta por cliente.
 */
export async function getRevenueByClientAction(): Promise<
  Record<string, RevenueSummary>
> {
  try {
    const organizationId = await requireOrganizationId();
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("client_revenue_entries")
      .select(COLUMNS)
      .eq("organization_id", organizationId)
      .order("period", { ascending: false });

    if (error) {
      if (isMissingTableError(error.message)) return {};
      console.error("[client-revenue] por cliente", error.message);
      return {};
    }

    const porCliente = new Map<string, ClientRevenueEntry[]>();
    for (const row of (data ?? []) as ClientRevenueRow[]) {
      const entry = rowToRevenueEntry(row);
      const lista = porCliente.get(entry.clientId) ?? [];
      lista.push(entry);
      porCliente.set(entry.clientId, lista);
    }

    const result: Record<string, RevenueSummary> = {};
    for (const [clientId, entries] of porCliente) {
      result[clientId] = summarizeRevenue(entries);
    }
    return result;
  } catch {
    return {};
  }
}
