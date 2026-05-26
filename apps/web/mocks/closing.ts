import type { ClosingCall } from "@/types/closing";

const DEFAULT_FORM: ClosingCall["formAnswers"] = [
  {
    question: "¿Cuál es tu facturación mensual actual?",
    answer: "$8.000 – $12.000",
  },
  {
    question: "¿Cuál es tu mayor desafío ahora mismo?",
    answer: "Escalar ventas sin depender del fundador en cada llamada",
  },
  {
    question: "¿Qué has probado antes?",
    answer: "Setter externo + curso de ads, sin proceso de cierre claro",
  },
  {
    question: "¿Por qué quieres unirte ahora?",
    answer: "Tengo pipeline lleno y necesito cerrar con consistencia",
  },
  {
    question: "¿Estás listo para invertir en resolver esto?",
    answer: "Sí, si veo un plan claro en la llamada",
  },
];

export const mockClosingCalls: ClosingCall[] = [
  {
    id: "cl1",
    leadName: "Martín Rodríguez",
    scheduledAt: "2026-05-26T10:00:00Z",
    status: "scheduled",
    conversationId: "c4",
    formAnswers: DEFAULT_FORM,
  },
  {
    id: "cl2",
    leadName: "Laura Gómez",
    scheduledAt: "2026-05-24T15:00:00Z",
    status: "closed",
    conversationId: "c5",
    formAnswers: DEFAULT_FORM,
    fathomUrl: "https://fathom.video/mock/laura-gomez",
    outcome: { paymentType: "upfront", revenue: 3000 },
    closedByName: "Martín López",
    paymentSourcePlatformId: "pp-stripe",
    paymentDestinationPlatformId: "pp-wise",
  },
  {
    id: "cl3",
    leadName: "Diego Fernández",
    scheduledAt: "2026-05-23T11:00:00Z",
    status: "not_closed",
    conversationId: "c6",
    formAnswers: DEFAULT_FORM,
    outcome: { noCloseReason: "price", notes: "Quiere pensarlo hasta fin de mes" },
  },
  {
    id: "cl4",
    leadName: "Camila Torres",
    scheduledAt: "2026-05-22T16:00:00Z",
    status: "no_show",
    conversationId: "c7",
    formAnswers: DEFAULT_FORM,
  },
  {
    id: "cl5",
    leadName: "Andrés Méndez",
    scheduledAt: "2026-05-27T09:00:00Z",
    status: "scheduled",
    conversationId: "c8",
    formAnswers: DEFAULT_FORM,
  },
  {
    id: "cl6",
    leadName: "Valentina Ruiz",
    scheduledAt: "2026-05-26T14:30:00Z",
    status: "scheduled",
    conversationId: "c9",
    formAnswers: DEFAULT_FORM,
  },
  {
    id: "cl7",
    leadName: "Pablo Soto",
    scheduledAt: "2026-05-28T17:00:00Z",
    status: "scheduled",
    formAnswers: DEFAULT_FORM,
  },
];

export function getClosingCallById(id: string): ClosingCall | undefined {
  return mockClosingCalls.find((c) => c.id === id);
}
