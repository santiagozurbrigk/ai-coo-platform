const DOCUMENT_KEYWORDS =
  /\b(sop|procedimiento|proceso documentado|reporte|informe|resumen|propuesta|gu[ií]a|template|plantilla|manual|documento|playbook|checklist|onboarding)\b/i;

const CREATE_VERBS =
  /\b(cre[aá]|gener[aá]|escrib[ií]|redact[aá]|arm[aá]|hac[eé]|haceme|hacé|diseñ[aá]|elabor[aá]|prepar[aá])\b/i;

const LONG_CONTENT_HINT =
  /\b(detallad[oa]|completo|extenso|estructurad[oa]|paso a paso|por secciones)\b/i;

/** Detecta si el mensaje del usuario pide crear un documento largo estructurado. */
export function detectCanvasIntent(message: string): boolean {
  const text = message.trim();
  if (text.length < 12) return false;

  if (DOCUMENT_KEYWORDS.test(text) && CREATE_VERBS.test(text)) {
    return true;
  }

  if (CREATE_VERBS.test(text) && LONG_CONTENT_HINT.test(text)) {
    return true;
  }

  if (/^(crea|genera|escribe|redacta|arm[aá])\b/i.test(text) && text.length > 40) {
    return true;
  }

  return false;
}

export function resolveAgentFlags(
  message: string,
  flags?: { useWebSearch?: boolean; useThink?: boolean; useCanvas?: boolean }
) {
  const useCanvas = Boolean(flags?.useCanvas || detectCanvasIntent(message));
  return {
    useWebSearch: flags?.useWebSearch,
    useThink: flags?.useThink,
    useCanvas,
  };
}
