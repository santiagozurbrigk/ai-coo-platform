import { scorePendingFormResponses } from "@/lib/forms/sync-scoring";
import { createAdminClient } from "@/lib/supabase/admin";

type TypeformIntegration = {
  organization_id: string;
  access_token: string | null;
  refresh_token: string | null;
  token_expires_at: string | null;
  last_sync_at: string | null;
};

type TypeformFormItem = {
  id: string;
  title: string;
  description?: string;
  fields?: { id: string; title: string; type: string }[];
};

type TypeformResponseItem = {
  token: string;
  submitted_at: string;
  landed_at?: string;
  answers?: {
    field: { id: string; type: string };
    type: string;
    text?: string;
    email?: string;
    choice?: { label: string };
    choices?: { labels: string[] };
    number?: number;
    boolean?: boolean;
  }[];
};

async function refreshTypeformToken(
  integration: TypeformIntegration
): Promise<string | null> {
  if (!integration.refresh_token) return integration.access_token;

  const clientId = process.env.TYPEFORM_CLIENT_ID;
  const clientSecret = process.env.TYPEFORM_CLIENT_SECRET;
  if (!clientId || !clientSecret) return integration.access_token;

  const res = await fetch("https://api.typeform.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: integration.refresh_token,
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });

  if (!res.ok) return integration.access_token;

  const tokens = (await res.json()) as {
    access_token: string;
    refresh_token?: string;
    expires_in?: number;
  };

  const admin = createAdminClient();
  await admin
    .from("typeform_integrations")
    .update({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token ?? integration.refresh_token,
      token_expires_at: tokens.expires_in
        ? new Date(Date.now() + tokens.expires_in * 1000).toISOString()
        : null,
    })
    .eq("organization_id", integration.organization_id);

  return tokens.access_token;
}

async function getAccessToken(
  integration: TypeformIntegration
): Promise<string | null> {
  if (!integration.access_token) return null;

  const expiresAt = integration.token_expires_at
    ? new Date(integration.token_expires_at).getTime()
    : null;
  if (expiresAt && expiresAt < Date.now() + 60_000) {
    return refreshTypeformToken(integration);
  }
  return integration.access_token;
}

function mapTypeformAnswers(
  answers: TypeformResponseItem["answers"]
): { field: string; value: string }[] {
  return (answers ?? []).map((a) => {
    let value = "";
    if (a.email) value = a.email;
    else if (a.text) value = a.text;
    else if (a.choice?.label) value = a.choice.label;
    else if (a.choices?.labels) value = a.choices.labels.join(", ");
    else if (a.number != null) value = String(a.number);
    else if (a.boolean != null) value = a.boolean ? "Sí" : "No";
    return { field: a.field?.id ?? a.type, value };
  });
}

function extractRespondent(
  answers: TypeformResponseItem["answers"]
): { email: string | null; name: string | null } {
  let email: string | null = null;
  let name: string | null = null;
  for (const a of answers ?? []) {
    if (a.type === "email" && a.email) email = a.email;
    if (
      (a.field?.type === "short_text" || a.type === "text") &&
      a.text &&
      !name
    ) {
      name = a.text;
    }
  }
  return { email, name };
}

export type TypeformSyncResult = {
  formsSynced: number;
  responsesSynced: number;
  responsesScored: number;
};

export async function syncTypeformForOrganization(
  organizationId: string
): Promise<TypeformSyncResult> {
  const admin = createAdminClient();
  const result: TypeformSyncResult = {
    formsSynced: 0,
    responsesSynced: 0,
    responsesScored: 0,
  };

  const { data: integration } = await admin
    .from("typeform_integrations")
    .select("*")
    .eq("organization_id", organizationId)
    .eq("status", "connected")
    .maybeSingle();

  if (!integration?.access_token) return result;

  const accessToken = await getAccessToken(integration as TypeformIntegration);
  if (!accessToken) return result;

  const headers = { Authorization: `Bearer ${accessToken}` };

  const formsRes = await fetch(
    "https://api.typeform.com/forms?page_size=200",
    { headers }
  );
  if (!formsRes.ok) return result;

  const formsBody = (await formsRes.json()) as { items?: TypeformFormItem[] };
  const remoteForms = formsBody.items ?? [];

  for (const remote of remoteForms) {
    const questions = (remote.fields ?? []).map((f) => ({
      id: f.id,
      title: f.title,
      type: f.type,
    }));

    const { data: formRow, error: formError } = await admin
      .from("forms")
      .upsert(
        {
          organization_id: organizationId,
          platform: "typeform",
          external_form_id: remote.id,
          title: remote.title,
          description: remote.description ?? null,
          questions,
          is_active: true,
        },
        { onConflict: "organization_id,platform,external_form_id" }
      )
      .select("id, last_synced_at")
      .single();

    if (formError || !formRow) continue;
    result.formsSynced++;

    const since = formRow.last_synced_at ?? integration.last_sync_at;
    let url = `https://api.typeform.com/forms/${remote.id}/responses?page_size=1000`;
    if (since) url += `&since=${encodeURIComponent(since)}`;

    const responsesRes = await fetch(url, { headers });
    if (!responsesRes.ok) continue;

    const responsesBody = (await responsesRes.json()) as {
      items?: TypeformResponseItem[];
    };
    const items = responsesBody.items ?? [];
    let newForForm = 0;

    for (const item of items) {
      const { email, name } = extractRespondent(item.answers);
      const submittedAt = item.submitted_at ?? null;
      let completionSeconds = 0;
      if (item.landed_at && item.submitted_at) {
        completionSeconds = Math.max(
          0,
          Math.round(
            (new Date(item.submitted_at).getTime() -
              new Date(item.landed_at).getTime()) /
              1000
          )
        );
      }

      const { error: upsertError } = await admin.from("form_responses").upsert(
        {
          organization_id: organizationId,
          form_id: formRow.id,
          external_response_id: item.token,
          respondent_email: email,
          respondent_name: name,
          answers: mapTypeformAnswers(item.answers),
          submitted_at: submittedAt,
          completion_time_seconds: completionSeconds,
          is_complete: true,
        },
        { onConflict: "external_response_id", ignoreDuplicates: false }
      );

      if (!upsertError) {
        newForForm++;
        result.responsesSynced++;
      }
    }

    const { count: totalResponses } = await admin
      .from("form_responses")
      .select("id", { count: "exact", head: true })
      .eq("form_id", formRow.id);

    await admin
      .from("forms")
      .update({
        total_responses: totalResponses ?? 0,
        last_synced_at: new Date().toISOString(),
      })
      .eq("id", formRow.id);

    if (newForForm > 0) {
      result.responsesScored += await scorePendingFormResponses(
        organizationId,
        formRow.id,
        Math.min(newForForm, 20)
      );
    }
  }

  await admin
    .from("typeform_integrations")
    .update({ last_sync_at: new Date().toISOString() })
    .eq("organization_id", organizationId);

  return result;
}

export async function syncAllTypeformOrganizations(): Promise<{
  orgs: number;
  formsSynced: number;
  responsesSynced: number;
  responsesScored: number;
}> {
  const admin = createAdminClient();
  const { data: integrations } = await admin
    .from("typeform_integrations")
    .select("organization_id")
    .eq("status", "connected");

  let formsSynced = 0;
  let responsesSynced = 0;
  let responsesScored = 0;

  for (const row of integrations ?? []) {
    const r = await syncTypeformForOrganization(row.organization_id);
    formsSynced += r.formsSynced;
    responsesSynced += r.responsesSynced;
    responsesScored += r.responsesScored;
  }

  return {
    orgs: integrations?.length ?? 0,
    formsSynced,
    responsesSynced,
    responsesScored,
  };
}

export async function syncTypeformForm(
  organizationId: string,
  formId: string
): Promise<TypeformSyncResult> {
  const admin = createAdminClient();
  const { data: form } = await admin
    .from("forms")
    .select("external_form_id, platform")
    .eq("id", formId)
    .eq("organization_id", organizationId)
    .eq("platform", "typeform")
    .maybeSingle();

  if (!form) {
    return { formsSynced: 0, responsesSynced: 0, responsesScored: 0 };
  }

  const full = await syncTypeformForOrganization(organizationId);
  return full;
}
