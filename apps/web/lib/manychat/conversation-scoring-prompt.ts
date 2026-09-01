import type { ClosingCallStatus } from "@/types/closing";
import { wrapUntrustedContent } from "@/lib/ai/wrap-untrusted-content";
import type {
  ConversationFunnelStage,
  ConversationTagId,
} from "@/types/sales";

export type ConversationScoringMessage = {
  sender: string;
  message: string;
  timestamp: string;
};

export type ClosingCallHint = {
  status: ClosingCallStatus;
  scheduledAt: string;
};

export type CrossChannelContext = {
  source: "instagram";
  summary?: string;
  messagesText: string;
};

const FUNNEL_STAGE_LABELS: Record<ConversationFunnelStage, string> = {
  primer_contacto: "Primer contacto",
  calificando: "Calificando",
  manejo_objeciones: "Manejo de objeciones",
  propuesta_agendamiento_enviada: "Propuesta de agendamiento enviada",
  agendado: "Agendado",
  no_show: "No show",
  cerrado: "Cerrado",
  perdido_sin_respuesta: "Perdido sin respuesta",
};

export function getFunnelStageLabel(stage: ConversationFunnelStage): string {
  return FUNNEL_STAGE_LABELS[stage];
}

export function buildConversationScoringPrompt(
  messages: ConversationScoringMessage[],
  leadInfo: {
    name?: string;
    formAnswers?: Record<string, string>;
    closingCall?: ClosingCallHint;
    crossChannel?: CrossChannelContext;
  },
  orgContext?: {
    businessType?: string;
    productName?: string;
    targetAudience?: string;
  }
): { system: string; user: string } {
  const messagesText = messages
    .slice(-20)
    .map((m) => `[${m.sender === "lead" ? "LEAD" : "SETTER"}]: ${m.message}`)
    .join("\n");

  const formContext = leadInfo.formAnswers
    ? `\nRespuestas del formulario pre-agenda:\n${wrapUntrustedContent(
        "respuestas_formulario",
        Object.entries(leadInfo.formAnswers)
          .map(([q, a]) => `- ${q}: ${a}`)
          .join("\n")
      )}`
    : "";

  const closingCallContext = leadInfo.closingCall
    ? `\nLlamada de cierre registrada (priorizá esto sobre el chat para etapas agendado/no_show/cerrado):
- Estado: ${leadInfo.closingCall.status}
- Fecha agendada: ${leadInfo.closingCall.scheduledAt}`
    : "";

  const crossChannelContext = leadInfo.crossChannel
    ? `\nContexto cruzado desde ${leadInfo.crossChannel.source} (mismo lead en otro canal):
${leadInfo.crossChannel.summary ? `Resumen previo: ${leadInfo.crossChannel.summary}\n` : ""}
Mensajes relevantes:
${wrapUntrustedContent("conversacion_instagram", leadInfo.crossChannel.messagesText)}`
    : "";

  const orgContextText = orgContext
    ? `\nContexto del negocio: ${orgContext.businessType ?? "infoproducto"},
       producto: ${orgContext.productName ?? "no especificado"},
       audiencia: ${orgContext.targetAudience ?? "no especificada"}`
    : "";

  const system =
    "Sos un experto en análisis de conversaciones de ventas de alto ticket para negocios de infoproductos latinoamericanos. Respondé ÚNICAMENTE con un objeto JSON válido, sin markdown ni texto adicional. " +
    "Todos los campos de texto libre (summary, pain_point, cross_channel_summary, recommended_action, booking_signals, ghosting_signals, detected_objections) deben estar en español rioplatense/latinoamericano, sin anglicismos ni palabras en inglés (nada de warm, pain point, engagement, intent, etc.).";

  const user = `Analizá esta conversación de Instagram/WhatsApp y devolvé un análisis estructurado en JSON.

LEAD: ${leadInfo.name ?? "Desconocido"}
${formContext}
${closingCallContext}
${crossChannelContext}
${orgContextText}

CONVERSACIÓN:
${wrapUntrustedContent("conversacion", messagesText)}

Devolvé ÚNICAMENTE un objeto JSON válido con esta estructura:

{
  "overall_score": <0-100, probabilidad general de conversión>,
  "engagement_score": <0-100, qué tan comprometido está el lead>,
  "intent_score": <0-100, qué tan clara es la intención de compra>,
  "qualification_score": <0-100, qué tan calificado es el lead>,
  "label": <"hot" | "warm" | "cold" | "unqualified">,
  "summary": "<resumen de la conversación en 1-2 oraciones>",
  "lead_tag": <"muy-calificado" | "calificado" | "descalificado" | "muy-descalificado" | "agendado" | "closeado" | "no-closeado">,
  "pain_point": "<dolor principal del lead en una frase>",
  "funnel_stage": <"primer_contacto" | "calificando" | "manejo_objeciones" | "propuesta_agendamiento_enviada" | "agendado" | "no_show" | "cerrado" | "perdido_sin_respuesta">,
  "link_shared": <true si el setter o lead compartió un link genérico (no booking ni WhatsApp)>,
  "whatsapp_number_shared": <true si se compartió un número de WhatsApp en el chat>,
  "booking_link_shared": <true si se compartió un link de agendamiento/calendario>,
  "cross_channel_summary": "<mini-resumen de lo hablado en Instagram si hay contexto cruzado, o null>",
  "booking_signals": [
    "<señal positiva detectada, ej: 'Preguntó por el precio', 'Dijo que quiere empezar ya'>"
  ],
  "ghosting_signals": [
    "<señal de riesgo, ej: 'Tardó 2 días en responder', 'Respuestas muy cortas'>"
  ],
  "detected_objections": [
    {
      "text": "<objeción detectada>",
      "category": "<'closing' | 'setting' | 'marketing'>"
    }
  ],
  "recommended_action": "<acción concreta para MOVER al lead a la SIGUIENTE etapa del proceso de agendamiento según funnel_stage>"
}

CRITERIOS DE SCORING:
- hot (80-100): intención clara, calificado, listo para agendar
- warm (50-79): interesado pero con dudas o necesita más nurturing
- cold (20-49): poco engagement o señales negativas
- unqualified (0-19): no cumple el perfil o claramente no va a comprar

ETIQUETAS (lead_tag):
- muy-calificado / calificado / descalificado / muy-descalificado según fit con el negocio
- agendado si hay llamada confirmada o intención clara de agendar
- closeado / no-closeado según resultado de cierre si aplica

ETAPAS (funnel_stage): si hay llamada de cierre registrada, usala para agendado/no_show/cerrado en lugar de inferir solo del chat.`;

  return { system, user };
}

export const VALID_CONVERSATION_TAGS = new Set<ConversationTagId>([
  "muy-calificado",
  "calificado",
  "descalificado",
  "muy-descalificado",
  "agendado",
  "closeado",
  "no-closeado",
]);

export const VALID_FUNNEL_STAGES = new Set<ConversationFunnelStage>([
  "primer_contacto",
  "calificando",
  "manejo_objeciones",
  "propuesta_agendamiento_enviada",
  "agendado",
  "no_show",
  "cerrado",
  "perdido_sin_respuesta",
]);
