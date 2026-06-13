"use server";

import { revalidatePath } from "next/cache";
import { requireOrganizationId } from "@/lib/auth/bootstrap";
import { requireAuthContext } from "@/lib/auth/require-auth";
import {
  assertClaudeKeyFormat,
  validateClaudeApiKey,
  validationErrorMessage,
} from "@/lib/ai/validate-claude-key";
import { invalidateOrgKeyCache } from "@/lib/ai/anthropic";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { runMutation, type MutationResult } from "@/lib/server/action-result";
import { paths } from "@/routes";

export type ClaudeApiKeyStatus = {
  hasKey: boolean;
  status: "none" | "valid" | "invalid" | "error";
  lastValidated: string | null;
  keyPreview: string | null;
};

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

export async function getClaudeApiKeyStatusAction(): Promise<ClaudeApiKeyStatus> {
  if (!isSupabaseConfigured()) {
    return {
      hasKey: false,
      status: "none",
      lastValidated: null,
      keyPreview: null,
    };
  }

  try {
    const organizationId = await requireOrganizationId();
    const supabase = await createClient();

    const { data: statusRow } = await supabase
      .from("organization_claude_status")
      .select(
        "has_claude_key, claude_api_key_status, claude_api_key_last_validated_at"
      )
      .eq("id", organizationId)
      .maybeSingle();

    if (!statusRow?.has_claude_key) {
      return {
        hasKey: false,
        status: "none",
        lastValidated: null,
        keyPreview: null,
      };
    }

    const admin = createAdminClient();
    const { data: orgRow } = await admin
      .from("organizations")
      .select("claude_api_key_encrypted")
      .eq("id", organizationId)
      .maybeSingle();

    const encrypted = orgRow?.claude_api_key_encrypted as string | null | undefined;

    return {
      hasKey: true,
      status:
        (statusRow.claude_api_key_status as ClaudeApiKeyStatus["status"]) ??
        "none",
      lastValidated:
        (statusRow.claude_api_key_last_validated_at as string | null) ?? null,
      keyPreview: encrypted ? `sk-ant-...${encrypted.slice(-8)}` : null,
    };
  } catch {
    return {
      hasKey: false,
      status: "none",
      lastValidated: null,
      keyPreview: null,
    };
  }
}

export async function saveClaudeApiKeyAction(
  apiKey: string
): Promise<MutationResult> {
  return runMutation(async () => {
    if (!isSupabaseConfigured()) {
      throw new Error("Supabase no configurado.");
    }

    const { orgId } = await requireAuthContext();
    assertClaudeKeyFormat(apiKey);

    const validation = await validateClaudeApiKey(apiKey);
    if (!validation.ok) {
      throw new Error(validationErrorMessage(validation.reason));
    }

    const admin = createAdminClient();
    const { error } = await admin
      .from("organizations")
      .update({
        claude_api_key_encrypted: apiKey.trim(),
        claude_api_key_status: "valid",
        claude_api_key_last_validated_at: new Date().toISOString(),
      })
      .eq("id", orgId);

    if (error) throw new Error(error.message);

    invalidateOrgKeyCache(orgId);
    revalidatePath(paths.platform.settings);
    return undefined;
  });
}

export async function removeClaudeApiKeyAction(): Promise<MutationResult> {
  return runMutation(async () => {
    if (!isSupabaseConfigured()) {
      throw new Error("Supabase no configurado.");
    }

    const { orgId } = await requireAuthContext();
    const admin = createAdminClient();

    const { error } = await admin
      .from("organizations")
      .update({
        claude_api_key_encrypted: null,
        claude_api_key_status: "none",
        claude_api_key_last_validated_at: null,
      })
      .eq("id", orgId);

    if (error) throw new Error(error.message);

    invalidateOrgKeyCache(orgId);
    revalidatePath(paths.platform.settings);
    return undefined;
  });
}
