"use server";

import { revalidatePath } from "next/cache";
import { requireOrganizationId } from "@/lib/auth/bootstrap";
import { createClient } from "@/lib/supabase/server";
import {
  buildLeadThread,
  isActionable,
  type LeadAttempt,
  type LeadQualification,
  type LeadThread,
  type NextAction,
} from "@/lib/sales/lead-thread";
import type { ClosingCallStatus } from "@/types/closing";
import { paths } from "@/routes";

/**
 * Seguimiento de leads: el hilo de intentos y lo que hay que hacer con cada uno.
 */

const ATTEMPT_COLUMNS =
  "id, scheduled_at, status, next_action, next_action_at, pre_call_qualification, post_call_qualification";

type AttemptRow = {
  id: string;
  scheduled_at: string;
  status: ClosingCallStatus;
  next_action: NextAction | null;
  next_action_at: string | null;
  pre_call_qualification: LeadQualification | null;
  post_call_qualification: LeadQualification | null;
};

function rowToAttempt(row: AttemptRow): LeadAttempt {
  return {
    id: row.id,
    scheduledAt: row.scheduled_at,
    status: row.status,
    nextAction: row.next_action,
    nextActionAt: row.next_action_at,
    preCallQualification: row.pre_call_qualification,
    postCallQualification: row.post_call_qualification,
  };
}

export type LeadSummary = {
  leadId: string;
  name: string;
  email: string | null;
  thread: LeadThread;
  /** Cliente en que se convirtió, si compró. */
  clientId: string | null;
};

/**
 * Leads que necesitan atención, más urgente primero.
 *
 * ⭐ **Es la pantalla que no existía.** De 1.027 turnos, cero tenían resultado
 * cargado — no porque nadie trabajara, sino porque no había dónde anotar qué
 * seguía después de una llamada que no cerró. Acá aparecen los tres casos que
 * son trabajo real: falta cargar el resultado, el seguimiento venció, o el lead
 * quedó sin próximo paso.
 */
export async function listLeadsNeedingAttentionAction(
  limit = 100
): Promise<LeadSummary[]> {
  const organizationId = await requireOrganizationId();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("sales_leads")
    .select(`id, name, email, client_id, closing_calls(${ATTEMPT_COLUMNS})`)
    .eq("organization_id", organizationId)
    .limit(limit);

  if (error) return [];

  const now = new Date();
  const summaries: LeadSummary[] = [];

  for (const row of data ?? []) {
    const attempts = Array.isArray(row.closing_calls)
      ? (row.closing_calls as AttemptRow[]).map(rowToAttempt)
      : [];
    // Un lead sin turnos no es trabajo pendiente: todavía no pasó nada.
    if (attempts.length === 0) continue;

    const thread = buildLeadThread(attempts, now);
    if (!isActionable(thread.state)) continue;

    summaries.push({
      leadId: row.id as string,
      name: (row.name as string) ?? "Sin nombre",
      email: (row.email as string | null) ?? null,
      clientId: (row.client_id as string | null) ?? null,
      thread,
    });
  }

  // Orden de urgencia: el compromiso incumplido primero, después lo que quedó
  // sin desenlace, y por último los leads que nadie retomó.
  const URGENCY: Record<string, number> = {
    follow_up_due: 0,
    pending_outcome: 1,
    stalled: 2,
  };
  summaries.sort((a, b) => {
    const byState = (URGENCY[a.thread.state] ?? 9) - (URGENCY[b.thread.state] ?? 9);
    if (byState !== 0) return byState;
    // Dentro del mismo estado, lo más viejo primero.
    const ta = new Date(a.thread.attempts[0]?.scheduledAt ?? 0).getTime();
    const tb = new Date(b.thread.attempts[0]?.scheduledAt ?? 0).getTime();
    return ta - tb;
  });

  return summaries;
}

/** El hilo completo de un lead. */
export async function getLeadThreadAction(
  leadId: string
): Promise<LeadSummary | null> {
  const organizationId = await requireOrganizationId();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("sales_leads")
    .select(`id, name, email, client_id, closing_calls(${ATTEMPT_COLUMNS})`)
    .eq("id", leadId)
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (error || !data) return null;

  const attempts = Array.isArray(data.closing_calls)
    ? (data.closing_calls as AttemptRow[]).map(rowToAttempt)
    : [];

  return {
    leadId: data.id as string,
    name: (data.name as string) ?? "Sin nombre",
    email: (data.email as string | null) ?? null,
    clientId: (data.client_id as string | null) ?? null,
    thread: buildLeadThread(attempts),
  };
}

/**
 * Define qué sigue con una llamada que no cerró.
 *
 * `next_action = null` limpia el próximo paso, que devuelve el lead a la cola.
 */
export async function setNextActionAction(params: {
  callId: string;
  nextAction: NextAction | null;
  nextActionAt?: string | null;
  ownerId?: string | null;
  notes?: string | null;
}): Promise<{ ok: boolean; error?: string }> {
  const organizationId = await requireOrganizationId();

  // Un próximo paso sin fecha no es un compromiso: nunca vencería, así que
  // nunca volvería a aparecer en la cola. `lost` es la excepción, porque cierra.
  if (
    params.nextAction &&
    params.nextAction !== "lost" &&
    !params.nextActionAt
  ) {
    return { ok: false, error: "El próximo paso necesita una fecha." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("closing_calls")
    .update({
      next_action: params.nextAction,
      next_action_at: params.nextAction ? (params.nextActionAt ?? null) : null,
      next_action_owner_id: params.nextAction ? (params.ownerId ?? null) : null,
      next_action_notes: params.nextAction ? (params.notes ?? null) : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", params.callId)
    .eq("organization_id", organizationId);

  if (error) return { ok: false, error: error.message };

  revalidatePath(paths.platform.sales.closing);
  return { ok: true };
}

/** Califica al lead, antes o después de la llamada. */
export async function setLeadQualificationAction(params: {
  callId: string;
  moment: "pre" | "post";
  qualification: LeadQualification | null;
}): Promise<{ ok: boolean; error?: string }> {
  const organizationId = await requireOrganizationId();
  const supabase = await createClient();

  const column =
    params.moment === "pre" ? "pre_call_qualification" : "post_call_qualification";

  const { error } = await supabase
    .from("closing_calls")
    .update({ [column]: params.qualification, updated_at: new Date().toISOString() })
    .eq("id", params.callId)
    .eq("organization_id", organizationId);

  if (error) return { ok: false, error: error.message };

  revalidatePath(paths.platform.sales.closing);
  return { ok: true };
}

/**
 * Cierra el ciclo lead → cliente.
 *
 * ⭐ Se llama al cerrar la venta. Sin esto el hilo se corta justo en el momento
 * más importante: el lead desaparece y el cliente aparece, sin nada que diga que
 * son la misma persona. Al revisar, los 264 clientes cargados no tenían ninguna
 * referencia al turno que los originó.
 */
export async function linkLeadToClientAction(params: {
  callId: string;
  clientId: string;
}): Promise<{ ok: boolean; error?: string }> {
  const organizationId = await requireOrganizationId();
  const supabase = await createClient();

  const { data: call } = await supabase
    .from("closing_calls")
    .select("lead_id")
    .eq("id", params.callId)
    .eq("organization_id", organizationId)
    .maybeSingle();

  const leadId = call?.lead_id as string | null | undefined;
  // Un turno sin lead es un turno sin identidad estable (sin mail ni contacto).
  // No es un error: simplemente no hay hilo que cerrar.
  if (!leadId) return { ok: true };

  const { error } = await supabase
    .from("sales_leads")
    .update({ client_id: params.clientId, updated_at: new Date().toISOString() })
    .eq("id", leadId)
    .eq("organization_id", organizationId);

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
