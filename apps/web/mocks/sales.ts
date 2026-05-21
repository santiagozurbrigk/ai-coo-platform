import type { Conversation, SalesMetricsData } from "@/types/sales";
import { DAY_LABELS_ES } from "@/lib/format";

export const mockConversations: Conversation[] = [
  {
    id: "c1",
    leadName: "María González",
    setterName: "Alex Rivera",
    status: "active",
    lastMessage: "Genial, mándame el link del calendario",
    lastMessageAt: "2026-05-21T14:32:00Z",
    unread: true,
    messages: [
      { id: "m1", sender: "lead", content: "¡Hola! Vi tu programa en IG", timestamp: "2026-05-21T10:00:00Z" },
      { id: "m2", sender: "setter", content: "¡Hola María! ¿En qué estás trabajando ahora mismo?", timestamp: "2026-05-21T10:15:00Z" },
      { id: "m3", sender: "lead", content: "Genial, mándame el link del calendario", timestamp: "2026-05-21T14:32:00Z" },
    ],
    analysis: {
      responseTimeMinutes: 15,
      ghostingRisk: "low",
      bookingSignal: true,
      insights: ["Flujo de calificación sólido", "Link de calendario enviado — agendamiento probable"],
    },
  },
  {
    id: "c2",
    leadName: "James Chen",
    setterName: "Jordan Lee",
    status: "ghosted",
    lastMessage: "Déjame pensarlo",
    lastMessageAt: "2026-05-19T18:00:00Z",
    unread: false,
    messages: [
      { id: "m4", sender: "lead", content: "¿Cuál es el precio?", timestamp: "2026-05-19T16:00:00Z" },
      { id: "m5", sender: "setter", content: "Con gusto te explico las opciones en una llamada rápida", timestamp: "2026-05-19T17:00:00Z" },
      { id: "m6", sender: "lead", content: "Déjame pensarlo", timestamp: "2026-05-19T18:00:00Z" },
    ],
    analysis: {
      responseTimeMinutes: 60,
      ghostingRisk: "high",
      bookingSignal: false,
      insights: ["Estancado después del precio", "Sin follow-up en 48h"],
    },
  },
  {
    id: "c3",
    leadName: "Sofía Martins",
    setterName: "Alex Rivera",
    status: "booked",
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
    },
  },
];

export const mockSalesMetrics: SalesMetricsData = {
  bookingRate: 34.2,
  ghostingRate: 18.5,
  avgResponseMin: 22,
  messagesPerBooking: 14,
  activeConversations: 128,
  setterMetrics: [
    { setterId: "1", name: "Alex Rivera", bookingRate: 42, ghostingRate: 12, avgResponseMin: 15, activeConversations: 48 },
    { setterId: "2", name: "Jordan Lee", bookingRate: 28, ghostingRate: 24, avgResponseMin: 31, activeConversations: 52 },
    { setterId: "3", name: "Sam Ortiz", bookingRate: 31, ghostingRate: 19, avgResponseMin: 25, activeConversations: 28 },
  ],
  bookingTrend: DAY_LABELS_ES.map((label, i) => ({
    label,
    value: [8, 12, 10, 15, 11, 6, 9][i] ?? 8,
  })),
};
