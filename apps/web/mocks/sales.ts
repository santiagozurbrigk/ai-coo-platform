import { mockFinanceSummary } from "@/mocks/finance";
import type {
  Conversation,
  FrequentObjection,
  LeadQualificationScore,
  SalesMetricsData,
} from "@/types/sales";
import { DAY_LABELS_ES } from "@/lib/format";
import { getQualificationTier } from "@/lib/sales/qualification-score";

function leadScore(
  overall: number,
  engagement: number,
  intent: number,
  qualification: number
): LeadQualificationScore {
  return {
    overall,
    tier: getQualificationTier(overall),
    engagement,
    intent,
    qualification,
  };
}

export const mockConversations: Conversation[] = [
  {
    id: "c1",
    leadName: "María González",
    status: "active",
    tag: "muy-calificado",
    lastMessage: "Genial, mándame el link del calendario",
    lastMessageAt: "2026-05-21T14:32:00Z",
    unread: true,
    messages: [
      { id: "m1", sender: "lead", content: "¡Hola! Vi tu programa en IG", timestamp: "2026-05-21T10:00:00Z" },
      { id: "m2", sender: "team", content: "¡Hola María! ¿En qué estás trabajando ahora mismo?", timestamp: "2026-05-21T10:15:00Z" },
      { id: "m3", sender: "lead", content: "Genial, mándame el link del calendario", timestamp: "2026-05-21T14:32:00Z" },
    ],
    analysis: {
      responseTimeMinutes: 15,
      ghostingRisk: "low",
      bookingSignal: true,
      insights: ["Flujo de calificación sólido", "Link de calendario enviado — agendamiento probable"],
      qualificationScore: leadScore(88, 92, 85, 86),
    },
  },
  {
    id: "c2",
    leadName: "James Chen",
    status: "ghosted",
    tag: "descalificado",
    lastMessage: "Déjame pensarlo",
    lastMessageAt: "2026-05-19T18:00:00Z",
    unread: false,
    messages: [
      { id: "m4", sender: "lead", content: "¿Cuál es el precio?", timestamp: "2026-05-19T16:00:00Z" },
      { id: "m5", sender: "team", content: "Con gusto te explico las opciones en una llamada rápida", timestamp: "2026-05-19T17:00:00Z" },
      { id: "m6", sender: "lead", content: "Déjame pensarlo", timestamp: "2026-05-19T18:00:00Z" },
    ],
    analysis: {
      responseTimeMinutes: 60,
      ghostingRisk: "high",
      bookingSignal: false,
      insights: ["Estancado después del precio", "Sin follow-up en 48h"],
      qualificationScore: leadScore(32, 28, 35, 30),
    },
  },
  {
    id: "c3",
    leadName: "Sofía Martins",
    status: "booked",
    tag: "agendado",
    lastMessage: "¡Agendado! Nos vemos el martes",
    lastMessageAt: "2026-05-20T11:00:00Z",
    unread: false,
    messages: [
      { id: "m7", sender: "lead", content: "¡Agendado! Nos vemos el martes", timestamp: "2026-05-20T11:00:00Z" },
    ],
    analysis: {
      responseTimeMinutes: 8,
      ghostingRisk: "low",
      bookingSignal: true,
      insights: ["Lenguaje de confirmación detectado", "Camino rápido al agendamiento"],
      qualificationScore: leadScore(79, 84, 78, 74),
    },
  },
  {
    id: "c4",
    leadName: "Martín Rodríguez",
    status: "booked",
    tag: "agendado",
    lastMessage: "Perfecto, nos vemos el lunes",
    lastMessageAt: "2026-05-21T09:00:00Z",
    unread: false,
    messages: [
      { id: "m8", sender: "lead", content: "Perfecto, nos vemos el lunes", timestamp: "2026-05-21T09:00:00Z" },
    ],
    analysis: {
      responseTimeMinutes: 12,
      ghostingRisk: "low",
      bookingSignal: true,
      insights: ["Llamada de cierre agendada vía Calendly"],
      qualificationScore: leadScore(82, 80, 88, 79),
    },
  },
  {
    id: "c5",
    leadName: "Laura Gómez",
    status: "active",
    tag: "closeado",
    lastMessage: "Listo, ya hice el pago",
    lastMessageAt: "2026-05-24T16:30:00Z",
    unread: false,
    messages: [
      { id: "m9", sender: "lead", content: "Listo, ya hice el pago", timestamp: "2026-05-24T16:30:00Z" },
    ],
    analysis: {
      responseTimeMinutes: 5,
      ghostingRisk: "low",
      bookingSignal: true,
      insights: ["Cerrado — upfront $3.000"],
      qualificationScore: leadScore(95, 96, 94, 95),
    },
  },
  {
    id: "c6",
    leadName: "Diego Fernández",
    status: "active",
    tag: "no-closeado",
    lastMessage: "El precio se me va del presupuesto",
    lastMessageAt: "2026-05-23T12:00:00Z",
    unread: true,
    messages: [
      { id: "m10", sender: "lead", content: "El precio se me va del presupuesto", timestamp: "2026-05-23T12:00:00Z" },
    ],
    analysis: {
      responseTimeMinutes: 20,
      ghostingRisk: "medium",
      bookingSignal: false,
      insights: ["Objeción de precio — seguimiento recomendado"],
      qualificationScore: leadScore(55, 62, 48, 52),
    },
  },
  {
    id: "c7",
    leadName: "Camila Torres",
    status: "ghosted",
    tag: "muy-descalificado",
    lastMessage: "No pude conectarme a la llamada",
    lastMessageAt: "2026-05-22T17:00:00Z",
    unread: false,
    messages: [
      { id: "m11", sender: "lead", content: "No pude conectarme a la llamada", timestamp: "2026-05-22T17:00:00Z" },
    ],
    analysis: {
      responseTimeMinutes: 0,
      ghostingRisk: "high",
      bookingSignal: false,
      insights: ["No show registrado en Closing"],
      qualificationScore: leadScore(28, 22, 30, 26),
    },
  },
  {
    id: "c8",
    leadName: "Andrés Méndez",
    status: "booked",
    tag: "calificado",
    lastMessage: "Confirmado para el martes 9am",
    lastMessageAt: "2026-05-21T15:00:00Z",
    unread: false,
    messages: [
      { id: "m12", sender: "lead", content: "Confirmado para el martes 9am", timestamp: "2026-05-21T15:00:00Z" },
    ],
    analysis: {
      responseTimeMinutes: 10,
      ghostingRisk: "low",
      bookingSignal: true,
      insights: ["Pre-calificado — formulario Calendly completo"],
      qualificationScore: leadScore(74, 78, 72, 71),
    },
  },
];

export const mockFrequentObjections: FrequentObjection[] = [
  {
    id: "obj-1",
    text: "El precio es muy alto",
    category: "closing",
    frequency: 8,
    conversationId: "c6",
    leadName: "Diego Fernández",
  },
  {
    id: "obj-2",
    text: "No tengo tiempo ahora",
    category: "setting",
    frequency: 5,
    conversationId: "c2",
    leadName: "James Chen",
  },
  {
    id: "obj-3",
    text: "No conozco el producto",
    category: "marketing",
    frequency: 3,
    conversationId: "c1",
    leadName: "María González",
  },
  {
    id: "obj-4",
    text: "Necesito consultarlo con mi pareja",
    category: "closing",
    frequency: 4,
    conversationId: "c2",
    leadName: "James Chen",
  },
  {
    id: "obj-5",
    text: "¿Pueden llamarme más tarde?",
    category: "setting",
    frequency: 3,
    conversationId: "c8",
    leadName: "Andrés Méndez",
  },
];

export const mockSalesMetrics: SalesMetricsData = {
  totalConversations: 342,
  bookingRate: 34.2,
  ghostingRate: 18.5,
  avgResponseMin: 22,
  messagesPerBooking: 14,
  activeConversations: 128,
  unansweredConversations: 17,
  bookingTrend: DAY_LABELS_ES.map((label, i) => ({
    label,
    value: [8, 12, 10, 15, 11, 6, 9][i] ?? 8,
  })),
  closerBreakdown: mockFinanceSummary.closerBreakdown,
};
