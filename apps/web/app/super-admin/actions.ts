"use server";

import { revalidatePath } from "next/cache";
import { isAllowedBrainFile } from "@/lib/ai-brain/file-types";
import { AI_BRAIN_BUCKET, uiContentTypeToDb } from "@/lib/ai-brain/mapper";
import { requireSuperAdmin } from "@/lib/auth/require-super-admin";
import { sendWelcomeEmail } from "@/lib/email";
import { createAdminClient } from "@/lib/supabase/admin";
import { runMutation, type MutationResult } from "@/lib/server/action-result";
import type { BrainContentType } from "@/types/ai-brain";
import type { CreateFounderResult } from "@/types/super-admin";
import { paths } from "@/routes";
import { loadOrgHealthScores } from "@/lib/super-admin/org-health";
import {
  loadAICostsSummary,
  loadAdminUsers,
  loadOrganizationDetail,
  loadOrganizationsList,
} from "@/lib/super-admin/queries";

export async function getOrganizationDetailAction(
  ...args: Parameters<typeof loadOrganizationDetail>
) {
  return loadOrganizationDetail(...args);
}

export async function getAllUsersAction(
  ...args: Parameters<typeof loadAdminUsers>
) {
  return loadAdminUsers(...args);
}

export async function getAICostsAction(
  ...args: Parameters<typeof loadAICostsSummary>
) {
  return loadAICostsSummary(...args);
}

export async function getClientHealthAction(
  ...args: Parameters<typeof loadOrgHealthScores>
) {
  return loadOrgHealthScores(...args);
}

const REVALIDATE_ORGS = [
  paths.superAdmin.organizations,
  paths.superAdmin.costs,
  paths.superAdmin.users,
];

function generateTempPassword(length = 12): string {
  const chars =
    "abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$";
  let out = "";
  for (let i = 0; i < length; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120);
}

function revalidateSuperAdmin() {
  for (const p of REVALIDATE_ORGS) {
    revalidatePath(p);
  }
  revalidatePath(paths.superAdmin.infrastructure);
  revalidatePath(paths.superAdmin.aiBrain.root);
  revalidatePath(paths.superAdmin.aiBrain.library);
}

export async function createFounderAccountAction(input: {
  organizationName: string;
  founderName: string;
  email: string;
}): Promise<MutationResult<CreateFounderResult>> {
  return runMutation(async () => {
    await requireSuperAdmin();

    const orgName = input.organizationName.trim();
    const founderName = input.founderName.trim();
    const email = input.email.trim().toLowerCase();

    if (!orgName || !founderName || !email) {
      throw new Error("Completá todos los campos obligatorios.");
    }

    const admin = createAdminClient();
    const password = generateTempPassword();

    const { data: authData, error: authError } =
      await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: founderName },
      });

    if (authError || !authData.user) {
      throw new Error(authError?.message ?? "No se pudo crear el usuario");
    }

    const userId = authData.user.id;

    const { data: org, error: orgError } = await admin
      .from("organizations")
      .insert({ name: orgName, status: "active" })
      .select("id")
      .single();

    if (orgError || !org) {
      await admin.auth.admin.deleteUser(userId);
      throw new Error(orgError?.message ?? "No se pudo crear la organización");
    }

    const { error: profileError } = await admin.from("profiles").insert({
      id: userId,
      organization_id: org.id,
      email,
      full_name: founderName,
      role: "founder",
    });

    if (profileError) {
      await admin.from("organizations").delete().eq("id", org.id);
      await admin.auth.admin.deleteUser(userId);
      throw new Error(profileError.message);
    }

    const emailResult = await sendWelcomeEmail({
      to: email,
      name: founderName,
      email,
      password,
    });

    revalidateSuperAdmin();

    return {
      organizationId: org.id,
      organizationName: orgName,
      email,
      password,
      emailSent: emailResult.ok,
      emailError: emailResult.error,
    };
  });
}

export async function setOrganizationStatusAction(
  organizationId: string,
  active: boolean
): Promise<MutationResult> {
  return runMutation(async () => {
    await requireSuperAdmin();

    const admin = createAdminClient();
    const { error } = await admin
      .from("organizations")
      .update({ status: active ? "active" : "paused" })
      .eq("id", organizationId);

    if (error) throw new Error(error.message);
    revalidateSuperAdmin();
    revalidatePath(`${paths.superAdmin.organizations}/${organizationId}`);
  });
}

export async function updateOrganizationMrrAction(
  organizationId: string,
  mrrUsd: number
): Promise<MutationResult> {
  return runMutation(async () => {
    await requireSuperAdmin();

    const admin = createAdminClient();
    const { error } = await admin
      .from("organizations")
      .update({ mrr_usd: Math.max(0, mrrUsd) })
      .eq("id", organizationId);

    if (error) throw new Error(error.message);
    revalidateSuperAdmin();
    revalidatePath(`${paths.superAdmin.organizations}/${organizationId}`);
  });
}

export async function addOrganizationNoteAction(
  organizationId: string,
  note: string,
  createdBy = "Super Admin"
): Promise<MutationResult> {
  return runMutation(async () => {
    await requireSuperAdmin();

    const text = note.trim();
    if (!text) throw new Error("La nota no puede estar vacía.");

    const admin = createAdminClient();
    const { error } = await admin.from("organization_notes").insert({
      organization_id: organizationId,
      note: text,
      created_by: createdBy,
    });

    if (error) throw new Error(error.message);
    revalidatePath(`${paths.superAdmin.organizations}/${organizationId}`);
  });
}

export async function deactivateUserAction(
  userId: string
): Promise<MutationResult> {
  return runMutation(async () => {
    await requireSuperAdmin();

    const admin = createAdminClient();
    const { error } = await admin.auth.admin.updateUserById(userId, {
      ban_duration: "876000h",
    });
    if (error) throw new Error(error.message);
    revalidatePath(paths.superAdmin.users);
  });
}

/** URL firmada para subir el archivo directo a Storage (evita límite 413 en Vercel). */
export async function prepareAiBrainFileUploadAction(input: {
  fileName: string;
  fileSize: number;
  mimeType?: string;
}): Promise<
  MutationResult<{
    storagePath: string;
    signedUrl: string;
    contentType: string;
  }>
> {
  return runMutation(async () => {
    await requireSuperAdmin();

    const allowed = isAllowedBrainFile(
      input.fileName,
      input.mimeType,
      input.fileSize
    );
    if (!allowed.ok) throw new Error(allowed.error);

    const docId = crypto.randomUUID();
    const safeName = sanitizeFilename(input.fileName);
    const storagePath = `${docId}-${safeName}`;

    const admin = createAdminClient();
    const { data, error } = await admin.storage
      .from(AI_BRAIN_BUCKET)
      .createSignedUploadUrl(storagePath);

    if (error || !data?.signedUrl) {
      throw new Error(
        error?.message ??
          `No se pudo preparar la subida. ¿Existe el bucket "${AI_BRAIN_BUCKET}"?`
      );
    }

    return {
      storagePath,
      signedUrl: data.signedUrl,
      contentType: allowed.mimeType,
    };
  });
}

export type CreateAiBrainDocumentInput = {
  title: string;
  contentType: BrainContentType;
  category: string;
  description?: string;
  tags?: string;
  coverageAreas?: string;
  uploadedBy?: string;
  miroUrl?: string;
  storagePath?: string;
  fileName?: string;
  fileSizeBytes?: number;
  fileMimeType?: string;
};

export async function createAiBrainDocumentAction(
  input: CreateAiBrainDocumentInput
): Promise<MutationResult<{ id: string }>> {
  return runMutation(async () => {
    await requireSuperAdmin();

    const title = input.title.trim();
    if (!title) throw new Error("El título es obligatorio.");

    const admin = createAdminClient();
    const tags = input.tags
      ? input.tags.split(",").map((t) => t.trim()).filter(Boolean)
      : [];
    const coverage_areas = input.coverageAreas
      ? input.coverageAreas.split(",").map((t) => t.trim()).filter(Boolean)
      : [];
    const uploadedBy = input.uploadedBy?.trim() || "Super Admin";
    const miroUrl = input.miroUrl?.trim() ?? "";

    let file_url: string | null = null;
    let file_name: string | null = null;
    let file_size_bytes: number | null = null;
    let source_url: string | null = null;
    let dbContentType = uiContentTypeToDb(input.contentType);

    if (miroUrl) {
      source_url = miroUrl;
      dbContentType = "miro_board";
    } else if (input.storagePath && input.fileName) {
      file_url = input.storagePath;
      file_name = input.fileName;
      file_size_bytes = input.fileSizeBytes ?? null;
      const mime = input.fileMimeType ?? "";
      if (mime.startsWith("image/")) {
        dbContentType = "image";
      }
    } else if (!miroUrl) {
      throw new Error("Subí un archivo o ingresá la URL de un tablero Miro.");
    }

    const { data, error } = await admin
      .from("ai_brain_documents")
      .insert({
        title,
        category: input.category.trim() || "general",
        content_type: dbContentType,
        file_url,
        file_name,
        file_size_bytes,
        source_url,
        description: input.description?.trim() || null,
        tags,
        coverage_areas,
        status: "pending_indexing",
        uploaded_by: uploadedBy,
      })
      .select("id")
      .single();

    if (error) throw new Error(error.message);

    revalidatePath(paths.superAdmin.aiBrain.root);
    revalidatePath(paths.superAdmin.aiBrain.library);
    return { id: data.id };
  });
}

export async function archiveAiBrainDocumentAction(
  id: string
): Promise<MutationResult> {
  return runMutation(async () => {
    await requireSuperAdmin();

    const admin = createAdminClient();
    const { error } = await admin
      .from("ai_brain_documents")
      .update({ status: "archived", updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) throw new Error(error.message);
    revalidatePath(paths.superAdmin.aiBrain.root);
    revalidatePath(paths.superAdmin.aiBrain.library);
    revalidatePath(paths.superAdmin.aiBrain.document(id));
  });
}

export async function deleteAiBrainDocumentAction(
  id: string
): Promise<MutationResult> {
  return runMutation(async () => {
    await requireSuperAdmin();

    const admin = createAdminClient();
    const { data: row } = await admin
      .from("ai_brain_documents")
      .select("file_url")
      .eq("id", id)
      .maybeSingle();

    if (row?.file_url) {
      await admin.storage.from(AI_BRAIN_BUCKET).remove([row.file_url]);
    }

    const { error } = await admin
      .from("ai_brain_documents")
      .delete()
      .eq("id", id);

    if (error) throw new Error(error.message);
    revalidatePath(paths.superAdmin.aiBrain.root);
    revalidatePath(paths.superAdmin.aiBrain.library);
  });
}

export async function getAiBrainSignedUrlAction(
  storagePath: string
): Promise<MutationResult<{ url: string }>> {
  return runMutation(async () => {
    await requireSuperAdmin();

    const admin = createAdminClient();
    const path = storagePath.replace(/^ai-brain-documents\//, "");
    const { data, error } = await admin.storage
      .from(AI_BRAIN_BUCKET)
      .createSignedUrl(path, 3600);

    if (error || !data?.signedUrl) {
      throw new Error(error?.message ?? "No se pudo generar el enlace");
    }
    return { url: data.signedUrl };
  });
}
