"use server";

import { revalidatePath } from "next/cache";
import { requireOrganizationId } from "@/lib/auth/bootstrap";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { listFathomMeetingTypes } from "@/lib/fathom/api";
import type { CallPurpose } from "@/lib/fathom/parse-title";
import type {
  CallCounterparty,
  ClassificationSignal,
  UnclassifiedReason,
} from "@/lib/fathom/classify";

/**
 * Configuración y revisión de la clasificación de llamadas.
 */

export type MeetingTypeRow = {
  name: string;
  status: "active" | "inactive";
  /** Propósito asignado por la organización, si ya se mapeó. */
  purpose: CallPurpose | null;
  /**
   * `true` cuando hay un mapeo guardado para un tipo que Fathom ya no devuelve.
   *
   * ⭐ Pasa porque la API de Fathom no expone ID para los tipos: la clave es el
   * nombre. Si alguien renombra un tipo, el mapeo queda huérfano — y esto es lo
   * que hace que se vea, en vez de dejar de clasificar en silencio.
   */
  orphaned: boolean;
};

export type MeetingTypesState =
  | { status: "not_connected" }
  /** No se pudo consultar la API: distinto de "no hay tipos". */
  | { status: "unavailable" }
  | { status: "ok"; types: MeetingTypeRow[] };

/**
 * Trae los tipos de reunión de Fathom junto con el mapeo guardado.
 *
 * ⭐ La API de tipos es de **sólo lectura**: los tipos se crean y se asignan
 * dentro de Fathom, no desde OTC. Acá sólo se leen para poder mapearlos.
 *
 * Una lista vacía con `status: "ok"` es una respuesta legítima y significativa:
 * la organización no tiene tipos configurados en Fathom, y la clasificación se
 * apoya entonces en los invitados y el cruce con la agenda.
 */
export async function getFathomMeetingTypesAction(): Promise<MeetingTypesState> {
  const organizationId = await requireOrganizationId();
  const admin = createAdminClient();

  const { data: integration } = await admin
    .from("fathom_integrations")
    .select("api_key")
    .eq("organization_id", organizationId)
    .maybeSingle();

  const apiKey = (integration?.api_key as string | null)?.trim();
  if (!apiKey) return { status: "not_connected" };

  const [remote, { data: mappings }] = await Promise.all([
    listFathomMeetingTypes(apiKey),
    admin
      .from("fathom_meeting_type_map")
      .select("meeting_type_name, purpose")
      .eq("organization_id", organizationId),
  ]);

  if (remote === null) return { status: "unavailable" };

  const mapped = new Map<string, CallPurpose>();
  for (const row of mappings ?? []) {
    const name = row.meeting_type_name as string | null;
    const purpose = row.purpose as CallPurpose | null;
    if (name && purpose) mapped.set(name, purpose);
  }

  const types: MeetingTypeRow[] = remote.map((type) => ({
    name: type.name,
    status: type.status,
    purpose: mapped.get(type.name) ?? null,
    orphaned: false,
  }));

  // Mapeos guardados cuyo tipo ya no existe en Fathom.
  const remoteNames = new Set(remote.map((t) => t.name));
  for (const [name, purpose] of mapped) {
    if (!remoteNames.has(name)) {
      types.push({ name, status: "inactive", purpose, orphaned: true });
    }
  }

  return { status: "ok", types };
}

export async function setMeetingTypePurposeAction(params: {
  meetingTypeName: string;
  /** `null` desasigna el tipo. */
  purpose: CallPurpose | null;
}): Promise<{ ok: boolean; error?: string }> {
  const organizationId = await requireOrganizationId();
  const name = params.meetingTypeName.trim();
  if (!name) return { ok: false, error: "Falta el tipo de reunión." };

  const supabase = await createClient();

  if (params.purpose === null) {
    const { error } = await supabase
      .from("fathom_meeting_type_map")
      .delete()
      .eq("organization_id", organizationId)
      .eq("meeting_type_name", name);
    if (error) return { ok: false, error: error.message };
  } else {
    const { error } = await supabase.from("fathom_meeting_type_map").upsert(
      {
        organization_id: organizationId,
        meeting_type_name: name,
        purpose: params.purpose,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "organization_id,meeting_type_name" }
    );
    if (error) return { ok: false, error: error.message };
  }

  revalidatePath("/integrations");
  return { ok: true };
}

// ─── Cola de revisión ────────────────────────────────────────────────────────

export type UnclassifiedCall = {
  id: string;
  title: string;
  callDate: string | null;
  fathomUrl: string | null;
  declaredName: string | null;
  reason: UnclassifiedReason | null;
  /** Mails de los invitados externos, para poder resolver a mano. */
  externalEmails: string[];
  counterparty: CallCounterparty | null;
  signals: ClassificationSignal[];
};

/**
 * Llamadas ya procesadas que quedaron sin propósito.
 *
 * Es la cola de trabajo que reemplaza al valor inventado: antes, cuando la IA
 * fallaba, la llamada se guardaba como `"delivery"` y nadie se enteraba.
 */
export async function listUnclassifiedCallsAction(
  limit = 50
): Promise<UnclassifiedCall[]> {
  const organizationId = await requireOrganizationId();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("fathom_calls")
    .select(
      "id, title, call_date, fathom_url, declared_name, unclassified_reason, counterparty, classification_signals, calendar_invitees"
    )
    .eq("organization_id", organizationId)
    .is("purpose", null)
    .not("status", "in", "(pending,processing)")
    .order("call_date", { ascending: false })
    .limit(limit);

  if (error) return [];

  return (data ?? []).map((row) => {
    const invitees = Array.isArray(row.calendar_invitees)
      ? (row.calendar_invitees as Array<Record<string, unknown>>)
      : [];

    return {
      id: row.id as string,
      title: (row.title as string) ?? "Sin título",
      callDate: (row.call_date as string | null) ?? null,
      fathomUrl: (row.fathom_url as string | null) ?? null,
      declaredName: (row.declared_name as string | null) ?? null,
      reason: (row.unclassified_reason as UnclassifiedReason | null) ?? null,
      externalEmails: invitees
        .filter((i) => i?.isExternal === true || i?.is_external === true)
        .map((i) => String(i.email ?? ""))
        .filter(Boolean),
      counterparty: (row.counterparty as CallCounterparty | null) ?? null,
      signals: (row.classification_signals as ClassificationSignal[]) ?? [],
    };
  });
}

/** Resuelve a mano una llamada de la cola. */
export async function classifyCallManuallyAction(params: {
  callId: string;
  purpose: CallPurpose;
  counterparty: CallCounterparty;
}): Promise<{ ok: boolean; error?: string }> {
  const organizationId = await requireOrganizationId();
  const supabase = await createClient();

  const { error } = await supabase
    .from("fathom_calls")
    .update({
      purpose: params.purpose,
      counterparty: params.counterparty,
      // Queda registrado que lo resolvió una persona, no una señal automática.
      classification_signals: ["manual"],
      unclassified_reason: null,
    })
    .eq("id", params.callId)
    .eq("organization_id", organizationId);

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
