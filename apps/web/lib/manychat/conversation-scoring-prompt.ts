import { wrapUntrustedContent } from "@/lib/ai/wrap-untrusted-content";

export type ConversationScoringMessage = {
  sender: string;
  message: string;
  timestamp: string;
};

export function buildConversationScoringPrompt(
  messages: ConversationScoringMessage[],
  leadInfo: {
    name?: string;
    formAnswers?: Record<string, string>;
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

  const orgContextText = orgContext
    ? `\nContexto del negocio: ${orgContext.businessType ?? "infoproducto"},
       producto: ${orgContext.productName ?? "no especificado"},
       audiencia: ${orgContext.targetAudience ?? "no especificada"}`
    : "";

  const system =
    "Sos un experto en análisis de conversaciones de ventas de alto ticket para negocios de infoproductos latinoamericanos. Respondé ÚNICAMENTE con un objeto JSON válido, sin markdown ni texto adicional.";

  const user = `Analizá esta conversación de Instagram/WhatsApp y devolvé un análisis estructurado en JSON.

LEAD: ${leadInfo.name ?? "Desconocido"}
${formContext}
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
  "recommended_action": "<acción concreta para el setter, ej: 'Enviar caso de éxito y hacer seguimiento en 24hs'>"
}

CRITERIOS DE SCORING:
- hot (80-100): intención clara, calificado, listo para agendar
- warm (50-79): interesado pero con dudas o necesita más nurturing
- cold (20-49): poco engagement o señales negativas
- unqualified (0-19): no cumple el perfil o claramente no va a comprar`;

  return { system, user };
}
