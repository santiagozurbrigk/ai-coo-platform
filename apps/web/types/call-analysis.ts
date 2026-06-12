import type { ObjectionCategory } from "@/types/sales";

export type CallObjectionDetail = {
  text: string;
  category: ObjectionCategory;
  handled: boolean;
  resolution?: string;
  suggestion?: string;
};

export type DeepCallAnalysis = {
  overallScore: number;
  scriptAdherencePct: number;
  sectionScores: Record<string, number>;
  missingSteps: string[];
  objections: CallObjectionDetail[];
  powerPhrases: string[];
  weakPhrases: string[];
  fillerWordsCount: number;
  strengths: string[];
  improvements: string[];
  leadQualified?: boolean;
  booked: boolean;
  sold: boolean;
  leadName?: string;
  durationMinutes?: number;
};

export type TeamRankingTrend = "up" | "down" | "stable";

export type TeamRankingEntry = {
  name: string;
  score: number;
  calls: number;
  bookings: number;
  conversion: string;
  trend: TeamRankingTrend;
};
