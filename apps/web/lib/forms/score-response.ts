import { callClaudeJson } from "@/lib/ai/anthropic";

export type FormScoringResult = {
  lead_score: number;
  qualification: "highly_qualified" | "qualified" | "not_qualified";
  key_insights: string[];
  qualification_reasoning: string;
};

export async function scoreFormResponse(params: {
  organizationId: string;
  formTitle: string;
  answersJson: string;
}): Promise<FormScoringResult | null> {
  const system = `Eres experto en calificación de leads para infoproductos.
Responde SOLO JSON en español.`;

  const user = `FORMULARIO: ${params.formTitle}
RESPUESTAS: ${params.answersJson}

JSON:
{
  "lead_score": 0-100,
  "qualification": "highly_qualified|qualified|not_qualified",
  "key_insights": ["..."],
  "qualification_reasoning": "..."
}`;

  return callClaudeJson<FormScoringResult>({
    organizationId: params.organizationId,
    model: "claude-haiku-4-5",
    feature: "form_lead_scoring",
    system,
    user,
    maxTokens: 1024,
  });
}

export async function analyzeFormPatterns(params: {
  organizationId: string;
  formTitle: string;
  responsesSample: string;
}): Promise<{
  ai_form_analysis: string;
  ai_drop_off_insights: string;
  ai_qualification_insights: string;
} | null> {
  const result = await callClaudeJson<{
    form_analysis: string;
    drop_off_insights: string;
    qualification_insights: string;
  }>({
    organizationId: params.organizationId,
    model: "claude-sonnet-4-5",
    feature: "form_pattern_analysis",
    system: "Analista de formularios de leads. Responde SOLO JSON en español.",
    user: `Formulario: ${params.formTitle}
Muestra de respuestas:
${params.responsesSample.slice(0, 80_000)}

JSON: {"form_analysis":"...","drop_off_insights":"...","qualification_insights":"..."}`,
    maxTokens: 2048,
  });

  if (!result) return null;
  return {
    ai_form_analysis: result.form_analysis,
    ai_drop_off_insights: result.drop_off_insights,
    ai_qualification_insights: result.qualification_insights,
  };
}
