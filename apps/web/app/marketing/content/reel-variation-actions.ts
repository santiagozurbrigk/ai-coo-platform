"use server";

import { revalidatePath } from "next/cache";
import { getCurrentProfile } from "@/lib/auth/bootstrap";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { getGoogleAccessTokenForOrganization } from "@/lib/google/get-access-token";
import { getQStashClient, getPublicAppUrl } from "@/lib/queue/qstash-client";
import type { ReelVariationJob, ReelVariation } from "@/types/reel-variations";
import type { ContentPiece } from "@/types/content";
import { paths } from "@/routes";

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function requireOrgId(): Promise<string> {
  const profile = await getCurrentProfile();
  if (!profile?.organization_id) throw new Error("Sesión no válida");
  return profile.organization_id;
}

const STORAGE_BUCKET = "trial-reels";
const MAX_VIDEO_BYTES = 500 * 1024 * 1024; // 500 MB

// ─── Descarga de Drive ────────────────────────────────────────────────────────

async function downloadDriveVideo(
  fileId: string,
  accessToken: string
): Promise<{ buffer: ArrayBuffer; mimeType: string; name: string }> {
  // Metadatos
  const metaUrl = new URL(
    `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}`
  );
  metaUrl.searchParams.set("fields", "id,name,mimeType,size");
  metaUrl.searchParams.set("supportsAllDrives", "true");

  const metaRes = await fetch(metaUrl.toString(), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!metaRes.ok) {
    const code = metaRes.status;
    throw new Error(
      code === 401 || code === 403
        ? "GOOGLE_INSUFFICIENT_PERMISSIONS"
        : `Error al leer metadatos de Drive (${code})`
    );
  }

  const meta = (await metaRes.json()) as {
    id: string;
    name: string;
    mimeType: string;
    size?: string;
  };

  const fileSize = meta.size ? Number.parseInt(meta.size, 10) : 0;
  if (fileSize > MAX_VIDEO_BYTES) {
    throw new Error("El video supera el límite de 500 MB");
  }

  const downloadUrl = new URL(
    `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}`
  );
  downloadUrl.searchParams.set("alt", "media");
  downloadUrl.searchParams.set("supportsAllDrives", "true");

  const res = await fetch(downloadUrl.toString(), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    throw new Error(`Error al descargar video de Drive (${res.status})`);
  }

  return {
    buffer: await res.arrayBuffer(),
    mimeType: meta.mimeType,
    name: meta.name,
  };
}

// ─── Crear job ────────────────────────────────────────────────────────────────

export type CreateTrialReelsResult =
  | { ok: true; jobId: string }
  | { ok: false; errorCode: string; message: string };

export async function createTrialReelsJobAction(
  contentPieceId: string
): Promise<CreateTrialReelsResult> {
  try {
    const organizationId = await requireOrgId();
    const supabase = await createClient();

    // 1. Leer la pieza de contenido
    const { data: piece, error: pieceError } = await supabase
      .from("content_pieces")
      .select("id, drive_file_id, title, caption, status, type")
      .eq("id", contentPieceId)
      .eq("organization_id", organizationId)
      .maybeSingle();

    if (pieceError) throw new Error(pieceError.message);
    if (!piece) throw new Error("Pieza de contenido no encontrada");
    if (!piece.drive_file_id) {
      return {
        ok: false,
        errorCode: "NO_DRIVE_FILE",
        message:
          "Esta pieza no tiene un archivo de Drive vinculado. Vinculá el video original primero.",
      };
    }

    // 2. Obtener token de Google
    const accessToken = await getGoogleAccessTokenForOrganization(organizationId);
    if (!accessToken) {
      return {
        ok: false,
        errorCode: "GOOGLE_NOT_CONNECTED",
        message: "Conectá Google Drive en Integraciones para usar esta función.",
      };
    }

    // 3. Descargar el video desde Drive
    let videoBuffer: ArrayBuffer;
    let mimeType: string;
    let fileName: string;

    try {
      const downloaded = await downloadDriveVideo(piece.drive_file_id, accessToken);
      videoBuffer = downloaded.buffer;
      mimeType = downloaded.mimeType;
      fileName = downloaded.name;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al descargar";
      if (msg === "GOOGLE_NOT_CONNECTED" || msg === "GOOGLE_INSUFFICIENT_PERMISSIONS") {
        return { ok: false, errorCode: msg, message: "Sin acceso a Google Drive" };
      }
      return { ok: false, errorCode: "DRIVE_DOWNLOAD_FAILED", message: msg };
    }

    // 4. Subir video fuente a Supabase Storage
    const admin = createAdminClient();
    const jobId = crypto.randomUUID();
    const ext = mimeType.includes("mp4") ? "mp4" : mimeType.includes("quicktime") ? "mov" : "mp4";
    const sourceStoragePath = `${organizationId}/source/${jobId}.${ext}`;

    const { error: uploadError } = await admin.storage
      .from(STORAGE_BUCKET)
      .upload(sourceStoragePath, videoBuffer, {
        contentType: mimeType,
        upsert: false,
      });

    if (uploadError) {
      throw new Error(`Error al subir video fuente: ${uploadError.message}`);
    }

    // 5. Crear el job en DB
    const { error: insertError } = await admin
      .from("reel_variation_jobs")
      .insert({
        id: jobId,
        organization_id: organizationId,
        source_piece_id: contentPieceId,
        status: "pending",
        delay_hours: 2,
        variations: [],
      });

    if (insertError) {
      // Limpiar el archivo subido si falla el insert
      await admin.storage.from(STORAGE_BUCKET).remove([sourceStoragePath]);
      throw new Error(`Error al crear job: ${insertError.message}`);
    }

    // 6. Publicar en QStash → worker de Fly.io
    const client = getQStashClient();
    if (client) {
      const workerUrl = getReelWorkerUrl();
      console.log("[TrialReels] publishing to QStash", { jobId, workerUrl });
      try {
        const qstashResult = await client.publishJSON({
          url: workerUrl,
          body: {
            jobId,
            organizationId,
            sourcePieceId: contentPieceId,
            sourceStoragePath,
            sourceFileName: fileName,
            originalCaption: (piece as ContentPiece & { caption?: string }).caption ?? piece.title ?? null,
          },
          retries: 2,
          timeout: 900, // 15 min — FFmpeg puede tardar
        });
        console.log("[TrialReels] QStash published OK", { jobId, messageId: qstashResult.messageId, workerUrl });
      } catch (qstashErr) {
        // Si QStash falla al publicar, marcar el job como failed en DB
        // para que el usuario vea el error en vez de quedar en "pending" indefinidamente.
        const qstashMsg = qstashErr instanceof Error ? qstashErr.message : String(qstashErr);
        console.error("[TrialReels] QStash publish failed", { jobId, workerUrl, error: qstashMsg });
        await admin
          .from("reel_variation_jobs")
          .update({
            status: "failed",
            error_message: `Error al enviar al worker: ${qstashMsg}`,
          })
          .eq("id", jobId);
        return { ok: false, errorCode: "QSTASH_FAILED", message: `Error al enviar al worker: ${qstashMsg}` };
      }
    } else {
      // Sin QStash en dev: marcar como fallido con mensaje amigable
      console.warn("[TrialReels] QSTASH_TOKEN no configurado — job marcado como failed", { jobId });
      await admin
        .from("reel_variation_jobs")
        .update({
          status: "failed",
          error_message: "QStash no está configurado (modo desarrollo)",
        })
        .eq("id", jobId);
    }

    revalidatePath(paths.platform.marketing.content);

    return { ok: true, jobId };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error desconocido";
    console.error("[TrialReels] createTrialReelsJobAction error", { message });
    return { ok: false, errorCode: "UNKNOWN", message };
  }
}

function getReelWorkerUrl(): string {
  const fromEnv = process.env.REEL_WORKER_URL?.trim();
  if (fromEnv) return fromEnv;
  // Fallback: endpoint en la propia app Next.js (útil en dev sin Fly.io)
  return `${getPublicAppUrl()}/api/queue/process-reel-variations`;
}

// ─── Leer job ─────────────────────────────────────────────────────────────────

export async function getReelVariationJobAction(
  jobId: string
): Promise<ReelVariationJob | null> {
  const organizationId = await requireOrgId();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("reel_variation_jobs")
    .select("*")
    .eq("id", jobId)
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data as ReelVariationJob | null;
}

export async function listReelVariationJobsForPieceAction(
  contentPieceId: string
): Promise<ReelVariationJob[]> {
  const organizationId = await requireOrgId();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("reel_variation_jobs")
    .select("*")
    .eq("source_piece_id", contentPieceId)
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false })
    .limit(5);

  if (error) throw new Error(error.message);
  return (data ?? []) as ReelVariationJob[];
}

// ─── Editar variante ──────────────────────────────────────────────────────────

export async function updateReelVariationAction(
  jobId: string,
  variationIndex: number,
  patch: Partial<Pick<ReelVariation, "description" | "hashtags" | "included">>
): Promise<void> {
  const organizationId = await requireOrgId();
  const supabase = await createClient();

  // Leer variantes actuales
  const { data: job, error: readErr } = await supabase
    .from("reel_variation_jobs")
    .select("variations")
    .eq("id", jobId)
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (readErr) throw new Error(readErr.message);
  if (!job) throw new Error("Job no encontrado");

  const variations = (job.variations ?? []) as ReelVariation[];
  if (variationIndex < 0 || variationIndex >= variations.length) {
    throw new Error("Índice de variante inválido");
  }

  variations[variationIndex] = { ...variations[variationIndex], ...patch };

  const { error: updateErr } = await supabase
    .from("reel_variation_jobs")
    .update({ variations })
    .eq("id", jobId)
    .eq("organization_id", organizationId);

  if (updateErr) throw new Error(updateErr.message);
}

export async function setReelVariationDelayAction(
  jobId: string,
  delayHours: number
): Promise<void> {
  const organizationId = await requireOrgId();
  const supabase = await createClient();

  const { error } = await supabase
    .from("reel_variation_jobs")
    .update({ delay_hours: delayHours })
    .eq("id", jobId)
    .eq("organization_id", organizationId)
    .eq("status", "preview_ready"); // Solo si aún no se publicó

  if (error) throw new Error(error.message);
}

// ─── Publicar variantes ───────────────────────────────────────────────────────

export type PublishVariationsResult =
  | { ok: true; published: number; skipped: number }
  | { ok: false; message: string };

export async function publishVariationsAction(
  jobId: string
): Promise<PublishVariationsResult> {
  try {
    const organizationId = await requireOrgId();
    const admin = createAdminClient();

    // 1. Leer job con admin (necesitamos leer para actualizar estado)
    const { data: job, error: jobErr } = await admin
      .from("reel_variation_jobs")
      .select("*")
      .eq("id", jobId)
      .eq("organization_id", organizationId)
      .maybeSingle();

    if (jobErr) throw new Error(jobErr.message);
    if (!job) throw new Error("Job no encontrado");
    if (job.status !== "preview_ready") {
      return {
        ok: false,
        message: `El job está en estado '${job.status}', esperado 'preview_ready'`,
      };
    }

    // 2. Obtener cliente Zernio de la org
    const { getZernioClientForOrganization } = await import(
      "@/lib/zernio/integration"
    );
    let zernioClient;
    try {
      zernioClient = await getZernioClientForOrganization(organizationId);
    } catch {
      return {
        ok: false,
        message: "Zernio no está conectado. Configuralo en Integraciones.",
      };
    }

    // 3. Marcar como publicando
    await admin
      .from("reel_variation_jobs")
      .update({ status: "publishing" })
      .eq("id", jobId);

    const variations = (job.variations ?? []) as ReelVariation[];
    const delayMs = (job.delay_hours as number) * 60 * 60 * 1000;

    let published = 0;
    let skipped = 0;
    const updatedVariations = [...variations];

    for (let i = 0; i < variations.length; i++) {
      const variation = variations[i];

      if (!variation.included || variation.status === "published") {
        skipped++;
        continue;
      }

      // Obtener URL firmada del video
      const { data: signedData } = await admin.storage
        .from(STORAGE_BUCKET)
        .createSignedUrl(variation.storage_path, 3600); // 1h para que Zernio pueda descargarlo

      if (!signedData?.signedUrl) {
        updatedVariations[i] = {
          ...variation,
          status: "failed",
          error: "No se pudo generar URL firmada para el video",
        };
        continue;
      }

      // Delay entre publicaciones (excepto la primera)
      if (published > 0 && delayMs > 0) {
        await new Promise((r) => setTimeout(r, Math.min(delayMs, 30_000)));
        // En producción el delay real se maneja con un schedule de QStash
        // Por ahora usamos 30s max para no bloquear el servidor indefinidamente
      }

      try {
        // Publicar vía Zernio — creamos el post con el caption completo.
        // La URL firmada del video se incluye en el content para que Zernio
        // pueda procesarla al momento de publicar en Instagram.
        const caption =
          variation.description +
          (variation.hashtags?.length ? `\n\n${variation.hashtags.join(" ")}` : "");

        // Obtener profileId e instagramAccountId de la integración
        const { getZernioIntegrationForOrg } = await import("@/lib/zernio/integration");
        const integration = await getZernioIntegrationForOrg(organizationId);
        const igAccount = integration?.connected_accounts?.find(
          (a) => a.platform === "instagram"
        );

        const result = await zernioClient.createPost({
          profileId: integration?.zernio_profile_id ?? "",
          platform: "instagram",
          postType: "reel",
          status: "draft", // draft para que el usuario confirme antes de publicar
          content: caption,
          ...(igAccount ? { accountId: igAccount.accountId } : {}),
        });

        updatedVariations[i] = {
          ...variation,
          status: "published",
          zernio_post_id: (result as { id?: string; _id?: string })?.id
            ?? (result as { id?: string; _id?: string })?._id
            ?? null,
          published_at: new Date().toISOString(),
          error: null,
        };
        published++;
      } catch (publishErr) {
        const msg =
          publishErr instanceof Error ? publishErr.message : "Error al publicar";
        updatedVariations[i] = {
          ...variation,
          status: "failed",
          error: msg,
        };
        console.error("[TrialReels] publish variation failed", {
          jobId,
          index: i,
          type: variation.type,
          error: msg,
        });
      }
    }

    // 4. Actualizar variantes y estado final
    const allDone = updatedVariations
      .filter((v) => v.included)
      .every((v) => v.status === "published" || v.status === "failed");

    await admin
      .from("reel_variation_jobs")
      .update({
        variations: updatedVariations,
        status: allDone ? "done" : "publishing",
      })
      .eq("id", jobId);

    revalidatePath(paths.platform.marketing.content);

    return { ok: true, published, skipped };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error desconocido";
    console.error("[TrialReels] publishVariationsAction error", { jobId, message });
    return { ok: false, message };
  }
}

// ─── Regenerar URL firmadas de preview ────────────────────────────────────────

/**
 * Renueva las signed URLs de preview para todas las variantes de un job.
 * Llamar cuando el usuario abre el panel de preview (las URLs expiran en 1h).
 */
export async function refreshVariationPreviewUrlsAction(
  jobId: string
): Promise<ReelVariationJob | null> {
  const organizationId = await requireOrgId();
  const admin = createAdminClient();

  const { data: job, error } = await admin
    .from("reel_variation_jobs")
    .select("*")
    .eq("id", jobId)
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!job) return null;

  const variations = (job.variations ?? []) as ReelVariation[];
  let changed = false;

  const updated = await Promise.all(
    variations.map(async (v) => {
      if (!v.storage_path) return v;
      const { data } = await admin.storage
        .from(STORAGE_BUCKET)
        .createSignedUrl(v.storage_path, 3600);
      if (data?.signedUrl && data.signedUrl !== v.preview_url) {
        changed = true;
        return { ...v, preview_url: data.signedUrl };
      }
      return v;
    })
  );

  if (changed) {
    await admin
      .from("reel_variation_jobs")
      .update({ variations: updated })
      .eq("id", jobId);
  }

  return { ...job, variations: updated } as ReelVariationJob;
}
