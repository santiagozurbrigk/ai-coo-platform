/**
 * Endpoint de cola: publica UNA variante de Trial Reels en Zernio.
 *
 * Disparado por QStash con delay real (configurado en publishVariationsAction).
 * La primera variante puede enviarse con delay=0 (publicación inmediata),
 * las siguientes con delay=N*delay_hours*3600 segundos.
 *
 * Auth: WORKER_AUTH_SECRET (primario) o QStash signature (fallback).
 *
 * Payload QStash:
 *   { jobId, variationIndex, organizationId }
 *
 * Idempotente: si variation.status !== "scheduled", responde 200 sin hacer nada.
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyQueueRequest } from "@/lib/queue/verify-queue-request";
import type { ReelVariation } from "@/types/reel-variations";

export const runtime = "nodejs";
export const maxDuration = 30; // publicar en Zernio es rápido (<5s)

// ─── Schema ───────────────────────────────────────────────────────────────────

const payloadSchema = z.object({
  jobId: z.string().uuid(),
  variationIndex: z.number().int().min(0).max(9),
  organizationId: z.string().uuid(),
});

// ─── Handler ──────────────────────────────────────────────────────────────────

export async function POST(request: Request) {
  const rawBody = await request.text();

  // 1. Autenticar (WORKER_AUTH_SECRET o QStash signature)
  const auth = await verifyQueueRequest(request, rawBody);
  if (!auth.ok) {
    console.warn("[PublishVariation] auth failed", auth.error);
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  // 2. Parsear y validar payload
  let body: unknown;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = payloadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid payload" },
      { status: 400 }
    );
  }

  const { jobId, variationIndex, organizationId } = parsed.data;
  console.log("[PublishVariation] received", { jobId, variationIndex });

  const admin = createAdminClient();

  // 3. Leer el job (admin client — no hay sesión de usuario en este endpoint)
  const { data: job, error: jobError } = await admin
    .from("reel_variation_jobs")
    .select("*")
    .eq("id", jobId)
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (jobError || !job) {
    console.error("[PublishVariation] job not found", { jobId, error: jobError?.message });
    // 200 para que QStash no reintente — no tiene sentido reintentar si el job no existe
    return NextResponse.json({ ok: false, error: "Job not found" }, { status: 200 });
  }

  const variations = (job.variations ?? []) as ReelVariation[];
  const variation = variations[variationIndex];

  if (!variation) {
    return NextResponse.json({ ok: false, error: "Variation index out of range" }, { status: 200 });
  }

  // 4. Idempotencia — solo procesar si está en "scheduled"
  if (variation.status !== "scheduled") {
    console.log("[PublishVariation] already processed, skipping", {
      jobId,
      variationIndex,
      status: variation.status,
    });
    return NextResponse.json({ ok: true, skipped: true, status: variation.status });
  }

  const updatedVariations = [...variations];

  try {
    // 5. Obtener cliente Zernio e integración (para profileId y accountId)
    const { getZernioClientForOrganization, getZernioIntegrationForOrg } = await import(
      "@/lib/zernio/integration"
    );

    let zernioClient;
    try {
      zernioClient = await getZernioClientForOrganization(organizationId);
    } catch {
      throw new Error("Zernio no está conectado para esta organización");
    }

    const integration = await getZernioIntegrationForOrg(organizationId);
    const igAccount = integration?.connected_accounts?.find(
      (a: { platform: string }) => a.platform === "instagram"
    );

    // 6. Crear URL firmada del video (TTL 1h — suficiente para que Zernio procese)
    const { data: signedData } = await admin.storage
      .from("trial-reels")
      .createSignedUrl(variation.storage_path, 3600);

    if (!signedData?.signedUrl) {
      throw new Error("No se pudo generar URL firmada para el video");
    }

    // 7. Publicar en Zernio como draft
    //    La URL firmada se incluye en el content para que el usuario pueda
    //    descargar y subir el video manualmente a Zernio si el upload directo no está disponible.
    const caption =
      variation.description +
      (variation.hashtags?.length ? `\n\n${variation.hashtags.join(" ")}` : "");

    const result = await zernioClient.createPost({
      profileId: integration?.zernio_profile_id ?? "",
      platform: "instagram",
      postType: "reel",
      status: "draft",
      content: caption,
      ...(igAccount ? { accountId: igAccount.accountId } : {}),
    });

    updatedVariations[variationIndex] = {
      ...variation,
      status: "published",
      zernio_post_id:
        (result as { id?: string; _id?: string })?.id ??
        (result as { id?: string; _id?: string })?._id ??
        null,
      published_at: new Date().toISOString(),
      error: null,
    };

    console.log("[PublishVariation] published", {
      jobId,
      variationIndex,
      type: variation.type,
      zernioPostId: updatedVariations[variationIndex].zernio_post_id,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[PublishVariation] failed", { jobId, variationIndex, error: msg });

    updatedVariations[variationIndex] = {
      ...variation,
      status: "failed",
      error: msg,
    };
  }

  // 8. Verificar si todas las variantes incluidas terminaron (published | failed)
  const includedVariations = updatedVariations.filter((v) => v.included);
  const allDone = includedVariations.every(
    (v) => v.status === "published" || v.status === "failed"
  );

  await admin
    .from("reel_variation_jobs")
    .update({
      variations: updatedVariations,
      ...(allDone ? { status: "done" } : {}),
    })
    .eq("id", jobId);

  if (allDone) {
    console.log("[PublishVariation] all done, job marked as done", { jobId });
  }

  return NextResponse.json({
    ok: true,
    jobId,
    variationIndex,
    status: updatedVariations[variationIndex].status,
    allDone,
  });
}
