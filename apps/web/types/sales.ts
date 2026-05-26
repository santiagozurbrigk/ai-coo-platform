import type { ConversationStatus } from "@ai-coo/types";
import type { CloserPerformance } from "@/types/finance";

export type SalesMessage = {
  id: string;
  /** Respuesta del negocio (sin atribución individual — ManyChat). */
  sender: "lead" | "team";
  content: string;
  timestamp: string;
};

export type ConversationAnalysis = {
  responseTimeMinutes: number;
  ghostingRisk: "low" | "medium" | "high";
  bookingSignal: boolean;
  insights: string[];
};

export type ConversationTagId =
  | "muy-calificado"
  | "calificado"
  | "descalificado"
  | "muy-descalificado"
  | "agendado"
  | "closeado"
  | "no-closeado";

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
};

export type SalesMetricsData = {
  totalConversations: number;
  bookingRate: number;
  ghostingRate: number;
  avgResponseMin: number;
  messagesPerBooking: number;
  followUpDelayHours: number;
  activeConversations: number;
  unansweredConversations: number;
  bookingTrend: { label: string; value: number }[];
  closerBreakdown: CloserPerformance[];
};
