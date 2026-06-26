import type { SupabaseClient } from "@supabase/supabase-js";

const SAMPLE_LIMIT = 30;
const TRANSCRIPT_LIMIT = 6;
const TRANSCRIPT_MAX_CHARS = 4000;

export type FounderToneSources = {
  hasEnoughContent: boolean;
  agentMessages: string[];
  weeklyInputs: string[];
  marketingCopy: string[];
  manualSops: string[];
  salesFrameworks: string[];
  callTranscripts: string[];
  /** Resumen de debug interno: cuántos ítems entraron por fuente. */
  summary: {
    agentMessages: number;
    weeklyInputs: number;
    marketingCopy: number;
    manualSops: number;
    salesFrameworks: number;
    callTranscripts: number;
    totalChars: number;
  };
};

/** Mínimo de fragmentos para considerar que hay material suficiente. */
const MIN_TOTAL_ITEMS = 5;

function clean(text: string | null | undefined): string | null {
  const trimmed = text?.trim();
  return trimmed ? trimmed : null;
}

export async function collectFounderToneSources(
  admin: SupabaseClient,
  organizationId: string
): Promise<FounderToneSources> {
  const [
    agentRes,
    weeklyRes,
    contentRes,
    sopsRes,
    frameworksRes,
    transcriptsRes,
  ] = await Promise.all([
    // Mensajes escritos por el founder/equipo en el Agente (role = 'user').
    admin
      .from("agent_messages")
      .select("content, role, created_at")
      .eq("organization_id", organizationId)
      .eq("role", "user")
      .order("created_at", { ascending: false })
      .limit(SAMPLE_LIMIT),
    // Texto libre del founder en weekly inputs.
    admin
      .from("weekly_inputs")
      .select("content, department, created_at")
      .eq("organization_id", organizationId)
      .eq("department", "founder")
      .order("created_at", { ascending: false })
      .limit(SAMPLE_LIMIT),
    // Copy de marketing escrito a mano (captions/títulos).
    admin
      .from("content_assets")
      .select("title, caption, published_at")
      .eq("organization_id", organizationId)
      .order("published_at", { ascending: false, nullsFirst: false })
      .limit(SAMPLE_LIMIT),
    // SOPs redactados manualmente (no generados por IA).
    admin
      .from("sops")
      .select("title, content, generated_by_ai, created_at")
      .eq("organization_id", organizationId)
      .eq("generated_by_ai", false)
      .order("created_at", { ascending: false })
      .limit(SAMPLE_LIMIT),
    // Frameworks de venta (siempre cargados manualmente por el equipo).
    admin
      .from("sales_frameworks")
      .select("name, content, created_at")
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: false })
      .limit(SAMPLE_LIMIT),
    // Transcripts de Fathom donde el founder/equipo probablemente participó.
    admin
      .from("fathom_calls")
      .select("transcript, summary, call_date")
      .eq("organization_id", organizationId)
      .not("transcript", "is", null)
      .order("call_date", { ascending: false, nullsFirst: false })
      .limit(TRANSCRIPT_LIMIT),
  ]);

  const agentMessages = (agentRes.data ?? [])
    .map((row) => clean(row.content as string))
    .filter((v): v is string => Boolean(v));

  const weeklyInputs = (weeklyRes.data ?? [])
    .map((row) => clean(row.content as string))
    .filter((v): v is string => Boolean(v));

  const marketingCopy = (contentRes.data ?? [])
    .map((row) => {
      const title = clean(row.title as string);
      const caption = clean(row.caption as string);
      return caption ?? title;
    })
    .filter((v): v is string => Boolean(v));

  const manualSops = (sopsRes.data ?? [])
    .map((row) => {
      const title = clean(row.title as string);
      const content = clean(row.content as string);
      if (!content) return null;
      return title ? `${title}: ${content}` : content;
    })
    .filter((v): v is string => Boolean(v));

  const salesFrameworks = (frameworksRes.data ?? [])
    .map((row) => {
      const name = clean(row.name as string);
      const content = clean(row.content as string);
      if (!content) return null;
      return name ? `${name}: ${content}` : content;
    })
    .filter((v): v is string => Boolean(v));

  const callTranscripts = (transcriptsRes.data ?? [])
    .map((row) => {
      const transcript = clean(row.transcript as string);
      return transcript ? transcript.slice(0, TRANSCRIPT_MAX_CHARS) : null;
    })
    .filter((v): v is string => Boolean(v));

  const totalChars = [
    ...agentMessages,
    ...weeklyInputs,
    ...marketingCopy,
    ...manualSops,
    ...salesFrameworks,
    ...callTranscripts,
  ].reduce((sum, t) => sum + t.length, 0);

  const totalItems =
    agentMessages.length +
    weeklyInputs.length +
    marketingCopy.length +
    manualSops.length +
    salesFrameworks.length +
    callTranscripts.length;

  return {
    hasEnoughContent: totalItems >= MIN_TOTAL_ITEMS && totalChars >= 400,
    agentMessages,
    weeklyInputs,
    marketingCopy,
    manualSops,
    salesFrameworks,
    callTranscripts,
    summary: {
      agentMessages: agentMessages.length,
      weeklyInputs: weeklyInputs.length,
      marketingCopy: marketingCopy.length,
      manualSops: manualSops.length,
      salesFrameworks: salesFrameworks.length,
      callTranscripts: callTranscripts.length,
      totalChars,
    },
  };
}

export function formatToneSourcesForPrompt(sources: FounderToneSources): string {
  const blocks: string[] = [];

  const section = (label: string, items: string[], maxPerItem = 600) => {
    if (items.length === 0) return;
    blocks.push(
      `### ${label} (${items.length})\n${items
        .map((t, i) => `${i + 1}. ${t.slice(0, maxPerItem)}`)
        .join("\n")}`
    );
  };

  section("Mensajes del founder en el Agente", sources.agentMessages);
  section("Inputs semanales del founder", sources.weeklyInputs);
  section("Copy de marketing propio", sources.marketingCopy);
  section("SOPs redactados a mano", sources.manualSops, 800);
  section("Frameworks de venta propios", sources.salesFrameworks, 800);
  section("Fragmentos de llamadas (Fathom)", sources.callTranscripts, 2000);

  return blocks.join("\n\n");
}
