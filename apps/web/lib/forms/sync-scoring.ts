import { scoreFormResponse } from "@/lib/forms/score-response";
import { createAdminClient } from "@/lib/supabase/admin";

/** Puntúa respuestas nuevas (sin ai_lead_score) de un formulario. */
export async function scorePendingFormResponses(
  organizationId: string,
  formId: string,
  limit = 20
): Promise<number> {
  const admin = createAdminClient();

  const { data: form } = await admin
    .from("forms")
    .select("title")
    .eq("id", formId)
    .eq("organization_id", organizationId)
    .single();

  if (!form) return 0;

  const { data: pending } = await admin
    .from("form_responses")
    .select("id, answers")
    .eq("form_id", formId)
    .is("ai_lead_score", null)
    .limit(limit);

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

  return scored;
}
