"use server";

import { revalidatePath } from "next/cache";
import { AI_BRAIN_BUCKET, uiContentTypeToDb } from "@/lib/ai-brain/mapper";
import { sendWelcomeEmail } from "@/lib/email";
import { createAdminClient } from "@/lib/supabase/admin";
import { runMutation, type MutationResult } from "@/lib/server/action-result";
import type { BrainContentType } from "@/types/ai-brain";
import type { CreateFounderResult } from "@/types/super-admin";
import { paths } from "@/routes";

const REVALIDATE_ORGS = [
  paths.superAdmin.organizations,
  paths.superAdmin.profitability,
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
    const admin = createAdminClient();
    const { error } = await admin.auth.admin.updateUserById(userId, {
      ban_duration: "876000h",
    });
    if (error) throw new Error(error.message);
    revalidatePath(paths.superAdmin.users);
  });
}

export async function uploadAiBrainDocumentAction(
  formData: FormData
): Promise<MutationResult<{ id: string }>> {
  return runMutation(async () => {
    const title = String(formData.get("title") ?? "").trim();
    const contentType = String(
      formData.get("contentType") ?? "document"
    ) as BrainContentType;
    const category = String(formData.get("category") ?? "general").trim();
    const description = String(formData.get("description") ?? "").trim();
    const tagsRaw = String(formData.get("tags") ?? "");
    const coverageRaw = String(formData.get("coverageAreas") ?? "");
    const uploadedBy = String(formData.get("uploadedBy") ?? "Super Admin");
    const miroUrl = String(formData.get("miroUrl") ?? "").trim();
    const file = formData.get("file");

    if (!title) throw new Error("El título es obligatorio.");

    const admin = createAdminClient();
    const tags = tagsRaw
      ? tagsRaw.split(",").map((t) => t.trim()).filter(Boolean)
      : [];
    const coverage_areas = coverageRaw
      ? coverageRaw.split(",").map((t) => t.trim()).filter(Boolean)
      : [];

    let file_url: string | null = null;
    let file_name: string | null = null;
    let file_size_bytes: number | null = null;
    let source_url: string | null = null;
    let dbContentType = uiContentTypeToDb(contentType);

    if (miroUrl) {
      source_url = miroUrl;
      dbContentType = "miro_board";
    } else if (file instanceof File && file.size > 0) {
      const docId = crypto.randomUUID();
      const safeName = sanitizeFilename(file.name);
      const path = `${docId}-${safeName}`;
      const buffer = Buffer.from(await file.arrayBuffer());

      const { error: uploadError } = await admin.storage
        .from(AI_BRAIN_BUCKET)
        .upload(path, buffer, {
          contentType: file.type || "application/octet-stream",
          upsert: false,
        });

      if (uploadError) {
        throw new Error(
          `Error al subir archivo: ${uploadError.message}. ¿Existe el bucket "${AI_BRAIN_BUCKET}"?`
        );
      }

      file_url = path;
      file_name = file.name;
      file_size_bytes = file.size;

      if (file.type.startsWith("image/")) {
        dbContentType = "image";
      }
    } else if (!miroUrl) {
      throw new Error("Subí un archivo o ingresá la URL de un tablero Miro.");
    }

    const { data, error } = await admin
      .from("ai_brain_documents")
      .insert({
        title,
        category,
        content_type: dbContentType,
        file_url,
        file_name,
        file_size_bytes,
        source_url,
        description: description || null,
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
