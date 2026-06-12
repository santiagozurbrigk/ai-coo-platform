"use server";

import { revalidatePath } from "next/cache";
import { requireOrganizationId } from "@/lib/auth/bootstrap";
import { createClient } from "@/lib/supabase/server";
import { runMutation, type MutationResult } from "@/lib/server/action-result";
import { paths } from "@/routes";

export type OrganizationSettings = {
  name: string;
  website_url: string | null;
};

function normalizeWebsiteUrl(websiteUrl: string): string {
  const trimmed = websiteUrl.trim();
  if (!trimmed) return "";
  if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
    throw new Error("La URL debe empezar con https://");
  }
  return trimmed.replace(/\/$/, "");
}

export async function getOrganizationSettingsAction(): Promise<OrganizationSettings | null> {
  const organizationId = await requireOrganizationId();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("organizations")
    .select("name, website_url")
    .eq("id", organizationId)
    .maybeSingle();

  if (error || !data) return null;

  return {
    name: data.name ?? "",
    website_url: (data.website_url as string | null) ?? null,
  };
}

export async function updateOrganizationWebsiteAction(
  websiteUrl: string
): Promise<MutationResult> {
  return runMutation(async () => {
    const organizationId = await requireOrganizationId();
    const supabase = await createClient();
    const normalized = websiteUrl.trim()
      ? normalizeWebsiteUrl(websiteUrl)
      : null;

    const { error } = await supabase
      .from("organizations")
      .update({ website_url: normalized })
      .eq("id", organizationId);

    if (error) throw new Error(error.message);

    revalidatePath(paths.platform.settings);
    revalidatePath(paths.platform.marketing.utms);
  });
}

export async function saveGeneralOrganizationSettingsAction(input: {
  orgName: string;
  websiteUrl: string;
}): Promise<MutationResult> {
  return runMutation(async () => {
    const organizationId = await requireOrganizationId();
    const supabase = await createClient();

    const name = input.orgName.trim();
    if (!name) {
      throw new Error("El nombre de la empresa es obligatorio.");
    }

    const website_url = input.websiteUrl.trim()
      ? normalizeWebsiteUrl(input.websiteUrl)
      : null;

    const { error } = await supabase
      .from("organizations")
      .update({ name, website_url })
      .eq("id", organizationId);

    if (error) throw new Error(error.message);

    revalidatePath(paths.platform.settings);
    revalidatePath(paths.platform.marketing.utms);
  });
}
