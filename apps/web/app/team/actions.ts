"use server";

import {
  getCurrentProfile,
  isMissingTableError,
  requireOrganizationId,
} from "@/lib/auth/bootstrap";
import { displayName } from "@/lib/workboard/mapper";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { TeamMember } from "@/types/team";

export async function listTeamMembersAction(): Promise<TeamMember[]> {
  if (!isSupabaseConfigured()) return [];

  const organizationId = await requireOrganizationId();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select(
      "id, full_name, email, role, hourly_rate, hourly_rate_currency, created_at"
    )
    .eq("organization_id", organizationId)
    .order("full_name", { ascending: true });

  if (error) {
    if (isMissingTableError(error.message)) return [];
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => {
    const name = displayName(row.full_name, row.email);
    return {
      id: row.id,
      name,
      email: row.email,
      role: row.role as TeamMember["role"],
      status: "active" as const,
      lastLogin: row.created_at ?? new Date().toISOString(),
      hourlyRate:
        row.hourly_rate != null ? Number(row.hourly_rate) : undefined,
      hourlyRateCurrency: (row.hourly_rate_currency as string) ?? "USD",
    };
  });
}

export async function getTeamPageContextAction(): Promise<{
  members: TeamMember[];
  canEditRates: boolean;
}> {
  if (!isSupabaseConfigured()) {
    return { members: [], canEditRates: false };
  }

  const profile = await getCurrentProfile();
  const members = await listTeamMembersAction();

  return {
    members,
    canEditRates: Boolean(
      profile && ["founder", "admin"].includes(profile.role)
    ),
  };
}
