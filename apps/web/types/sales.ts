import type { ConversationStatus } from "@ai-coo/types";
import type { CloserPerformance } from "@/types/finance";

export type SalesMessage = {
  id: string;
  /** Respuesta del negocio (sin atribución individual — ManyChat). */
  sender: "lead" | "team";
  content: string;
  timestamp: string;
};

export type QualificationTier = "low" | "medium" | "high";

export type ConversationAiLabel = "hot" | "warm" | "cold" | "unqualified";

export type LeadQualificationScore = {
  /** Score final 1–100 */
  overall: number;
  tier: QualificationTier;
  engagement: number;
  intent: number;
  qualification: number;
};

export type ConversationAnalysis = {
  responseTimeMinutes: number;
  ghostingRisk: "low" | "medium" | "high";
  bookingSignal: boolean;
  insights: string[];
  /** Scoring automático de calificación del lead (mock / Phase 2 IA) */
  qualificationScore?: LeadQualificationScore;
};

export type ConversationTagId =
  | "muy-calificado"
  | "calificado"
  | "descalificado"
  | "muy-descalificado"
  | "agendado"
  | "closeado"
  | "no-closeado";

export type ConversationSource = "manychat" | "instagram" | "manual";

export type Conversation = {
  id: string;
  leadName: string;
  status: ConversationStatus;
  tag?: ConversationTagId | null;
  lastMessage: string;
  lastMessageAt: string;
  unread: boolean;
  messages: SalesMessage[];
  analysis: ConversationAnalysis;
  source?: ConversationSource;
  aiScore?: number;
  aiLabel?: ConversationAiLabel;
  aiSummary?: string;
  aiBookingSignals?: string[];
  aiGhostingSignals?: string[];
  aiDetectedObjections?: Array<{ text: string; category: ObjectionCategory }>;
  aiRecommendedAction?: string;
  sourceVideoTitle?: string;
  utmCampaign?: string;
  lastAnalyzedAt?: string;
};

export type ObjectionCategory = "closing" | "setting" | "marketing";

export type FrequentObjection = {
  id: string;
  text: string;
  category: ObjectionCategory;
  frequency: number;
  conversationId: string;
  leadName: string;
};

export type ObjectionTrend = "up" | "down" | "stable";

export type FrequentObjectionSummary = {
  category: ObjectionCategory;
  count: number;
  resolutionRate: number;
  topExamples: string[];
  trend: ObjectionTrend;
  trendPct: number;
  alert?: string;
};

export type FrequentObjectionsDataSource = "calls" | "conversations" | "mock";

export type FrequentObjectionsResult = {
  objections: FrequentObjectionSummary[];
  dataSource: FrequentObjectionsDataSource;
};

export type SalesMetricsData = {
  totalConversations: number;
  bookingRate: number;
  ghostingRate: number;
  avgResponseMin: number;
  messagesPerBooking: number;
  activeConversations: number;
  unansweredConversations: number;
  bookingTrend: { label: string; value: number }[];
  closerBreakdown: CloserPerformance[];
};
