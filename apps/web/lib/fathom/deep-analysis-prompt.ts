export type ScriptSection = {
  id: string;
  name: string;
  description: string;
  weight?: number;
};

export function buildDeepAnalysisPrompt(
  transcript: string,
  scriptSections: ScriptSection[],
  callMetadata: {
    closerName?: string;
    leadName?: string;
    duration?: number;
    formAnswers?: Record<string, string>;
  }
): string {
  const sectionsText = scriptSections
    .map((s) => `- ${s.name} (${s.id}): ${s.description}`)
    .join("\n");

  const formContext = callMetadata.formAnswers
    ? `\nRespuestas del formulario pre-agenda del lead:\n${Object.entries(
        callMetadata.formAnswers
      )
        .map(([q, a]) => `- ${q}: ${a}`)
        .join("\n")}`
    : "";

  return `Eres un experto en análisis de llamadas de ventas de alto ticket para negocios de infoproductos.

Analizá esta transcripción de llamada de ventas y devolvé un análisis estructurado en JSON.

DATOS DE LA LLAMADA:
- Closer: ${callMetadata.closerName ?? "No especificado"}
- Lead: ${callMetadata.leadName ?? "No especificado"}
- Duración: ${callMetadata.duration ? `${callMetadata.duration} minutos` : "No especificada"}
${formContext}

GUIÓN DE VENTAS DE LA ORGANIZACIÓN:
${sectionsText}

TRANSCRIPCIÓN:
${transcript.slice(0, 120_000)}

Analizá la llamada y devolvé ÚNICAMENTE un objeto JSON válido con esta estructura exacta:

{
  "overall_score": <número 0-100>,
  "script_adherence_pct": <número 0-100, qué % del guión siguió>,
  "section_scores": {
    ${scriptSections.map((s) => `"${s.id}": <número 0-100>`).join(",\n    ")}
  },
  "missing_steps": [
    "<paso específico que no hizo, ej: 'No hizo el CTA — terminó sin pedir el cierre'>",
    "<otro paso faltante>"
  ],
  "objections": [
    {
      "text": "<texto exacto o paráfrasis de la objeción del lead>",
      "category": "<'closing' | 'setting' | 'marketing'>",
      "handled": <true | false>,
      "resolution": "<cómo la manejó el closer, o vacío si no la manejó>"
    }
  ],
  "power_phrases": [
    "<frase efectiva que usó el closer>"
  ],
  "weak_phrases": [
    "<frase débil, muletilla o frase que perjudicó la llamada>"
  ],
  "filler_words_count": <número aproximado de muletillas como 'eh', 'o sea', 'tipo', 'básicamente'>,
  "lead_qualified": <true | false, basado en las respuestas del formulario y la conversación>,
  "booked": <true | false, si el lead agendó o mostró intención clara de agendar>,
  "sold": <true | false, si se cerró la venta en la llamada>,
  "summary": "<resumen ejecutivo de la llamada en 2-3 oraciones>",
  "strengths": [
    "<fortaleza específica del closer en esta llamada>"
  ],
  "improvements": [
    "<mejora concreta y accionable para el closer>"
  ],
  "form_vs_call_gap": "<si hay diferencia entre el score del formulario y el desempeño real en llamada, describila. Vacío si no hay datos del formulario>"
}

CATEGORÍAS DE OBJECIONES:
- closing: objeciones sobre dinero, tiempo, decisión ("no tengo plata", "necesito pensarlo", "tengo que consultarlo")
- setting: objeciones sobre el proceso de venta ("¿por qué tan caro?", "¿qué incluye exactamente?")
- marketing: objeciones sobre posicionamiento ("no entiendo cómo me ayudás", "estoy viendo otras opciones", "no sé si es para mí")

IMPORTANTE:
- Sé específico y concreto, no genérico
- Si el closer no hizo algo, decilo claramente en missing_steps
- Las power_phrases y weak_phrases deben ser frases reales de la transcripción
- El overall_score debe reflejar la probabilidad de que esta llamada haya resultado en venta
- Devolvé SOLO el JSON, sin texto adicional, sin markdown`;
}
