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
        analysis: {
          scriptFollowed: "yes",
          objections: [
            { text: "¿Hay garantía de resultados?", category: "closing" },
            { text: "Prefiero empezar el mes que viene", category: "setting" },
          ],
          overallScore: 9,
          wentWell: [
            "Apertura con rapport y validación del dolor",
            "Cierre directo con link de pago enviado en vivo",
            "Manejo de objeción de garantía con caso de éxito",
          ],
          toImprove: [
            "Confirmar próximos pasos de onboarding antes de cortar",
          ],
        },
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
        paidAt: "2026-05-10",
        proofLabel: "comprobante-mayo.pdf",
      },
      {
        id: "i2",
        label: "Cuota 2",
        amount: 1000,
        status: "paid",
        paidAt: "2026-04-20",
        proofLabel: "comprobante-abril.pdf",
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
    linkedCalls: [
      {
        id: "fc3",
        title: "Discovery — Carlos Vega",
        date: "2026-05-08",
        duration: "35 min",
        url: "https://fathom.video/mock/carlos-discovery",
        analysis: {
          scriptFollowed: "partial",
          objections: [
            { text: "El precio es muy alto", category: "closing" },
            { text: "Necesito pensarlo", category: "closing" },
          ],
          overallScore: 6,
          wentWell: [
            "Buen diagnóstico de situación actual del lead",
            "Preguntas de calificación completas",
          ],
          toImprove: [
            "No ancló valor antes de presentar precio",
            "Cierre débil — sin fecha concreta de follow-up",
            "Saltó la sección de urgencia del guión",
          ],
        },
      },
    ],
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
        analysis: {
          scriptFollowed: "yes",
          objections: [],
          overallScore: 8,
          wentWell: [
            "Cliente reporta avances concretos en revenue",
            "Identificó oportunidad de upsell a programa avanzado",
            "Tono consultivo y celebración de wins",
          ],
          toImprove: [
            "Documentar compromisos del cliente en CRM",
            "Agendar próximo check-in antes de finalizar",
          ],
        },
      },
    ],
  },
];

export function getClientById(id: string): Client | undefined {
  return mockClients.find((c) => c.id === id);
}
