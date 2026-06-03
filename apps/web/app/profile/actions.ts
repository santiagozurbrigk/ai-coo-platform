"use server";

import { ensureCurrentUserBootstrap } from "@/lib/auth/bootstrap";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export type ProfileAreaData = {
  avatarUrl: string | null;
  userName: string;
  orgName: string;
};

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
