import type { SupabaseClient } from "@supabase/supabase-js";
import { mockFrequentObjections } from "@/mocks/sales";
import type { FrequentObjection, ObjectionCategory } from "@/types/sales";

type StoredObjection = {
  text: string;
  category: ObjectionCategory;
  handled: boolean;
};

export async function getFrequentObjections(
  organizationId: string,
  supabase: SupabaseClient
): Promise<{ objections: FrequentObjection[]; fromCallAnalyses: boolean }> {
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const { data: analyses, error } = await supabase
    .from("call_analyses")
    .select("objections, closer_name, fathom_call_id")
    .eq("organization_id", organizationId)
    .gte("created_at", since);

  if (error || !analyses?.length) {
    return { objections: mockFrequentObjections, fromCallAnalyses: false };
  }

  const allObjections = analyses.flatMap((row) => {
    const list = (row.objections ?? []) as StoredObjection[];
    return list.map((obj) => ({
      ...obj,
      closerName: row.closer_name as string | null,
      fathomCallId: row.fathom_call_id as string | null,
    }));
  });

  if (allObjections.length === 0) {
    return { objections: mockFrequentObjections, fromCallAnalyses: false };
  }

  const grouped = new Map<
    string,
    {
      category: ObjectionCategory;
      count: number;
      examples: string[];
      closerName?: string | null;
      fathomCallId?: string | null;
    }
  >();

  for (const obj of allObjections) {
    const key = `${obj.category}::${obj.text.toLowerCase().trim()}`;
    const existing = grouped.get(key);
    if (existing) {
      existing.count += 1;
    } else {
      grouped.set(key, {
        category: obj.category,
        count: 1,
        examples: [obj.text],
        closerName: obj.closerName,
        fathomCallId: obj.fathomCallId,
      });
    }
  }

  return {
    objections: [...grouped.values()]
      .sort((a, b) => b.count - a.count)
      .slice(0, 8)
      .map((group, index) => ({
        id: `call-obj-${index + 1}`,
        text: group.examples[0] ?? group.category,
        category: group.category,
        frequency: group.count,
        conversationId: group.fathomCallId ?? "call-analysis",
        leadName: group.closerName ?? "Desde calls",
      })),
    fromCallAnalyses: true,
  };
}
