"use server";

import { revalidatePath } from "next/cache";
import { requireOrganizationId } from "@/lib/auth/bootstrap";
import { analyzeFormPatterns, scoreFormResponse } from "@/lib/forms/score-response";
import { scorePendingFormResponses } from "@/lib/forms/sync-scoring";
import { GOOGLE_PERMISSION_RECONNECT_MESSAGE } from "@/lib/google/errors";
import { syncGoogleFormsForOrganization } from "@/lib/google-forms/sync";
import { syncTypeformForOrganization } from "@/lib/typeform/sync";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { runMutation, type MutationResult } from "@/lib/server/action-result";
import { paths } from "@/routes";

export type FormListItem = {
  id: string;
  platform: "typeform" | "google_forms";
  title: string;
  totalResponses: number;
  completionRate: number;
  avgCompletionTimeSeconds: number;
  lastSyncedAt: string | null;
  avgLeadScore: number | null;
};

export async function listFormsAction(): Promise<FormListItem[]> {
  const organizationId = await requireOrganizationId();
  const supabase = await createClient();
  const { data: forms, error } = await supabase
    .from("forms")
    .select("*")
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false });

  if (error || !forms?.length) return [];

  const admin = createAdminClient();
  const items: FormListItem[] = [];

  for (const form of forms) {
    const { data: scores } = await admin
      .from("form_responses")
      .select("ai_lead_score")
      .eq("form_id", form.id)
      .not("ai_lead_score", "is", null);

    const avg =
      scores && scores.length > 0
        ? Math.round(
            scores.reduce((s, r) => s + Number(r.ai_lead_score), 0) /
              scores.length
          )
        : null;

    items.push({
      id: form.id,
      platform: form.platform,
      title: form.title,
      totalResponses: form.total_responses,
      completionRate: Number(form.completion_rate),
      avgCompletionTimeSeconds: form.avg_completion_time_seconds,
      lastSyncedAt: form.last_synced_at,
      avgLeadScore: avg,
    });
  }

  return items;
}

export async function getFormDetailAction(formId: string) {
  const organizationId = await requireOrganizationId();
  const supabase = await createClient();
  const { data: form, error } = await supabase
    .from("forms")
    .select("*")
    .eq("id", formId)
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (error || !form) return null;

  const { data: responses } = await supabase
    .from("form_responses")
    .select("*")
    .eq("form_id", formId)
    .order("submitted_at", { ascending: false })
    .limit(100);

  return { form, responses: responses ?? [] };
}

export async function scoreFormResponsesAction(
  formId: string
): Promise<MutationResult<{ scored: number }>> {
  return runMutation(async () => {
    const organizationId = await requireOrganizationId();
    const admin = createAdminClient();

    const { data: form } = await admin
      .from("forms")
      .select("title")
      .eq("id", formId)
      .eq("organization_id", organizationId)
      .single();

    if (!form) throw new Error("Formulario no encontrado");

    const { data: pending } = await admin
      .from("form_responses")
      .select("id, answers")
      .eq("form_id", formId)
      .is("ai_lead_score", null)
      .limit(20);

    let scored = 0;
    for (const row of pending ?? []) {
      const result = await scoreFormResponse({
        organizationId,
        formTitle: form.title,
        answersJson: JSON.stringify(row.answers),
      });
      if (!result) continue;
      await admin
        .from("form_responses")
        .update({
          ai_lead_score: result.lead_score,
          ai_lead_qualification: result.qualification,
          ai_key_insights: result.key_insights,
        })
        .eq("id", row.id);
      scored++;
    }

    if (scored > 0) {
      const { data: sample } = await admin
        .from("form_responses")
        .select("answers, ai_lead_score, ai_lead_qualification")
        .eq("form_id", formId)
        .limit(30);

      const analysis = await analyzeFormPatterns({
        organizationId,
        formTitle: form.title,
        responsesSample: JSON.stringify(sample ?? []),
      });

      if (analysis) {
        await admin
          .from("forms")
          .update({
            ai_form_analysis: analysis.ai_form_analysis,
            ai_drop_off_insights: analysis.ai_drop_off_insights,
            ai_qualification_insights: analysis.ai_qualification_insights,
          })
          .eq("id", formId);
      }
    }

    revalidatePath(paths.platform.marketing.forms);
    revalidatePath(paths.platform.marketing.formDetail(formId));
    return { scored };
  });
}

export async function getTypeformIntegrationStatusAction(): Promise<{
  connected: boolean;
  lastSyncAt: string | null;
}> {
  const organizationId = await requireOrganizationId();
  const admin = createAdminClient();
  const { data } = await admin
    .from("typeform_integrations")
    .select("status, last_sync_at")
    .eq("organization_id", organizationId)
    .maybeSingle();
  return {
    connected: data?.status === "connected",
    lastSyncAt: data?.last_sync_at ?? null,
  };
}

export async function syncFormAction(
  formId: string
): Promise<
  MutationResult<{
    formsSynced: number;
    responsesSynced: number;
    responsesScored: number;
  }>
> {
  return runMutation(async () => {
    const organizationId = await requireOrganizationId();
    const supabase = await createClient();
    const { data: form } = await supabase
      .from("forms")
      .select("platform")
      .eq("id", formId)
      .eq("organization_id", organizationId)
      .maybeSingle();

    if (!form) throw new Error("Formulario no encontrado");

    const syncResult =
      form.platform === "typeform"
        ? await syncTypeformForOrganization(organizationId)
        : await syncGoogleFormsForOrganization(organizationId);

    if (
      "permissionDenied" in syncResult &&
      syncResult.permissionDenied
    ) {
      throw new Error(GOOGLE_PERMISSION_RECONNECT_MESSAGE);
    }

    const scored = await scorePendingFormResponses(organizationId, formId, 20);

    revalidatePath(paths.platform.marketing.forms);
    revalidatePath(paths.platform.marketing.formDetail(formId));

    return {
      formsSynced: syncResult.formsSynced,
      responsesSynced: syncResult.responsesSynced,
      responsesScored: syncResult.responsesScored + scored,
    };
  });
}

export async function getGoogleFormsIntegrationStatusAction(): Promise<{
  connected: boolean;
  lastSyncAt: string | null;
}> {
  const organizationId = await requireOrganizationId();
  const admin = createAdminClient();
  const { data } = await admin
    .from("google_forms_integrations")
    .select("status, last_sync_at")
    .eq("organization_id", organizationId)
    .maybeSingle();
  return {
    connected: data?.status === "connected",
    lastSyncAt: data?.last_sync_at ?? null,
  };
}
