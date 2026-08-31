"use server";

import { revalidatePath } from "next/cache";
import { requireOrganizationId } from "@/lib/auth/bootstrap";
import { requireAuthContext } from "@/lib/auth/require-auth";
import {
  integrationRateLimit,
  rateLimitErrorMessage,
} from "@/lib/rate-limit";
import { apiKeySchema, firstZodError } from "@/lib/validations";
import {
  connectFathomWithApiKey,
  mapFathomConnectError,
} from "@/lib/fathom/connect";
import {
  finalizeAssociatedCall,
  processPendingFathomCalls,
} from "@/lib/fathom/process-call";
import { syncFathomMeetingsForOrganization } from "@/lib/fathom/sync";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { runMutation, type MutationResult } from "@/lib/server/action-result";
import { paths } from "@/routes";

export type FathomConnectState = {
  error?: string;
  success?: string;
};

export async function connectFathomAction(
  _prev: FathomConnectState,
  formData: FormData
): Promise<FathomConnectState> {
  const rawKey = String(formData.get("apiKey") ?? "").trim();
  const parsed = apiKeySchema.safeParse(rawKey);
  if (!parsed.success) {
    return { error: firstZodError(parsed.error) };
  }

  if (!isSupabaseConfigured()) {
    return { error: "Supabase no configurado." };
  }

  try {
    const { user, orgId } = await requireAuthContext();

    const result = await connectFathomWithApiKey(orgId, parsed.data);

    if (!result.ok) {
      return { error: result.error ?? "No se pudo conectar Fathom." };
    }

    // Auto-registrar al usuario que conectó la integración como miembro conectado
    const admin = createAdminClient();
    await admin.from("team_member_integrations").upsert(
      {
        organization_id: orgId,
        user_id: user.id,
        integration_type: "fathom",
        encrypted_api_key: parsed.data,
        connected_at: new Date().toISOString(),
      },
      { onConflict: "organization_id,user_id,integration_type" }
    );

    revalidatePath(paths.platform.integrations);

    if (result.error) {
      return {
        success: result.error,
      };
    }

    const synced = result.synced ?? 0;
    return {
      success:
        synced > 0
          ? `Fathom conectado. ${synced} reunión${synced === 1 ? "" : "es"} importada${synced === 1 ? "" : "s"}.`
          : "Fathom conectado. Las nuevas reuniones se sincronizarán automáticamente.",
    };
  } catch (e) {
    return {
      error: mapFathomConnectError(
        e instanceof Error ? e.message : "Error al conectar Fathom"
      ),
    };
  }
}

export async function syncFathomMeetingsAction(): Promise<
  MutationResult<{ synced: number }>
> {
  return runMutation(async () => {
    const { user, orgId } = await requireAuthContext();

    const { allowed, resetAt } = await integrationRateLimit(`fathom-sync:${user.id}`);
    if (!allowed) {
      throw new Error(rateLimitErrorMessage(resetAt));
    }

    const synced = await syncFathomMeetingsForOrganization(orgId);
    revalidatePath(paths.platform.integrations);
    return { synced };
  });
}

export async function getFathomIntegrationStatusAction(): Promise<{
  connected: boolean;
  lastSyncAt: string | null;
}> {
  try {
    const organizationId = await requireOrganizationId();
    const admin = createAdminClient();
    const { data } = await admin
      .from("fathom_integrations")
      .select("status, last_sync_at")
      .eq("organization_id", organizationId)
      .maybeSingle();

    return {
      connected: data?.status === "connected" && Boolean(data),
      lastSyncAt: data?.last_sync_at ?? null,
    };
  } catch {
    return { connected: false, lastSyncAt: null };
  }
}

export async function countPendingFathomCallsAction(): Promise<number> {
  const organizationId = await requireOrganizationId();
  const admin = createAdminClient();
  const { count } = await admin
    .from("fathom_calls")
    .select("id", { count: "exact", head: true })
    .eq("organization_id", organizationId)
    .in("status", ["unmatched", "pending_review"]);

  return count ?? 0;
}

export async function listPendingFathomCallsAction() {
  const organizationId = await requireOrganizationId();
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("fathom_calls")
    .select(
      "id, title, duration_seconds, call_date, status, association_candidates, fathom_url, created_at"
    )
    .eq("organization_id", organizationId)
    .in("status", ["unmatched", "pending_review"])
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function associateFathomCallAction(
  callId: string,
  clientId: string | null,
  ignore = false
): Promise<MutationResult> {
  return runMutation(async () => {
    const organizationId = await requireOrganizationId();
    const admin = createAdminClient();

    const { data: call } = await admin
      .from("fathom_calls")
      .select("*")
      .eq("id", callId)
      .eq("organization_id", organizationId)
      .single();

    if (!call) throw new Error("Llamada no encontrada");

    if (ignore || !clientId) {
      await admin
        .from("fathom_calls")
        .update({ status: "ignored", client_id: null })
        .eq("id", callId);
      revalidatePending();
      return;
    }

    await finalizeAssociatedCall({
      callId: call.id,
      organizationId,
      clientId,
      fathomCallId: call.fathom_call_id,
      title: call.title,
      rawTitle: call.raw_title ?? call.title,
      transcript: call.transcript,
      fathomUrl: call.fathom_url,
      confidence: 1,
      durationSeconds: call.duration_seconds,
      callDate: call.call_date,
    });

    revalidatePending();
  });
}

export async function processFathomQueueAction(): Promise<
  MutationResult<{ processed: number }>
> {
  return runMutation(async () => {
    const processed = await processPendingFathomCalls();
    revalidatePending();
    return { processed };
  });
}

export async function loadClientTimelineAction(clientId: string) {
  const organizationId = await requireOrganizationId();
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("client_timeline_entries")
    .select("*, fathom_calls(fathom_url)")
    .eq("organization_id", organizationId)
    .eq("client_id", clientId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}

function revalidatePending() {
  revalidatePath(paths.platform.clients.pendingCalls);
  revalidatePath(paths.platform.clients.root);
}

export async function markFathomTasksSentToBoardAction(
  fathomCallId: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    const organizationId = await requireOrganizationId();
    const supabase = await createClient();

    const { error } = await supabase
      .from("fathom_calls")
      .update({ tasks_sent_to_board: true })
      .eq("id", fathomCallId)
      .eq("organization_id", organizationId);

    if (error) {
      return { ok: false, error: error.message };
    }

    revalidatePath(paths.platform.businessContext.documents);
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "No se pudo marcar la reunión.",
    };
  }
}

export async function updateFathomTaskProposalsAction(
  fathomCallId: string,
  proposals: Array<Record<string, unknown>>
): Promise<{ ok: boolean; error?: string }> {
  try {
    const organizationId = await requireOrganizationId();
    const supabase = await createClient();

    const { error } = await supabase
      .from("fathom_calls")
      .update({ ai_task_proposals: proposals })
      .eq("id", fathomCallId)
      .eq("organization_id", organizationId);

    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "No se pudo guardar.",
    };
  }
}

export async function getSalesCallsAction(): Promise<
  Array<{
    id: string;
    title: string;
    fathom_url: string | null;
    call_date: string | null;
    duration_seconds: number | null;
    ai_situation_summary: string | null;
    status: string;
    call_analyses: {
      id: string;
      overall_score: number | null;
      closer_name: string | null;
      lead_qualified: boolean | null;
      sold: boolean;
      booked: boolean;
      summary: string | null;
      strengths: string[];
      improvements: string[];
      objections: Array<{ text: string; handled: boolean }>;
    } | null;
  }>
> {
  try {
    const organizationId = await requireOrganizationId();
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("fathom_calls")
      .select(
        `id, title, fathom_url, call_date, duration_seconds, ai_situation_summary, status,
         call_analyses(id, overall_score, closer_name, lead_qualified, sold, booked, summary, strengths, improvements, objections)`
      )
      .eq("organization_id", organizationId)
      .eq("call_type", "consulting")
      .order("call_date", { ascending: false })
      .limit(100);

    if (error) throw error;

    return (data ?? []).map((row) => ({
      ...row,
      call_analyses: Array.isArray(row.call_analyses)
        ? (row.call_analyses[0] ?? null)
        : (row.call_analyses ?? null),
    }));
  } catch {
    return [];
  }
}
