import type { ConversationStatus } from "@ai-coo/types";

export type SalesMessage = {
  id: string;
  sender: "lead" | "setter";
  content: string;
  timestamp: string;
};

export type ConversationAnalysis = {
  responseTimeMinutes: number;
  ghostingRisk: "low" | "medium" | "high";
  bookingSignal: boolean;
  insights: string[];
};

export type Conversation = {
  id: string;
  leadName: string;
  setterName: string;
  status: ConversationStatus;
  lastMessage: string;
  lastMessageAt: string;
  unread: boolean;
  messages: SalesMessage[];
  analysis: ConversationAnalysis;
};

export type SetterMetric = {
  setterId: string;
  name: string;
  bookingRate: number;
  ghostingRate: number;
  avgResponseMin: number;
  activeConversations: number;
};

export type SalesMetricsData = {
  bookingRate: number;
  ghostingRate: number;
  avgResponseMin: number;
  messagesPerBooking: number;
  activeConversations: number;
  setterMetrics: SetterMetric[];
  bookingTrend: { label: string; value: number }[];
};
