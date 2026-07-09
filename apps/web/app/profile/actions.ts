"use server";

import { revalidatePath } from "next/cache";
import { ensureCurrentUserBootstrap } from "@/lib/auth/bootstrap";
import { requireAuthContext } from "@/lib/auth/require-auth";
import {
  PROFILE_AVATAR_MAX_BYTES,
  PROFILE_AVATAR_MIME_TYPES,
  PROFILE_AVATARS_BUCKET,
} from "@/lib/profile/constants";
import {
  runMutation,
  type MutationResult,
} from "@/lib/server/action-result";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { paths } from "@/routes";

export type ProfileAreaData = {
  avatarUrl: string | null;
  userName: string;
  orgName: string;
};

export type UpdateProfileResult = {
  avatarUrl: string | null;
  fullName: string;
  email: string;
};

function extensionForMime(mime: string): string {
  switch (mime) {
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "image/gif":
      return "gif";
    default:
      return "jpg";
  }
}

async function uploadProfileAvatar(params: {
  supabase: Awaited<ReturnType<typeof createClient>>;
  organizationId: string;
  userId: string;
  file: File;
}): Promise<string> {
  if (!PROFILE_AVATAR_MIME_TYPES.includes(params.file.type as (typeof PROFILE_AVATAR_MIME_TYPES)[number])) {
    throw new Error("Formato no válido. Usá PNG, JPG, WEBP o GIF.");
  }
  if (params.file.size > PROFILE_AVATAR_MAX_BYTES) {
    throw new Error("La imagen no puede superar 5 MB.");
  }

  const ext = extensionForMime(params.file.type);
  const storagePath = `${params.organizationId}/${params.userId}.${ext}`;
  const buffer = Buffer.from(await params.file.arrayBuffer());

  const { error: uploadError } = await params.supabase.storage
    .from(PROFILE_AVATARS_BUCKET)
    .upload(storagePath, buffer, {
      upsert: true,
      contentType: params.file.type,
      cacheControl: "3600",
    });

  if (uploadError) {
    throw new Error(
      uploadError.message.includes("Bucket not found")
        ? `No se pudo subir la foto. ¿Existe el bucket "${PROFILE_AVATARS_BUCKET}"?`
        : uploadError.message
    );
  }

  const { data } = params.supabase.storage
    .from(PROFILE_AVATARS_BUCKET)
    .getPublicUrl(storagePath);

  const publicUrl = data.publicUrl;
  if (!publicUrl) {
    throw new Error("No se pudo obtener la URL pública del avatar.");
  }

  return `${publicUrl}?t=${Date.now()}`;
}

export async function updateProfileAction(
  formData: FormData
): Promise<MutationResult<UpdateProfileResult>> {
  return runMutation(async () => {
    if (!isSupabaseConfigured()) {
      throw new Error("Supabase no configurado.");
    }

    const fullName = String(formData.get("fullName") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim().toLowerCase();
    const avatarFile = formData.get("avatar");

    if (!fullName) {
      throw new Error("El nombre para mostrar es obligatorio.");
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error("Ingresá un correo electrónico válido.");
    }

    const { user, orgId, supabase } = await requireAuthContext();

    let avatarUrl: string | null | undefined;
    if (avatarFile instanceof File && avatarFile.size > 0) {
      avatarUrl = await uploadProfileAvatar({
        supabase,
        organizationId: orgId,
        userId: user.id,
        file: avatarFile,
      });
    }

    if (email !== user.email?.toLowerCase()) {
      const { error: authError } = await supabase.auth.updateUser({ email });
      if (authError) {
        throw new Error(authError.message);
      }
    }

    const profilePatch: Record<string, string> = {
      full_name: fullName,
      email,
    };
    if (avatarUrl) {
      profilePatch.avatar_url = avatarUrl;
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .update(profilePatch)
      .eq("id", user.id)
      .select("full_name, email, avatar_url")
      .single();

    if (profileError || !profile) {
      throw new Error(profileError?.message ?? "No se pudo actualizar el perfil.");
    }

    revalidatePath(paths.platform.settings);

    return {
      avatarUrl: (profile.avatar_url as string | null) ?? null,
      fullName: (profile.full_name as string | null)?.trim() || fullName,
      email: (profile.email as string | null)?.trim() || email,
    };
  });
}

export async function getProfileAreaDataAction(): Promise<ProfileAreaData | null> {
  if (!isSupabaseConfigured()) {
    return {
      avatarUrl: null,
      userName: "Usuario",
      orgName: "Mi organización",
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const selectWithAvatar = () =>
    supabase
      .from("profiles")
      .select("full_name, email, organization_id, avatar_url")
      .eq("id", user.id)
      .maybeSingle();

  const selectWithoutAvatar = () =>
    supabase
      .from("profiles")
      .select("full_name, email, organization_id")
      .eq("id", user.id)
      .maybeSingle();

  async function loadProfile() {
    const { data, error } = await selectWithAvatar();
    if (error?.message?.includes("avatar_url")) {
      const fallback = await selectWithoutAvatar();
      return fallback.data;
    }
    return data;
  }

  let profile = await loadProfile();

  if (!profile) {
    await ensureCurrentUserBootstrap();
    profile = await loadProfile();
  }

  if (!profile?.organization_id) return null;

  const { data: org } = await supabase
    .from("organizations")
    .select("name")
    .eq("id", profile.organization_id)
    .maybeSingle();

  const meta = user.user_metadata ?? {};
  const profileAvatar =
    "avatar_url" in profile && typeof profile.avatar_url === "string"
      ? profile.avatar_url
      : null;
  const avatarUrl =
    profileAvatar ??
    (typeof meta.avatar_url === "string" ? meta.avatar_url : null) ??
    (typeof meta.picture === "string" ? meta.picture : null);

  const userName =
    profile.full_name?.trim() ||
    profile.email?.trim() ||
    user.email?.split("@")[0] ||
    "Usuario";

  return {
    avatarUrl,
    userName,
    orgName: org?.name?.trim() || "Mi organización",
  };
}
