import type { LeadQualificationScore, QualificationTier } from "@/types/sales";

export function getQualificationTier(score: number): QualificationTier {
  if (score >= 70) return "high";
  if (score >= 45) return "medium";
  return "low";
}

export function getQualificationTierLabel(tier: QualificationTier): string {
  if (tier === "high") return "Alto";
  if (tier === "medium") return "Medio";
  return "Bajo";
}

export function formatQualificationScore(score: LeadQualificationScore): string {
  return `${score.overall} · ${getQualificationTierLabel(score.tier)}`;
}
