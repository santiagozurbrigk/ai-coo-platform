import { callClaudeJson } from "@/lib/ai/anthropic";

export type FathomAnalysisResult = {
  situation_summary: string;
  next_steps: string[];
  problems_detected: string[];
  progress_vs_previous: string;
  progress_indicator: "improving" | "stable" | "declining" | "unknown";
  call_type: "delivery" | "consulting" | "vision" | "team" | "other";
};

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
