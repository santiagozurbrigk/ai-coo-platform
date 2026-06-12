import { callClaudeJson } from "@/lib/ai/anthropic";

export type FathomAnalysisResult = {
  situation_summary: string;
  next_steps: string[];
  problems_detected: string[];
  progress_vs_previous: string;
  progress_indicator: "improving" | "stable" | "declining" | "unknown";
  call_type: "delivery" | "consulting" | "vision" | "team" | "other";
};

// TODO: Phase 2 — BullMQ queue `fathom-analysis` para procesar async
// TODO: Phase 2 — usar claude-haiku-4-5 para tagging; Sonnet para resumen ejecutivo
// TODO: Phase 2 — implementar prompt caching aquí (SOPs, contexto org)
//
// TODO: Phase 2 — Análisis profundo de llamada
// 1. Cargar guión activo de la org (sales_scripts)
// 2. Prompt Claude Sonnet con transcripción + guión
// 3. Claude evalúa cada sección (0-100)
// 4. Detecta y categoriza objeciones (closing/setting/marketing)
// 5. Identifica power phrases y weak phrases
// 6. Lista pasos faltantes
// 7. Guarda en call_analyses
// Modelo: claude-sonnet-4-6
// Caching: cachear el guión de la org

export async function analyzeFathomTranscript(params: {
  organizationId: string;
  clientName: string;
  transcript: string;
  previousCallsSummary: string;
}): Promise<FathomAnalysisResult | null> {
  const system = `Eres el sistema de inteligencia operacional de una empresa de infoproductos.
Analiza transcripts de llamadas de entrega/consultoría con clientes.
Responde SOLO JSON válido en español.`;

  const user = `CLIENTE: ${params.clientName}
LLAMADAS ANTERIORES: ${params.previousCallsSummary || "Ninguna"}
TRANSCRIPT:
${params.transcript.slice(0, 120_000)}

Responde SOLO en JSON:
{
  "situation_summary": "2-3 oraciones",
  "next_steps": ["paso 1", "paso 2"],
  "problems_detected": ["problema 1"],
  "progress_vs_previous": "texto o Primera llamada",
  "progress_indicator": "improving | stable | declining | unknown",
  "call_type": "delivery | consulting | vision | team | other"
}`;

  return callClaudeJson<FathomAnalysisResult>({
    organizationId: params.organizationId,
    model: "claude-sonnet-4-5",
    feature: "fathom_call_analysis",
    system,
    user,
    maxTokens: 2048,
  });
}
