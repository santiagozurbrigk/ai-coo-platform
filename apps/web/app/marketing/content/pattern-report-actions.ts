"use server";

import { requireOrganizationId } from "@/lib/auth/bootstrap";
import { createClient } from "@/lib/supabase/server";
import { callClaudeText } from "@/lib/ai/anthropic";
import type {
  ContentFormatType,
  ContentHookType,
  ContentCtaType,
  ContentPiece,
} from "@/types/content";

// ─── Tipos públicos ────────────────────────────────────────────────────────────

export type PatternRankedItem = {
  value: string;
  label: string;
  count: number;
  avg_views?: number;
  avg_saves?: number;
};

export type ContentPatternReport = {
  id: string;
  organization_id: string;
  range_type: "COUNT" | "DATE_RANGE";
  range_value: string;
  content_ids: string[];
  top_formats: PatternRankedItem[];
  top_hooks: PatternRankedItem[];
  top_topics: PatternRankedItem[];
  summary: string;
  suggestions: string;
  sample_size_notes: string;
  generated_at: string;
};

export type GeneratePatternReportParams =
  | { type: "COUNT"; count: 30 | 60 | 90 | "all" }
  | { type: "DATE_RANGE"; from: string; to: string };

// ─── Labels legibles ───────────────────────────────────────────────────────────

const FORMAT_LABELS: Record<ContentFormatType, string> = {
  storytime: "Storytime",
  talking_head: "Talking Head",
  pov: "POV",
  listicle: "Listicle",
  green_screen: "Green Screen",
  hot_take: "Hot Take",
  carousel: "Carrusel",
  otro: "Otro",
};

const HOOK_LABELS: Record<ContentHookType, string> = {
  dolor_directo: "Dolor directo",
  curiosidad: "Curiosidad",
  contrarian: "Contrarian",
  prueba_social: "Prueba social",
  resultado: "Resultado",
};

const CTA_LABELS: Record<ContentCtaType, string> = {
  dm: "Pedir DM",
  comment_word: "Comentar palabra",
  link: "Link en bio",
  none: "Sin CTA",
};

// ─── Helpers ───────────────────────────────────────────────────────────────────

function rankItems<T extends string>(
  pieces: ContentPiece[],
  field: keyof ContentPiece,
  labels: Record<T, string>
): PatternRankedItem[] {
  const counts = new Map<T, { count: number; views: number; saves: number }>();

  for (const piece of pieces) {
    const val = piece[field] as T | undefined;
    if (!val) continue;
    const existing = counts.get(val) ?? { count: 0, views: 0, saves: 0 };
    existing.count += 1;
    existing.views += piece.metrics?.views ?? piece.metrics?.reach ?? 0;
    existing.saves += piece.metrics?.saves ?? 0;
    counts.set(val, existing);
  }

  return Array.from(counts.entries())
    .sort(([, a], [, b]) => b.count - a.count)
    .map(([value, stats]) => ({
      value,
      label: labels[value] ?? value,
      count: stats.count,
      avg_views: stats.count > 0 ? Math.round(stats.views / stats.count) : 0,
      avg_saves: stats.count > 0 ? Math.round(stats.saves / stats.count) : 0,
    }));
}

function buildPatternPrompt(
  pieces: ContentPiece[],
  topFormats: PatternRankedItem[],
  topHooks: PatternRankedItem[],
  rangeDescription: string
): string {
  const withAnalysis = pieces.filter((p) => p.analysis);
  const withFormatType = pieces.filter((p) => p.format_type);

  const formatSummary = topFormats
    .slice(0, 5)
    .map((f) => `  - ${f.label}: ${f.count} piezas, ${f.avg_views?.toLocaleString("es-AR") ?? "?"} views promedio`)
    .join("\n");

  const hookSummary = topHooks
    .slice(0, 5)
    .map((h) => `  - ${h.label}: ${h.count} piezas`)
    .join("\n");

  const topAnalyzed = withAnalysis
    .sort(
      (a, b) => (b.metrics?.views ?? 0) + (b.metrics?.saves ?? 0) - ((a.metrics?.views ?? 0) + (a.metrics?.saves ?? 0))
    )
    .slice(0, 8)
    .map(
      (p) =>
        `- "${p.analysis?.dolor?.name ?? "—"}" / "${p.analysis?.angulo?.name ?? "—"}" → ${(p.metrics?.views ?? 0).toLocaleString("es-AR")} views, ${p.metrics?.saves ?? 0} guardados, ${p.metrics?.likes ?? 0} likes`
    )
    .join("\n");

  return `Sos un estratega de contenido senior. Analizá los patrones del contenido publicado en el rango ${rangeDescription}.

DATOS DEL RANGO:
- Piezas analizadas: ${pieces.length} publicadas, ${withAnalysis.length} con análisis IA, ${withFormatType.length} con formato clasificado

FORMATOS MÁS USADOS:
${formatSummary || "  (sin clasificación disponible)"}

HOOKS MÁS USADOS:
${hookSummary || "  (sin clasificación disponible)"}

TOP CONTENIDOS POR ENGAGEMENT (dolor / ángulo → métricas):
${topAnalyzed || "  (sin análisis disponibles aún)"}

INSTRUCCIONES:
1. Escribí un RESUMEN de 2-3 párrafos con observaciones sobre los patrones: qué formatos dominan, qué dolores resuenan más, qué combinaciones generan más engagement. Usá lenguaje de hipótesis: "parecería que", "los datos sugieren", "podría indicar".
2. Escribí SUGERENCIAS concretas para el próximo período. Usá siempre lenguaje de recomendación suave: "convendría probar", "vale la pena explorar", "podría funcionar bien". NUNCA usés "tenés que", "hacé", "es obligatorio" ni lenguaje imperativo.
3. Escribí NOTAS DE MUESTRA con advertencias de calidad de datos si aplica (poca muestra, bajo porcentaje con análisis IA, etc.).

Respondé en JSON exactamente así:
{
  "summary": "2-3 párrafos de observaciones",
  "suggestions": "sugerencias en 3-5 puntos, con viñetas usando guión",
  "sample_size_notes": "advertencias sobre la calidad de la muestra (o cadena vacía si no hay advertencias)"
}`;
}

// ─── Action principal ──────────────────────────────────────────────────────────

export async function generateContentPatternReportAction(
  params: GeneratePatternReportParams
): Promise<ContentPatternReport> {
  const organizationId = await requireOrganizationId();
  const supabase = await createClient();

  // 1. Determinar filtro de rango
  let query = supabase
    .from("content_pieces")
    .select("*")
    .eq("organization_id", organizationId)
    .eq("status", "published")
    .is("variants_of", null)
    .order("published_at", { ascending: false, nullsFirst: false });

  let rangeDescription: string;
  let rangeType: "COUNT" | "DATE_RANGE";
  let rangeValue: string;

  if (params.type === "COUNT") {
    rangeType = "COUNT";
    if (params.count !== "all") {
      query = query.limit(params.count);
      rangeDescription = `las últimas ${params.count} piezas publicadas`;
      rangeValue = String(params.count);
    } else {
      rangeDescription = "todas las piezas publicadas";
      rangeValue = "all";
    }
  } else {
    rangeType = "DATE_RANGE";
    query = query
      .gte("published_at", params.from)
      .lte("published_at", params.to);
    rangeDescription = `del ${params.from} al ${params.to}`;
    rangeValue = `${params.from}:${params.to}`;
  }

  const { data: pieces, error } = await query;
  if (error) throw new Error(error.message);

  const typedPieces = (pieces ?? []) as ContentPiece[];

  if (typedPieces.length === 0) {
    throw new Error(
      "No hay piezas publicadas en el rango seleccionado. Probá con un rango más amplio."
    );
  }

  // 2. Calcular rankings
  const topFormats = rankItems<ContentFormatType>(
    typedPieces,
    "format_type",
    FORMAT_LABELS
  );
  const topHooks = rankItems<ContentHookType>(
    typedPieces,
    "hook_type",
    HOOK_LABELS
  );
  const topCtas = rankItems<ContentCtaType>(typedPieces, "cta_type", CTA_LABELS);

  // 3. Extraer temas/dolores
  const dolorCounts = new Map<string, { count: number; ids: string[] }>();
  for (const piece of typedPieces) {
    const dolor = piece.analysis?.dolor?.name?.trim();
    if (!dolor) continue;
    const existing = dolorCounts.get(dolor) ?? { count: 0, ids: [] };
    existing.count += 1;
    existing.ids.push(piece.id);
    dolorCounts.set(dolor, existing);
  }
  const topTopics = Array.from(dolorCounts.entries())
    .sort(([, a], [, b]) => b.count - a.count)
    .slice(0, 8)
    .map(([topic, stats]) => ({
      value: topic,
      label: topic,
      count: stats.count,
    }));

  // 4. Llamada a Claude para el análisis textual
  const prompt = buildPatternPrompt(
    typedPieces,
    topFormats,
    topHooks,
    rangeDescription
  );

  const rawJson = await callClaudeText({
    organizationId,
    task: "content_pattern_report",
    feature: "marketing_content",
    messages: [{ role: "user", content: prompt }],
    maxTokens: 1500,
  });

  let summary = "";
  let suggestions = "";
  let sampleSizeNotes = "";

  if (rawJson) {
    try {
      // Claude puede envolver el JSON en ```json ... ```
      const cleaned = rawJson.replace(/^```(?:json)?\n?/i, "").replace(/\n?```$/, "").trim();
      const parsed = JSON.parse(cleaned);
      summary = parsed.summary ?? "";
      suggestions = parsed.suggestions ?? "";
      sampleSizeNotes = parsed.sample_size_notes ?? "";
    } catch {
      // Si falla el parseo, usar el texto crudo como summary
      summary = rawJson;
    }
  }

  // Agregar advertencia automática si muestra pequeña
  const withFormatType = typedPieces.filter((p) => p.format_type).length;
  const pctClassified =
    typedPieces.length > 0
      ? Math.round((withFormatType / typedPieces.length) * 100)
      : 0;

  if (pctClassified < 30 && !sampleSizeNotes) {
    sampleSizeNotes = `Solo el ${pctClassified}% de las piezas en este rango tiene clasificación IA. Para obtener patrones más precisos, analizá más piezas desde la biblioteca de contenido.`;
  }

  // 5. Persistir en content_pattern_reports
  const contentIds = typedPieces.map((p) => p.id);

  const { data: insertedRow, error: insertError } = await supabase
    .from("content_pattern_reports")
    .insert({
      organization_id: organizationId,
      range_type: rangeType,
      range_value: rangeValue,
      content_ids: contentIds,
      top_formats: topFormats,
      top_hooks: topHooks,
      top_topics: topTopics,
      summary,
      suggestions,
      sample_size_notes: sampleSizeNotes,
    })
    .select()
    .single();

  if (insertError) throw new Error(insertError.message);

  const row = insertedRow as ContentPatternReport & {
    top_formats: PatternRankedItem[];
    top_hooks: PatternRankedItem[];
    top_topics: PatternRankedItem[];
  };

  return {
    id: row.id,
    organization_id: row.organization_id,
    range_type: row.range_type,
    range_value: row.range_value,
    content_ids: row.content_ids,
    top_formats: topFormats,
    top_hooks: topHooks,
    top_topics: topTopics,
    summary,
    suggestions,
    sample_size_notes: sampleSizeNotes,
    generated_at: row.generated_at,
  };
}

export async function getLatestContentPatternReportAction(): Promise<ContentPatternReport | null> {
  const organizationId = await requireOrganizationId();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("content_pattern_reports")
    .select("*")
    .eq("organization_id", organizationId)
    .order("generated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;

  return data as ContentPatternReport;
}
