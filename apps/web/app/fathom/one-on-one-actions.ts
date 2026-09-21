"use server";

/**
 * Las sesiones 1-1 de un cliente, para su ficha.
 *
 * ⭐ Existe porque el bloque «Llamadas del cliente» **nunca mostró las 1-1**.
 * Ese bloque se llena desde `clients.linked_calls`, que sólo escribe el análisis
 * profundo de las llamadas de **venta** — el del closer. Una ficha con diez
 * sesiones de acompañamiento mostraba igual "Sin llamadas vinculadas", y lo de
 * las 1-1 terminaba como texto suelto en el timeline.
 */

import { requireOrganizationId } from "@/lib/auth/bootstrap";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { loadClientOneOnOneStats } from "@/lib/fathom/one-on-ones";
import type { OneOnOneStats } from "@/lib/fathom/one-on-one-types";

export type ClientOneOnOneCall = {
  id: string;
  title: string;
  /** `YYYY-MM-DD`. */
  date: string | null;
  durationMinutes: number | null;
  fathomUrl: string | null;
  situationSummary: string | null;
  nextSteps: string[];
  /** La subió alguien pegando el link, en vez de entrar por la sincronización. */
  uploadedManually: boolean;
  hasTranscript: boolean;
};

export type ClientOneOnOnes = {
  stats: OneOnOneStats;
  calls: ClientOneOnOneCall[];
};

const EMPTY: ClientOneOnOnes = {
  stats: {
    totalCalls: 0,
    firstDate: null,
    lastDate: null,
    everyDays: null,
    daysSinceLast: null,
  },
  calls: [],
};

/** Cuántas se listan. El contador cuenta todas; la lista no se hace infinita. */
const LIMITE = 50;

export async function getClientOneOnOnesAction(
  clientId: string
): Promise<ClientOneOnOnes> {
  const organizationId = await requireOrganizationId();

  /**
   * ⭐ La pertenencia del cliente se chequea con la sesión del usuario antes de
   * leer nada con el cliente admin. `fathom_calls` guarda transcripts completos
   * de conversaciones: un id de otra organización no puede devolver contenido.
   */
  const supabase = await createClient();
  const { data: client } = await supabase
    .from("clients")
    .select("id")
    .eq("id", clientId)
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (!client) return EMPTY;

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("fathom_calls")
    .select(
      "id, title, call_date, duration_seconds, fathom_url, ai_situation_summary, ai_next_steps, ingest_source, transcript"
    )
    .eq("organization_id", organizationId)
    .eq("client_id", clientId)
    .eq("purpose", "delivery")
    .order("call_date", { ascending: false })
    .limit(LIMITE);

  if (error) {
    console.error("[fathom:one-on-ones] ficha", error.message);
    return EMPTY;
  }

  const rows = (data ?? []) as {
    id: string;
    title: string | null;
    call_date: string | null;
    duration_seconds: number | null;
    fathom_url: string | null;
    ai_situation_summary: string | null;
    ai_next_steps: string[] | null;
    ingest_source: string | null;
    transcript: string | null;
  }[];

  return {
    stats: await loadClientOneOnOneStats(organizationId, clientId),
    calls: rows.map((row) => ({
      id: row.id,
      title: row.title ?? "Sesión 1-1",
      date: row.call_date ? row.call_date.slice(0, 10) : null,
      // Sin duración conocida queda `null`: una llamada no dura cero minutos.
      durationMinutes:
        row.duration_seconds != null && row.duration_seconds > 0
          ? Math.max(1, Math.round(row.duration_seconds / 60))
          : null,
      fathomUrl: row.fathom_url,
      situationSummary: row.ai_situation_summary,
      nextSteps: row.ai_next_steps ?? [],
      uploadedManually: row.ingest_source === "manual_link",
      hasTranscript: Boolean(row.transcript?.trim()),
    })),
  };
}
