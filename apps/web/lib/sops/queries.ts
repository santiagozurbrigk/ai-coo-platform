import { requireOrganizationId } from "@/lib/auth/bootstrap";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { rowToSop, type SopRow } from "./mapper";
import type { Sop } from "@/types/sops";

export async function listSops(): Promise<Sop[]> {
  if (!isSupabaseConfigured()) return [];

  const organizationId = await requireOrganizationId();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("sops")
    .select("*")
    .eq("organization_id", organizationId)
    .order("updated_at", { ascending: false });

  if (error) throw new Error(error.message);

  const rows = (data ?? []) as SopRow[];
  return rows.map(rowToSop);
}

export async function getSopById(id: string): Promise<Sop | null> {
  if (!isSupabaseConfigured()) return null;

  const organizationId = await requireOrganizationId();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("sops")
    .select("*")
    .eq("id", id)
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;

  return rowToSop(data as SopRow);
}

export async function getSopContentById(
  id: string
): Promise<{ sop: Sop; content: string } | null> {
  if (!isSupabaseConfigured()) return null;

  const organizationId = await requireOrganizationId();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("sops")
    .select("*")
    .eq("id", id)
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;

  const row = data as SopRow;
  return { sop: rowToSop(row), content: row.content };
}
