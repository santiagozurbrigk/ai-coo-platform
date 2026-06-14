"use server";

import { revalidatePath } from "next/cache";
import {
  getCurrentProfile,
  isMissingTableError,
  requireOrganizationId,
} from "@/lib/auth/bootstrap";
import { callClaudeJson } from "@/lib/ai/anthropic";
import { buildSOPGenerationPrompt } from "@/lib/sops/generate-sop-prompt";
import {
  actionErrorMessage,
  runMutation,
  type MutationResult,
} from "@/lib/server/action-result";
import { createClient } from "@/lib/supabase/server";
import { paths } from "@/routes/paths";

const SOP_MODEL = "claude-sonnet-4-6" as const;

function revalidateSops() {
  revalidatePath(paths.platform.operations.sops);
}

export type GeneratedSOPData = {
  title: string;
  summary: string;
  content: string;
  estimatedDurationMinutes: number;
  tags: string[];
  stepsCount: number;
};

export async function generateSOPAction(data: {
  goal: string;
  department: string;
  expectedOutcome: string;
  additionalContext?: string;
}): Promise<MutationResult<GeneratedSOPData>> {
  return runMutation(async () => {
    const organizationId = await requireOrganizationId();
    const supabase = await createClient();

    const { data: org } = await supabase
      .from("organizations")
      .select("name")
      .eq("id", organizationId)
      .maybeSingle();

    const { data: existingSOPs } = await supabase
      .from("sops")
      .select("title, department")
      .eq("organization_id", organizationId)
      .eq("status", "active")
      .limit(10);

    const { data: salesScript } = await supabase
      .from("sales_scripts")
      .select("sections")
      .eq("organization_id", organizationId)
      .eq("is_active", true)
      .maybeSingle();

    const prompt = buildSOPGenerationPrompt({
      ...data,
      orgContext: {
        orgName: org?.name ?? "la organización",
        existingSOPs: existingSOPs ?? [],
        salesScript: salesScript
          ? JSON.stringify(salesScript.sections)
          : undefined,
      },
    });

    const generated = await callClaudeJson<{
      title: string;
      summary: string;
      estimated_duration_minutes: number;
      tags: string[];
      content: string;
      steps_count: number;
    }>({
      model: SOP_MODEL,
      system:
        "Respondé únicamente con JSON válido. No incluyas markdown fences ni texto fuera del objeto JSON.",
      user: prompt,
      maxTokens: 3000,
      feature: "sop_generation",
      organizationId,
    });

    if (!generated) {
      throw new Error(
        "Configurá tu API key de Claude en Settings → IA para generar SOPs"
      );
    }

    return {
      title: generated.title,
      summary: generated.summary,
      content: generated.content,
      estimatedDurationMinutes: generated.estimated_duration_minutes,
      tags: generated.tags,
      stepsCount: generated.steps_count,
    };
  });
}

export async function saveSOPAction(data: {
  title: string;
  goal: string;
  department: string;
  expectedOutcome?: string;
  additionalContext?: string;
  content: string;
  tags?: string[];
  estimatedDurationMinutes?: number;
  generatedByAI?: boolean;
  status?: "draft" | "active";
}): Promise<MutationResult<{ id: string }>> {
  return runMutation(async () => {
    const organizationId = await requireOrganizationId();
    const profile = await getCurrentProfile();
    const supabase = await createClient();

    const { data: sop, error } = await supabase
      .from("sops")
      .insert({
        organization_id: organizationId,
        title: data.title,
        goal: data.goal,
        department: data.department,
        expected_outcome: data.expectedOutcome ?? null,
        additional_context: data.additionalContext ?? null,
        content: data.content,
        tags: data.tags ?? [],
        estimated_duration_minutes: data.estimatedDurationMinutes ?? null,
        generated_by_ai: data.generatedByAI ?? false,
        ai_model: data.generatedByAI ? SOP_MODEL : null,
        status: data.status ?? "draft",
        created_by: "user",
        author_user_id: profile?.id ?? null,
        version: 1,
      })
      .select("id")
      .single();

    if (error) {
      if (isMissingTableError(error.message)) {
        throw new Error(
          "La tabla de SOPs aún no está migrada en Supabase. Aplicá la migración 20260616300000_sops_enhanced.sql"
        );
      }
      throw new Error(error.message);
    }

    await supabase.from("sop_versions").insert({
      sop_id: sop.id,
      organization_id: organizationId,
      version: 1,
      content: data.content,
      changed_by: profile?.id ?? null,
      change_note: "Versión inicial",
    });

    revalidateSops();
    return { id: sop.id };
  });
}

export async function updateSOPAction(
  sopId: string,
  data: {
    title?: string;
    content?: string;
    status?: "draft" | "active" | "outdated";
    tags?: string[];
    changeNote?: string;
  }
): Promise<MutationResult<{ ok: true }>> {
  return runMutation(async () => {
    const organizationId = await requireOrganizationId();
    const profile = await getCurrentProfile();
    const supabase = await createClient();

    const { data: current, error: fetchError } = await supabase
      .from("sops")
      .select("version, content")
      .eq("id", sopId)
      .eq("organization_id", organizationId)
      .maybeSingle();

    if (fetchError) throw new Error(fetchError.message);
    if (!current) throw new Error("SOP no encontrado");

    const newVersion = (current.version ?? 1) + 1;

    const { error } = await supabase
      .from("sops")
      .update({
        title: data.title,
        content: data.content,
        status: data.status,
        tags: data.tags,
        version: data.content && data.content !== current.content ? newVersion : current.version,
        updated_at: new Date().toISOString(),
      })
      .eq("id", sopId)
      .eq("organization_id", organizationId);

    if (error) throw new Error(error.message);

    if (data.content && data.content !== current.content) {
      await supabase.from("sop_versions").insert({
        sop_id: sopId,
        organization_id: organizationId,
        version: newVersion,
        content: data.content,
        changed_by: profile?.id ?? null,
        change_note: data.changeNote ?? "Actualización",
      });
    }

    revalidateSops();
    return { ok: true };
  });
}

export type SopVersionView = {
  id: string;
  version: number;
  content: string;
  change_note: string | null;
  created_at: string;
  changed_by_name: string | null;
};

export async function getSOPVersionsAction(
  sopId: string
): Promise<MutationResult<SopVersionView[]>> {
  return runMutation(async () => {
    const organizationId = await requireOrganizationId();
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("sop_versions")
      .select(
        "id, version, content, change_note, created_at, changed_by, profiles(full_name)"
      )
      .eq("sop_id", sopId)
      .eq("organization_id", organizationId)
      .order("version", { ascending: false });

    if (error) {
      if (isMissingTableError(error.message)) return [];
      throw new Error(error.message);
    }

    return (data ?? []).map((row) => {
      const raw = row as Record<string, unknown>;
      const profilesRaw = raw.profiles;
      const profile = Array.isArray(profilesRaw) ? profilesRaw[0] : profilesRaw;
      const fullName =
        profile && typeof profile === "object" && "full_name" in profile
          ? (profile.full_name as string | null)
          : null;

      return {
        id: row.id as string,
        version: row.version as number,
        content: row.content as string,
        change_note: row.change_note as string | null,
        created_at: row.created_at as string,
        changed_by_name: fullName,
      };
    });
  });
}

export async function getSOPsAction(filters?: {
  department?: string;
  status?: string;
  search?: string;
}) {
  try {
    const organizationId = await requireOrganizationId();
    const supabase = await createClient();

    let query = supabase
      .from("sops")
      .select("*")
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: false });

    if (filters?.department) {
      query = query.eq("department", filters.department);
    }
    if (filters?.status) {
      query = query.eq("status", filters.status);
    }
    if (filters?.search) {
      query = query.ilike("title", `%${filters.search}%`);
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data ?? [];
  } catch (error) {
    console.warn("[getSOPsAction]", actionErrorMessage(error));
    return [];
  }
}
