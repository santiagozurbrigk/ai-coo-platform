"use server";

/**
 * El envío del formulario de onboarding. Pública: la llama el cliente de un
 * growth partner desde su link, sin sesión.
 *
 * ⭐ Lo único que la protege es el token (24 bytes al azar, uno activo por
 * cliente) y un límite de envíos por IP. Todo lo demás se valida acá, en el
 * servidor, contra las preguntas de la base: lo que diga el navegador no vale.
 */

import { headers } from "next/headers";
import { z } from "zod";
import {
  applyOnboardingAnswers,
  validateOnboardingAnswers,
} from "@/lib/client-onboarding/form";
import { loadOnboardingByToken } from "@/lib/client-onboarding/public";
import { publicFormRateLimit, rateLimitErrorMessage } from "@/lib/rate-limit";
import { createAdminClient } from "@/lib/supabase/admin";

const inputSchema = z.object({
  token: z.string().min(1).max(128),
  respondentName: z.string().trim().min(1, "Poné tu nombre.").max(200),
  answers: z.record(z.string(), z.unknown()),
});

export type SubmitOnboardingResult =
  | { ok: true }
  | { ok: false; error: string; errors?: Record<string, string> };

const LINK_INVALIDO =
  "Este link ya no está activo. Pedile uno nuevo a tu contacto del equipo.";

export async function submitClientOnboardingAction(
  input: z.input<typeof inputSchema>
): Promise<SubmitOnboardingResult> {
  const parsed = inputSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Envío inválido." };
  }
  const { token, respondentName, answers } = parsed.data;

  const h = await headers();
  const ip =
    h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
  const limite = await publicFormRateLimit(`client-onboarding:${ip}`);
  if (!limite.allowed) {
    return { ok: false, error: rateLimitErrorMessage(limite.resetAt) };
  }

  const form = await loadOnboardingByToken(token);
  if (!form) return { ok: false, error: LINK_INVALIDO };

  const validation = validateOnboardingAnswers(form.fields, answers);
  if (!validation.ok) {
    return {
      ok: false,
      error: "Hay respuestas para revisar.",
      errors: validation.errors,
    };
  }

  const applied = applyOnboardingAnswers(form.subClient.custom, validation.values);
  const labels: Record<string, string> = {};
  for (const field of form.fields) {
    if (field.key in validation.values) labels[field.key] = field.label;
  }

  const admin = createAdminClient();

  /*
   * ⭐ Primero el historial, después la ficha. Si la segunda escritura falla,
   * queda un envío registrado que no llegó a la ficha —se ve y se reintenta—,
   * nunca una ficha pisada sin rastro de lo que había.
   */
  const { data: submission, error: submissionError } = await admin
    .from("client_onboarding_submissions")
    .insert({
      organization_id: form.organizationId,
      client_id: form.clientId,
      sub_client_id: form.subClient.id,
      link_id: form.linkId,
      respondent_name: respondentName,
      answers: validation.values,
      replaced: applied.replaced,
      labels,
    })
    .select("id")
    .single();
  if (submissionError) {
    console.error("[onboarding] guardar envío", submissionError.message);
    return { ok: false, error: "No pudimos guardar tus respuestas. Probá de nuevo en un rato." };
  }

  if (applied.changed.length > 0) {
    const { error: updateError } = await admin
      .from("client_sub_clients")
      .update({ custom: applied.custom, updated_at: new Date().toISOString() })
      .eq("id", form.subClient.id)
      .eq("organization_id", form.organizationId);
    if (updateError) {
      console.error("[onboarding] actualizar ficha", updateError.message);
      return { ok: false, error: "No pudimos guardar tus respuestas. Probá de nuevo en un rato." };
    }
  }

  // La línea de tiempo del growth partner. Si falla no se rompe el envío: las
  // respuestas ya están guardadas, y el historial del link lo muestra igual.
  const cambios = applied.changed.length;
  const { error: timelineError } = await admin.from("client_timeline_entries").insert({
    organization_id: form.organizationId,
    client_id: form.clientId,
    entry_type: "onboarding",
    title: `Onboarding completado: ${form.subClient.name}`,
    situation_summary: `Lo completó ${respondentName}. ${
      cambios === 0
        ? "No cambió ninguna respuesta."
        : cambios === 1
          ? "Cambió 1 respuesta."
          : `Cambiaron ${cambios} respuestas.`
    }`,
    raw_data: { submission_id: submission.id, sub_client_id: form.subClient.id },
  });
  if (timelineError) console.error("[onboarding] línea de tiempo", timelineError.message);

  return { ok: true };
}
