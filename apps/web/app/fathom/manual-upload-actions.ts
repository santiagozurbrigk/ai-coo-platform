"use server";

/**
 * Subir a mano la 1-1 de un cliente, pegando el link compartido de Fathom.
 *
 * ⭐ **Acá no corre el clasificador, a propósito.**
 *
 * El clasificador existe para adivinar dos cosas que la sincronización no sabe:
 * con quién fue la llamada y para qué. En este camino las dijo una persona —
 * eligió el cliente y apretó "subir una 1-1"—. Volver a adivinarlas sólo podría
 * empeorar un dato que ya es correcto, y es justamente donde hoy se pierden las
 * llamadas: el 86% de los títulos reales son "Impromptu Google Meet Meeting".
 *
 * El resto del camino sí es el de siempre: `finalizeAssociatedCall` analiza el
 * transcript, escribe el resumen, los próximos pasos, la entrada del timeline y
 * las tareas del cliente. Un flujo paralelo se habría desincronizado del otro.
 */

import { revalidatePath } from "next/cache";
import { getCurrentProfile, requireOrganizationId } from "@/lib/auth/bootstrap";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { runMutation, type MutationResult } from "@/lib/server/action-result";
import {
  FathomShareError,
  fetchFathomShare,
  fetchFathomShareTranscript,
  parseFathomShareUrl,
} from "@/lib/fathom/share-link";
import { MANUAL_FATHOM_LINK_CONFIDENCE } from "@/lib/fathom/client-matcher";
import { finalizeAssociatedCall } from "@/lib/fathom/process-call";
import { paths } from "@/routes";

export type ManualCallUploadResult = {
  callId: string;
  title: string;
  callDate: string | null;
  durationSeconds: number | null;
  hasTranscript: boolean;
  /** Cuántas tareas salieron de la llamada. */
  tasksCreated: number;
  /** La llamada ya estaba en el sistema y se reusó en vez de duplicarla. */
  alreadyExisted: boolean;
};

export async function uploadOneOnOneFromShareLinkAction(input: {
  clientId: string;
  shareUrl: string;
}): Promise<MutationResult<ManualCallUploadResult>> {
  return runMutation(async () => {
    const organizationId = await requireOrganizationId();

    const ref = parseFathomShareUrl(input.shareUrl);
    if (!ref) {
      throw new FathomShareError(
        "Ese no parece un link de Fathom. Tiene que ser el de «Compartir», el que empieza con fathom.video/share/."
      );
    }

    /**
     * ⭐ El cliente se valida con la sesión del usuario, no con el admin.
     *
     * Todo lo que sigue escribe con el cliente admin, que se saltea RLS. Si el
     * `clientId` no se chequeara acá, alguien podría colgarle una llamada a un
     * cliente de otra organización mandando un id cualquiera.
     */
    const supabase = await createClient();
    const { data: client } = await supabase
      .from("clients")
      .select("id, name")
      .eq("id", input.clientId)
      .eq("organization_id", organizationId)
      .maybeSingle();

    if (!client) {
      throw new Error("No se encontró ese cliente en tu organización.");
    }

    const payload = await fetchFathomShare(ref);
    const transcript = await fetchFathomShareTranscript(payload);

    const profile = await getCurrentProfile();
    const admin = createAdminClient();
    const title = payload.title ?? "Sesión 1-1";

    /**
     * ⭐ Se busca antes de insertar porque la llamada puede estar ya en la base:
     * la sincronización la bajó y quedó sin cliente, que es el estado en el que
     * hoy están la mayoría. `fathom_call_id` es el mismo número que usa el sync,
     * así que se reusa la fila en vez de duplicar la llamada.
     */
    const { data: existente } = await admin
      .from("fathom_calls")
      .select("id, transcript, client_id, status, processed_at")
      .eq("organization_id", organizationId)
      .eq("fathom_call_id", payload.callId)
      .maybeSingle();

    /**
     * ⭐ El mismo link pegado dos veces no vuelve a analizar nada.
     *
     * Las tareas ya tienen su propio seguro, pero el finalizador también escribe
     * una entrada del timeline y los problemas detectados, y **esos no lo
     * tienen**: la segunda corrida dejaría la misma sesión dos veces en el
     * historial del cliente, que es justo donde se mira para saber qué pasó.
     */
    const yaProcesada = Boolean(
      existente?.processed_at &&
        existente.status === "associated" &&
        existente.client_id === input.clientId
    );

    const fila = {
      organization_id: organizationId,
      fathom_call_id: payload.callId,
      title,
      raw_title: payload.title,
      fathom_url: ref.url,
      call_date: payload.startedAt,
      duration_seconds: payload.durationSeconds,
      // Un transcript que no se pudo bajar **no pisa** el que ya estaba.
      transcript: transcript ?? existente?.transcript ?? null,
      client_id: input.clientId,
      status: "associated" as const,
      // Lo dijo una persona: es el mayor nivel de certeza que maneja el sistema.
      association_confidence: MANUAL_FATHOM_LINK_CONFIDENCE,
      resolution_method: "manual" as const,
      counterparty: "client" as const,
      purpose: "delivery" as const,
      ingest_source: "manual_link" as const,
      uploaded_by: profile?.id ?? null,
      share_token: ref.token,
      // El payload crudo, antes de interpretarlo.
      share_payload: payload.raw as Record<string, unknown>,
      processed_after: new Date().toISOString(),
    };

    let callId: string;
    if (existente) {
      const { error } = await admin
        .from("fathom_calls")
        .update(fila)
        .eq("id", existente.id);
      if (error) throw new Error(error.message);
      callId = existente.id;
    } else {
      const { data, error } = await admin
        .from("fathom_calls")
        .insert(fila)
        .select("id")
        .single();
      if (error) throw new Error(error.message);
      callId = data.id as string;
    }

    const tasksAntes = await contarTareasDeLaLlamada(callId);

    /**
     * El mismo finalizador que usa la asociación manual desde la cola de
     * revisión: analiza el transcript, escribe el resumen y los próximos pasos,
     * arma la entrada del timeline y extrae las tareas de la 1-1.
     */
    if (!yaProcesada) {
      await finalizeAssociatedCall({
        callId,
        organizationId,
        clientId: input.clientId,
        fathomCallId: payload.callId,
        title,
        rawTitle: payload.title ?? title,
        transcript: fila.transcript,
        fathomUrl: ref.url,
        confidence: MANUAL_FATHOM_LINK_CONFIDENCE,
        durationSeconds: payload.durationSeconds,
        callDate: payload.startedAt,
        purpose: "delivery",
      });
    }

    const tasksDespues = await contarTareasDeLaLlamada(callId);

    revalidatePath(paths.platform.clients.detail(input.clientId));

    return {
      callId,
      title,
      callDate: payload.startedAt,
      durationSeconds: payload.durationSeconds,
      hasTranscript: Boolean(fila.transcript),
      tasksCreated: Math.max(0, tasksDespues - tasksAntes),
      alreadyExisted: yaProcesada,
    };
  });
}

async function contarTareasDeLaLlamada(callId: string): Promise<number> {
  const admin = createAdminClient();
  const { count } = await admin
    .from("client_tasks")
    .select("id", { count: "exact", head: true })
    .eq("source_call_id", callId);
  return count ?? 0;
}
