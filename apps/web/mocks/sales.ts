import { mockFinanceSummary } from "@/mocks/finance";
import type { Conversation, SalesMetricsData } from "@/types/sales";
import { DAY_LABELS_ES } from "@/lib/format";

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
    },
  },
];

export const mockSalesMetrics: SalesMetricsData = {
  totalConversations: 342,
  bookingRate: 34.2,
  ghostingRate: 18.5,
  avgResponseMin: 22,
  messagesPerBooking: 14,
  followUpDelayHours: 4.2,
  activeConversations: 128,
  unansweredConversations: 17,
  bookingTrend: DAY_LABELS_ES.map((label, i) => ({
    label,
    value: [8, 12, 10, 15, 11, 6, 9][i] ?? 8,
  })),
  closerBreakdown: mockFinanceSummary.closerBreakdown,
};
