"use server";

import { revalidatePath } from "next/cache";
import { isAllowedBrainFile } from "@/lib/ai-brain/file-types";
import { AI_BRAIN_BUCKET, uiContentTypeToDb } from "@/lib/ai-brain/mapper";
import { requireSuperAdmin } from "@/lib/auth/require-super-admin";
import { isMissingTableError } from "@/lib/auth/bootstrap";
import { generateTempPassword } from "@/lib/auth/generate-temp-password";
import { tempPasswordProfileFields } from "@/lib/auth/temp-password-expiry";
import { regenerateUserTempPassword } from "@/lib/auth/regenerate-temp-password";
import type { TempCredentials } from "@/lib/auth/temp-credentials";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  actionErrorMessage,
  runMutation,
  type MutationResult,
} from "@/lib/server/action-result";
import {
  addOrganizationNoteSchema,
  archiveAiBrainDocumentSchema,
  createAiBrainDocumentSchema,
  createFounderAccountSchema,
  createHoldingOrgSchema,
  createOrganizationFromHoldingSchema,
  deactivateUserSchema,
  deleteAiBrainDocumentSchema,
  firstZodError,
  getAiBrainSignedUrlSchema,
  prepareAiBrainFileUploadSchema,
  regenerateTempPasswordSchema,
  setOrganizationStatusSchema,
  updateOrganizationMrrSchema,
} from "@/lib/validations";
import type { z } from "zod";
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
  paths.superAdmin.holding,
];

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

async function requireSuperAdminAndParse<T extends z.ZodTypeAny>(
  schema: T,
  input: unknown
): Promise<
  | { success: true; data: z.infer<T> }
  | { success: false; error: string }
> {
  try {
    await requireSuperAdmin();
  } catch (error) {
    return { success: false, error: actionErrorMessage(error) };
  }

  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: firstZodError(parsed.error) };
  }

  return { success: true, data: parsed.data };
}

export async function createFounderAccountAction(
  input: unknown
): Promise<MutationResult<CreateFounderResult>> {
  const auth = await requireSuperAdminAndParse(createFounderAccountSchema, input);
  if (!auth.success) {
    return { success: false, error: auth.error };
  }

  const { organizationName, founderName, email } = auth.data;

  return runMutation(async () => {
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
      .insert({ name: organizationName, status: "active" })
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
      ...tempPasswordProfileFields(),
    });

    if (profileError) {
      await admin.from("organizations").delete().eq("id", org.id);
      await admin.auth.admin.deleteUser(userId);
      throw new Error(profileError.message);
    }

    revalidateSuperAdmin();

    return {
      organizationId: org.id,
      organizationName,
      email,
      password,
      emailSent: false,
      tempCredentials: { email, tempPassword: password },
    };
  });
}

export async function createOrganizationFromHoldingAction(
  input: unknown
): Promise<MutationResult<{ orgId: string; tempCredentials: TempCredentials }>> {
  const auth = await requireSuperAdminAndParse(
    createOrganizationFromHoldingSchema,
    input
  );
  if (!auth.success) {
    return { success: false, error: auth.error };
  }

  const { name: organizationName, founderEmail: email, plan } = auth.data;

  return runMutation(async () => {
    const admin = createAdminClient();
    const password = generateTempPassword();
    const mrrUsd = plan === "pro" ? 30000 : 0;

    const { data: org, error: orgError } = await admin
      .from("organizations")
      .insert({ name: organizationName, status: "active", mrr_usd: mrrUsd })
      .select("id")
      .single();

    if (orgError || !org) {
      throw new Error(orgError?.message ?? "Error creando organización");
    }

    const { data: authData, error: authError } =
      await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: "Founder" },
      });

    if (authError || !authData.user) {
      await admin.from("organizations").delete().eq("id", org.id);
      throw new Error(authError?.message ?? "Error creando usuario");
    }

    const userId = authData.user.id;

    const { error: profileError } = await admin.from("profiles").insert({
      id: userId,
      organization_id: org.id,
      email,
      full_name: "Founder",
      role: "founder",
      ...tempPasswordProfileFields(),
    });

    if (profileError) {
      await admin.from("organizations").delete().eq("id", org.id);
      await admin.auth.admin.deleteUser(userId);
      throw new Error(profileError.message);
    }

    const holdingRes = await admin
      .from("holdings")
      .select("id")
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (holdingRes.data?.id) {
      const linkRes = await admin.from("holding_organizations").upsert(
        {
          holding_id: holdingRes.data.id,
          organization_id: org.id,
        },
        { onConflict: "holding_id,organization_id" }
      );

      if (
        linkRes.error &&
        !isMissingTableError(linkRes.error.message)
      ) {
        console.error(
          "[createOrganizationFromHoldingAction] link",
          linkRes.error.message
        );
      }
    }

    revalidateSuperAdmin();

    return {
      orgId: org.id,
      tempCredentials: { email, tempPassword: password },
    };
  });
}

export async function setOrganizationStatusAction(
  organizationId: string,
  active: boolean
): Promise<MutationResult> {
  const auth = await requireSuperAdminAndParse(setOrganizationStatusSchema, {
    organizationId,
    active,
  });
  if (!auth.success) {
    return { success: false, error: auth.error };
  }

  const { organizationId: orgId, active: isActive } = auth.data;

  return runMutation(async () => {
    const admin = createAdminClient();
    const { error } = await admin
      .from("organizations")
      .update({ status: isActive ? "active" : "paused" })
      .eq("id", orgId);

    if (error) throw new Error(error.message);
    revalidateSuperAdmin();
    revalidatePath(`${paths.superAdmin.organizations}/${orgId}`);
  });
}

export async function updateOrganizationMrrAction(
  organizationId: string,
  mrrUsd: number
): Promise<MutationResult> {
  const auth = await requireSuperAdminAndParse(updateOrganizationMrrSchema, {
    organizationId,
    mrrUsd,
  });
  if (!auth.success) {
    return { success: false, error: auth.error };
  }

  const { organizationId: orgId, mrrUsd: validatedMrr } = auth.data;

  return runMutation(async () => {
    const admin = createAdminClient();
    const { error } = await admin
      .from("organizations")
      .update({ mrr_usd: validatedMrr })
      .eq("id", orgId);

    if (error) throw new Error(error.message);
    revalidateSuperAdmin();
    revalidatePath(`${paths.superAdmin.organizations}/${orgId}`);
  });
}

export async function addOrganizationNoteAction(
  organizationId: string,
  note: string,
  createdBy = "Super Admin"
): Promise<MutationResult> {
  const auth = await requireSuperAdminAndParse(addOrganizationNoteSchema, {
    organizationId,
    note,
    createdBy,
  });
  if (!auth.success) {
    return { success: false, error: auth.error };
  }

  const {
    organizationId: orgId,
    note: text,
    createdBy: author,
  } = auth.data;

  return runMutation(async () => {
    const admin = createAdminClient();
    const { error } = await admin.from("organization_notes").insert({
      organization_id: orgId,
      note: text,
      created_by: author ?? "Super Admin",
    });

    if (error) throw new Error(error.message);
    revalidatePath(`${paths.superAdmin.organizations}/${orgId}`);
  });
}

export async function deactivateUserAction(
  userId: string
): Promise<MutationResult> {
  const auth = await requireSuperAdminAndParse(deactivateUserSchema, { userId });
  if (!auth.success) {
    return { success: false, error: auth.error };
  }

  return runMutation(async () => {
    const admin = createAdminClient();
    const { error } = await admin.auth.admin.updateUserById(auth.data.userId, {
      ban_duration: "876000h",
    });
    if (error) throw new Error(error.message);
    revalidatePath(paths.superAdmin.users);
  });
}

export async function prepareAiBrainFileUploadAction(
  input: unknown
): Promise<
  MutationResult<{
    storagePath: string;
    signedUrl: string;
    contentType: string;
  }>
> {
  const auth = await requireSuperAdminAndParse(
    prepareAiBrainFileUploadSchema,
    input
  );
  if (!auth.success) {
    return { success: false, error: auth.error };
  }

  const { fileName, fileSize, mimeType } = auth.data;

  return runMutation(async () => {
    const allowed = isAllowedBrainFile(fileName, mimeType, fileSize);
    if (!allowed.ok) throw new Error(allowed.error);

    const docId = crypto.randomUUID();
    const safeName = sanitizeFilename(fileName);
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
  input: unknown
): Promise<MutationResult<{ id: string }>> {
  const auth = await requireSuperAdminAndParse(createAiBrainDocumentSchema, input);
  if (!auth.success) {
    return { success: false, error: auth.error };
  }

  const data = auth.data;

  return runMutation(async () => {
    const admin = createAdminClient();
    const tags = data.tags
      ? data.tags.split(",").map((t) => t.trim()).filter(Boolean)
      : [];
    const coverage_areas = data.coverageAreas
      ? data.coverageAreas.split(",").map((t) => t.trim()).filter(Boolean)
      : [];
    const uploadedBy = data.uploadedBy?.trim() || "Super Admin";
    const miroUrl = data.miroUrl?.trim() ?? "";

    let file_url: string | null = null;
    let file_name: string | null = null;
    let file_size_bytes: number | null = null;
    let source_url: string | null = null;
    let dbContentType = uiContentTypeToDb(data.contentType);

    if (miroUrl) {
      source_url = miroUrl;
      dbContentType = "miro_board";
    } else if (data.storagePath && data.fileName) {
      file_url = data.storagePath;
      file_name = data.fileName;
      file_size_bytes = data.fileSizeBytes ?? null;
      const mime = data.fileMimeType ?? "";
      if (mime.startsWith("image/")) {
        dbContentType = "image";
      }
    }

    const { data: row, error } = await admin
      .from("ai_brain_documents")
      .insert({
        title: data.title,
        category: data.category.trim() || "general",
        content_type: dbContentType,
        file_url,
        file_name,
        file_size_bytes,
        source_url,
        description: data.description?.trim() || null,
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
    return { id: row.id };
  });
}

export async function archiveAiBrainDocumentAction(
  id: string
): Promise<MutationResult> {
  const auth = await requireSuperAdminAndParse(archiveAiBrainDocumentSchema, {
    id,
  });
  if (!auth.success) {
    return { success: false, error: auth.error };
  }

  const documentId = auth.data.id;

  return runMutation(async () => {
    const admin = createAdminClient();
    const { error } = await admin
      .from("ai_brain_documents")
      .update({ status: "archived", updated_at: new Date().toISOString() })
      .eq("id", documentId);

    if (error) throw new Error(error.message);
    revalidatePath(paths.superAdmin.aiBrain.root);
    revalidatePath(paths.superAdmin.aiBrain.library);
    revalidatePath(paths.superAdmin.aiBrain.document(documentId));
  });
}

export async function deleteAiBrainDocumentAction(
  id: string
): Promise<MutationResult> {
  const auth = await requireSuperAdminAndParse(deleteAiBrainDocumentSchema, {
    id,
  });
  if (!auth.success) {
    return { success: false, error: auth.error };
  }

  const documentId = auth.data.id;

  return runMutation(async () => {
    const admin = createAdminClient();
    const { data: row } = await admin
      .from("ai_brain_documents")
      .select("file_url")
      .eq("id", documentId)
      .maybeSingle();

    if (row?.file_url) {
      await admin.storage.from(AI_BRAIN_BUCKET).remove([row.file_url]);
    }

    const { error } = await admin
      .from("ai_brain_documents")
      .delete()
      .eq("id", documentId);

    if (error) throw new Error(error.message);
    revalidatePath(paths.superAdmin.aiBrain.root);
    revalidatePath(paths.superAdmin.aiBrain.library);
  });
}

export async function getAiBrainSignedUrlAction(
  storagePath: string
): Promise<MutationResult<{ url: string }>> {
  const auth = await requireSuperAdminAndParse(getAiBrainSignedUrlSchema, {
    storagePath,
  });
  if (!auth.success) {
    return { success: false, error: auth.error };
  }

  return runMutation(async () => {
    const admin = createAdminClient();
    const path = auth.data.storagePath.replace(/^ai-brain-documents\//, "");
    const { data, error } = await admin.storage
      .from(AI_BRAIN_BUCKET)
      .createSignedUrl(path, 3600);

    if (error || !data?.signedUrl) {
      throw new Error(error?.message ?? "No se pudo generar el enlace");
    }
    return { url: data.signedUrl };
  });
}

export async function createHoldingOrgAction(
  input: unknown
): Promise<MutationResult<{ orgId: string; tempCredentials: TempCredentials }>> {
  const auth = await requireSuperAdminAndParse(createHoldingOrgSchema, input);
  if (!auth.success) {
    return { success: false, error: auth.error };
  }

  const { name: organizationName, founderEmail: email } = auth.data;

  return runMutation(async () => {
    const admin = createAdminClient();
    const password = generateTempPassword();

    const { data: authData, error: authError } =
      await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: "Holding Admin" },
      });

    if (authError || !authData.user) {
      throw new Error(authError?.message ?? "Error creando usuario");
    }

    const userId = authData.user.id;

    const { data: org, error: orgError } = await admin
      .from("organizations")
      .insert({
        name: organizationName,
        status: "active",
        account_type: "holding",
      })
      .select("id")
      .single();

    if (orgError || !org) {
      await admin.auth.admin.deleteUser(userId);
      throw new Error(orgError?.message ?? "Error creando holding");
    }

    const { error: profileError } = await admin.from("profiles").insert({
      id: userId,
      organization_id: org.id,
      email,
      full_name: "Holding Admin",
      role: "founder",
      is_holding_admin: true,
      ...tempPasswordProfileFields(),
    });

    if (profileError) {
      await admin.from("organizations").delete().eq("id", org.id);
      await admin.auth.admin.deleteUser(userId);
      throw new Error(profileError.message);
    }

    revalidateSuperAdmin();
    revalidatePath(paths.superAdmin.organizations);

    return {
      orgId: org.id,
      tempCredentials: { email, tempPassword: password },
    };
  });
}

export async function regenerateTempPasswordAction(
  userId: string
): Promise<MutationResult<TempCredentials>> {
  const auth = await requireSuperAdminAndParse(regenerateTempPasswordSchema, {
    userId,
  });
  if (!auth.success) {
    return { success: false, error: auth.error };
  }

  return runMutation(async () => {
    const credentials = await regenerateUserTempPassword(auth.data.userId);
    revalidateSuperAdmin();
    return credentials;
  });
}
