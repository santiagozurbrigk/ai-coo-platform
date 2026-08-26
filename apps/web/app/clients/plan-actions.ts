"use server";

import { requireOrganizationId } from "@/lib/auth/bootstrap";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import type { InstallmentSystem, Plan } from "@/types/plans";

// ── Tipos internos ──────────────────────────────────────────────────────────

type PlanRow = {
  id: string;
  organization_id: string;
  name: string;
  duration_days: number | null;
  installment_systems: InstallmentSystem[];
  created_at: string;
  updated_at: string;
};

function rowToPlan(row: PlanRow): Plan {
  return {
    id: row.id,
    name: row.name,
    durationDays: row.duration_days ?? undefined,
    installmentSystems: row.installment_systems ?? [],
    createdAt: row.created_at,
  };
}

// ── Listar planes ───────────────────────────────────────────────────────────

export async function listPlansAction(): Promise<Plan[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("plans")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) {
    console.error("[listPlans]", error.message);
    return [];
  }
  return (data as PlanRow[]).map(rowToPlan);
}

// ── Crear plan ──────────────────────────────────────────────────────────────

export async function createPlanAction(input: {
  name: string;
  durationDays?: number | null;
  installmentSystems?: InstallmentSystem[];
}): Promise<{ success: boolean; data?: Plan; error?: string }> {
  if (!isSupabaseConfigured()) return { success: false, error: "Supabase no configurado" };
  if (!input.name?.trim()) return { success: false, error: "El nombre es obligatorio" };

  const organizationId = await requireOrganizationId();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("plans")
    .insert({
      organization_id: organizationId,
      name: input.name.trim(),
      duration_days: input.durationDays ?? null,
      installment_systems: input.installmentSystems ?? [],
    })
    .select()
    .single();

  if (error || !data) {
    return { success: false, error: error?.message ?? "No se pudo crear el plan" };
  }
  return { success: true, data: rowToPlan(data as PlanRow) };
}

// ── Actualizar plan ─────────────────────────────────────────────────────────

export async function updatePlanAction(
  id: string,
  patch: {
    name?: string;
    durationDays?: number | null;
    installmentSystems?: InstallmentSystem[];
  }
): Promise<{ success: boolean; data?: Plan; error?: string }> {
  if (!isSupabaseConfigured()) return { success: false, error: "Supabase no configurado" };

  const organizationId = await requireOrganizationId();
  const supabase = await createClient();

  const update: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (patch.name != null) update.name = patch.name.trim();
  if ("durationDays" in patch) update.duration_days = patch.durationDays ?? null;
  if (patch.installmentSystems != null) update.installment_systems = patch.installmentSystems;

  const { data, error } = await supabase
    .from("plans")
    .update(update)
    .eq("id", id)
    .eq("organization_id", organizationId)
    .select()
    .single();

  if (error || !data) {
    return { success: false, error: error?.message ?? "No se pudo actualizar el plan" };
  }
  return { success: true, data: rowToPlan(data as PlanRow) };
}

// ── Eliminar plan ───────────────────────────────────────────────────────────

export async function deletePlanAction(
  id: string
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) return { success: false, error: "Supabase no configurado" };

  const organizationId = await requireOrganizationId();
  const supabase = await createClient();

  const { error } = await supabase
    .from("plans")
    .delete()
    .eq("id", id)
    .eq("organization_id", organizationId);

  if (error) return { success: false, error: error.message };
  return { success: true };
}
