"use server";

import { revalidatePath } from "next/cache";
import { requireOrganizationId } from "@/lib/auth/bootstrap";
import {
  finalizeAssociatedCall,
  processPendingFathomCalls,
} from "@/lib/fathom/process-call";
import { createAdminClient } from "@/lib/supabase/admin";
import { runMutation, type MutationResult } from "@/lib/server/action-result";
import { paths } from "@/routes";

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
      title: call.title,
      rawTitle: call.raw_title ?? call.title,
      transcript: call.transcript,
      fathomUrl: call.fathom_url,
      confidence: 1,
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
