import crypto from "crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { formatRelativeTime } from "@/lib/format";
import type { MemoryChunk } from "@/types/intelligence";

type MemorySource = {
  id: string;
  label: string;
  type: string;
  accessedAt: string;
};

export async function buildMemoryChunks(
  admin: SupabaseClient,
  organizationId: string,
  limit = 8
): Promise<MemoryChunk[]> {
  const [sopsRes, reportsRes, contentRes] = await Promise.all([
    admin
      .from("sops")
      .select("id, title, department, updated_at")
      .eq("organization_id", organizationId)
      .eq("status", "active")
      .order("updated_at", { ascending: false })
      .limit(limit),
    admin
      .from("weekly_reports")
      .select("id, week_start, generated_at")
      .eq("organization_id", organizationId)
      .eq("status", "ready")
      .order("generated_at", { ascending: false })
      .limit(limit),
    admin
      .from("content_assets")
      .select("id, title, caption, platform, last_synced_at, published_at")
      .eq("organization_id", organizationId)
      .order("last_synced_at", { ascending: false, nullsFirst: false })
      .limit(limit),
  ]);

  const sources: MemorySource[] = [];

  for (const sop of sopsRes.data ?? []) {
    sources.push({
      id: String(sop.id),
      label: String(sop.title),
      type: "sop",
      accessedAt: String(sop.updated_at),
    });
  }

  for (const report of reportsRes.data ?? []) {
    sources.push({
      id: String(report.id),
      label: `Reporte ejecutivo · Semana ${report.week_start}`,
      type: "reporte",
      accessedAt: String(report.generated_at ?? report.week_start),
    });
  }

  for (const asset of contentRes.data ?? []) {
    const title =
      (asset.title as string)?.trim() ||
      (asset.caption as string)?.trim().slice(0, 60) ||
      "Contenido sin título";
    sources.push({
      id: String(asset.id),
      label: title,
      type: String(asset.platform),
      accessedAt: String(
        asset.last_synced_at ?? asset.published_at ?? new Date().toISOString()
      ),
    });
  }

  sources.sort(
    (a, b) =>
      new Date(b.accessedAt).getTime() - new Date(a.accessedAt).getTime()
  );

  return sources.slice(0, limit).map((source) => ({
    id: source.id,
    label: source.label,
    type: source.type,
    lastAccessed: formatRelativeTime(source.accessedAt),
  }));
}

export function withStableIds<T extends Record<string, unknown>>(
  items: T[],
  prefix: string
): Array<T & { id: string }> {
  return items.map((item, index) => ({
    ...item,
    id:
      typeof item.id === "string" && item.id.trim()
        ? item.id
        : `${prefix}-${crypto.randomUUID().slice(0, 8)}-${index}`,
  }));
}
