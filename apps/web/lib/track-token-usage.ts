import { createAdminClient } from "@/lib/supabase/admin";

export const MODEL_PRICING = {
  "claude-haiku-4-5": {
    input: 0.00000025,
    output: 0.00000125,
  },
  "claude-sonnet-4-5": {
    input: 0.000003,
    output: 0.000015,
  },
  "claude-opus-4-5": {
    input: 0.000015,
    output: 0.000075,
  },
  /** Alias cortos usados en UI */
  "claude-haiku": {
    input: 0.00000025,
    output: 0.00000125,
  },
  "claude-sonnet": {
    input: 0.000003,
    output: 0.000015,
  },
  "claude-opus": {
    input: 0.000015,
    output: 0.000075,
  },
} as const;

export type TokenUsageModel = keyof typeof MODEL_PRICING;

export type TokenUsageParams = {
  organizationId: string;
  model: TokenUsageModel;
  inputTokens: number;
  outputTokens: number;
  feature?: string;
};

export function computeTokenCostUsd(
  model: TokenUsageModel,
  inputTokens: number,
  outputTokens: number
): { inputCost: number; outputCost: number; totalCost: number } {
  const pricing = MODEL_PRICING[model];
  if (!pricing) {
    throw new Error(`Modelo de precios desconocido: ${model}`);
  }
  const inputCost = inputTokens * pricing.input;
  const outputCost = outputTokens * pricing.output;
  return {
    inputCost,
    outputCost,
    totalCost: inputCost + outputCost,
  };
}

/** Registrar uso de tokens (Phase 2: llamar desde Server Actions de IA). */
export async function trackTokenUsage({
  organizationId,
  model,
  inputTokens,
  outputTokens,
  feature,
}: TokenUsageParams): Promise<void> {
  const { inputCost, outputCost, totalCost } = computeTokenCostUsd(
    model,
    inputTokens,
    outputTokens
  );

  const admin = createAdminClient();
  const { error } = await admin.from("token_usage").insert({
    organization_id: organizationId,
    model,
    input_tokens: inputTokens,
    output_tokens: outputTokens,
    input_cost_usd: inputCost,
    output_cost_usd: outputCost,
    total_cost_usd: totalCost,
    feature: feature ?? null,
  });

  if (error) {
    console.error("[trackTokenUsage]", error.message);
    throw new Error(error.message);
  }
}
