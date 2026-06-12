"use server";

import {
  isMissingTableError,
  requireOrganizationId,
} from "@/lib/auth/bootstrap";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import {
  getTeamAverageEvolution,
  mockCallAnalyses,
  mockCloserEvolution,
  mockTeamRanking,
} from "@/mocks/call-analyses";
import type { TeamRankingEntry } from "@/types/call-analysis";

type CallAnalysisRow = {
  closer_id: string | null;
  closer_name: string | null;
  overall_score: number | null;
  booked: boolean;
  sold: boolean;
};

export async function getCallAnalysesAction(closerId?: string) {
  if (!isSupabaseConfigured()) return null;

  try {
    const organizationId = await requireOrganizationId();
    const supabase = await createClient();

    let query = supabase
      .from("call_analyses")
      .select("*")
      .eq("organization_id", organizationId)
      .order("call_date", { ascending: false });

    if (closerId) {
      query = query.eq("closer_id", closerId);
    }

    const { data, error } = await query;
    if (error) {
      if (isMissingTableError(error.message)) return null;
      throw new Error(error.message);
    }

    return data?.length ? data : null;
  } catch {
    return null;
  }
}

export async function getTeamRankingAction(): Promise<TeamRankingEntry[]> {
  if (!isSupabaseConfigured()) return mockTeamRanking;

  try {
    const organizationId = await requireOrganizationId();
    const supabase = await createClient();
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    const { data, error } = await supabase
      .from("call_analyses")
      .select("closer_id, closer_name, overall_score, booked, sold")
      .eq("organization_id", organizationId)
      .gte("call_date", since);

    if (error) {
      if (isMissingTableError(error.message)) return mockTeamRanking;
      throw new Error(error.message);
    }

    if (!data?.length) return mockTeamRanking;

    const byCloser = data.reduce<
      Record<
        string,
        {
          name: string;
          scores: number[];
          calls: number;
          bookings: number;
        }
      >
    >((acc, call: CallAnalysisRow) => {
      const key = call.closer_id ?? call.closer_name ?? "unknown";
      if (!acc[key]) {
        acc[key] = {
          name: call.closer_name ?? "Sin nombre",
          scores: [],
          calls: 0,
          bookings: 0,
        };
      }
      if (call.overall_score != null) {
        acc[key].scores.push(call.overall_score);
      }
      acc[key].calls += 1;
      if (call.booked) acc[key].bookings += 1;
      return acc;
    }, {});

    return Object.values(byCloser)
      .map((c) => ({
        name: c.name,
        score: Math.round(
          c.scores.reduce((a: number, b: number) => a + b, 0) /
            Math.max(c.scores.length, 1)
        ),
        calls: c.calls,
        bookings: c.bookings,
        conversion: `${Math.round((c.bookings / Math.max(c.calls, 1)) * 100)}%`,
        trend: "stable" as const,
      }))
      .sort((a, b) => b.score - a.score);
  } catch {
    return mockTeamRanking;
  }
}

export async function getCloserEvolutionAction(
  closerName: string
): Promise<number[]> {
  if (!isSupabaseConfigured()) {
    const key = closerName.split(" ")[0]?.toLowerCase() as keyof typeof mockCloserEvolution;
    return mockCloserEvolution[key] ?? mockCloserEvolution.carlos;
  }

  try {
    const organizationId = await requireOrganizationId();
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("call_analyses")
      .select("overall_score, call_date")
      .eq("organization_id", organizationId)
      .eq("closer_name", closerName)
      .order("call_date", { ascending: true })
      .limit(50);

    if (error) {
      if (isMissingTableError(error.message)) {
        const key = closerName.split(" ")[0]?.toLowerCase() as keyof typeof mockCloserEvolution;
        return mockCloserEvolution[key] ?? mockCloserEvolution.carlos;
      }
      throw new Error(error.message);
    }

    if (!data?.length) {
      const key = closerName.split(" ")[0]?.toLowerCase() as keyof typeof mockCloserEvolution;
      return mockCloserEvolution[key] ?? mockCloserEvolution.carlos;
    }

    return data.map((d) => d.overall_score ?? 0);
  } catch {
    const key = closerName.split(" ")[0]?.toLowerCase() as keyof typeof mockCloserEvolution;
    return mockCloserEvolution[key] ?? mockCloserEvolution.carlos;
  }
}

export async function getTeamAverageEvolutionAction(): Promise<number[]> {
  return getTeamAverageEvolution();
}

/** Expuesto para validar mocks en desarrollo */
export async function getMockCallAnalysisKeysAction() {
  return Object.keys(mockCallAnalyses);
}
