import type { Client } from "@/types/clients";

export const mockClients: Client[] = [
  {
    id: "client1",
    name: "Laura Gómez",
    joinDate: "2026-05-24",
    paymentType: "upfront",
    platform: "stripe",
    totalAmount: 3000,
    status: "onboarding_done",
    isSuccessCase: false,
    salesFathomUrl: "https://fathom.video/mock/laura-gomez",
    closingCallId: "cl2",
    aiInsights: [
      "Este cliente cerró en la primera llamada — perfil de alta intención.",
      "Pago upfront completado — riesgo de churn bajo.",
    ],
    linkedCalls: [
      {
        id: "fc1",
        title: "Llamada de cierre — Laura Gómez",
        date: "2026-05-24",
        duration: "42 min",
        url: "https://fathom.video/mock/laura-gomez",
      },
    ],
  },
  {
    id: "client2",
    name: "Carlos Vega",
    joinDate: "2026-05-10",
    paymentType: "installments",
    platform: "mercadopago",
    totalAmount: 3000,
    status: "active",
    isSuccessCase: false,
    installments: [
      {
        id: "i1",
        label: "Cuota 1",
        amount: 1000,
        status: "paid",
        proofLabel: "comprobante-mayo.pdf",
      },
      {
        id: "i2",
        label: "Cuota 2",
        amount: 1000,
        status: "paid",
        proofLabel: "comprobante-junio-1.pdf",
      },
      {
        id: "i3",
        label: "Cuota 3",
        amount: 1000,
        status: "pending",
        dueDate: "2026-06-15",
      },
    ],
    aiInsights: [
      "Cuota 2 pendiente de seguimiento — recordatorio automático sugerido.",
      "Perfil similar a 2 casos de éxito en delivery.",
    ],
    linkedCalls: [],
  },
  {
    id: "client3",
    name: "Sofía Herrera",
    joinDate: "2026-04-15",
    paymentType: "upfront",
    platform: "stripe",
    totalAmount: 5000,
    status: "success_case",
    isSuccessCase: true,
    aiInsights: [
      "Caso de éxito — NPS 9 en onboarding.",
      "Referidos: 2 leads calificados en las últimas 4 semanas.",
    ],
    linkedCalls: [
      {
        id: "fc2",
        title: "Check-in mensual — Sofía Herrera",
        date: "2026-05-12",
        duration: "28 min",
        url: "https://fathom.video/mock/sofia-checkin",
      },
    ],
  },
];

export function getClientById(id: string): Client | undefined {
  return mockClients.find((c) => c.id === id);
}
