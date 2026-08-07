import type { ContentCtaType, ContentFormatType, ContentHookType, ContentMetrics } from "@/types/content";

export function buildContentAnalysisPrompt(piece: {
  caption?: string | null;
  hashtags?: string[] | null;
  metrics?: ContentMetrics | null;
  transcript?: string | null;
  hasImages: boolean;
}): string {
  const contentContext = [
    piece.caption ? `Caption del post: "${piece.caption}"` : null,
    piece.hashtags?.length ? `Hashtags: ${piece.hashtags.join(", ")}` : null,
    piece.transcript
      ? `Transcripción del video:\n"""\n${piece.transcript}\n"""`
      : null,
    piece.metrics
      ? `Métricas: ${piece.metrics.likes ?? 0} likes, ${piece.metrics.comments ?? 0} comentarios, ${piece.metrics.shares ?? 0} compartidos, ${piece.metrics.saves ?? 0} guardados`
      : null,
  ]
    .filter(Boolean)
    .join("\n\n");

  return `Sos un estratega de contenido experto. Analizá esta pieza de contenido y extraé su Formato, Dolor y Ángulo.

DEFINICIONES:
- FORMATO: La estructura/forma en que se graba y presenta el contenido (el "cómo se ve"), independientemente del tema. Ejemplos: "grabación de pantalla con celular narrando", "talking head directo a cámara", "videollamada entre dos personas", "carrusel con ilustraciones".
- DOLOR: El problema real y concreto que sufre el ICP (cliente ideal) en su día a día. Es el tema del contenido, no la forma. Ejemplos: "leads descalificados llegando a la llamada", "no saber qué contenido trae ventas reales", "comisiones calculadas a mano".
- ÁNGULO: La perspectiva específica o gancho desde donde se entra al dolor. El mismo dolor puede tener múltiples ángulos. Ejemplos para el dolor "leads descalificados": "contar que mi agente de IA falló", "mostrar el costo en plata de cada lead malo", "la frustración del closer".

INFORMACIÓN DE LA PIEZA:
${contentContext}

${piece.hasImages ? "Te paso capturas/imágenes del contenido para que las analices visualmente." : ""}

CLASIFICACIÓN ESTRUCTURADA — usá exactamente uno de los valores permitidos:

format_type (el formato narrativo principal):
  - storytime: historia narrada con desarrollo cronológico
  - talking_head: presenter directo a cámara sin recursos extra
  - pov: punto de vista inmersivo desde la perspectiva del usuario/cliente
  - listicle: lista de puntos o pasos numerados
  - green_screen: pantalla verde o fondo editado con recursos visuales
  - hot_take: opinión polémica o contraria a la norma
  - carousel: serie de slides/imágenes swipeables
  - otro: ninguno de los anteriores

hook_type (el tipo de gancho en los primeros 3 segundos):
  - dolor_directo: nombra el problema del ICP de forma directa
  - curiosidad: genera intriga o pregunta sin revelar la respuesta inmediatamente
  - contrarian: afirmación que va contra la creencia común
  - prueba_social: resultado, número o caso de éxito que valida la promesa
  - resultado: muestra el resultado final antes de explicar el proceso

cta_type (el llamado a la acción principal):
  - dm: pide que manden un DM o mensaje directo
  - comment_word: pide comentar una palabra específica
  - link: redirige a un link (en bio o sticker)
  - none: no hay CTA explícito

Respondé con JSON exactamente en este formato:
{
  "formato": {
    "name": "nombre corto del formato (máx 6 palabras)",
    "description": "descripción de cómo está grabado/presentado"
  },
  "dolor": {
    "name": "nombre corto del dolor (máx 6 palabras)",
    "description": "descripción del problema que aborda"
  },
  "angulo": {
    "name": "nombre corto del ángulo (máx 8 palabras)",
    "description": "descripción de la perspectiva específica"
  },
  "why_it_worked": "explicación de 2-3 oraciones de por qué este contenido funciona (o no funciona) basándote en el engagement y en la combinación formato+dolor+ángulo",
  "video_structure": [
    { "part": "Hook (0-3s)", "description": "qué pasa en esta parte", "script_note": "nota sobre el guión si aplica" },
    { "part": "Desarrollo (3-45s)", "description": "...", "script_note": "..." },
    { "part": "Cierre / CTA (45-60s)", "description": "...", "script_note": "..." }
  ],
  "format_type": "uno de: storytime | talking_head | pov | listicle | green_screen | hot_take | carousel | otro",
  "hook_type": "uno de: dolor_directo | curiosidad | contrarian | prueba_social | resultado",
  "cta_type": "uno de: dm | comment_word | link | none",
  "insights_virales": {
    "potencial": "uno de: alto | medio | bajo (basado en engagement, hook y ángulo)",
    "fortalezas": ["fortaleza 1 concreta", "fortaleza 2 concreta"],
    "areas_mejora": ["área de mejora 1 accionable", "área de mejora 2 accionable"]
  },
  "analisis_visual": {
    "formato": "vertical/horizontal/cuadrado",
    "tipo_plano": "primer plano/plano medio/plano general/etc.",
    "escena": "interior/exterior/estudio/calle/etc.",
    "orientacion": "vertical/horizontal",
    "personas": 1,
    "cara_visible": true,
    "texto_en_pantalla": false,
    "fondo": "descripción del fondo o entorno"
  },
  "tono_voz": {
    "tipo": "conversacional/autoritativo/didáctico/emotivo/etc.",
    "velocidad_wpm": 150
  }
}`;
}

export function toClaudeImageMediaType(
  mimeType: string
): "image/jpeg" | "image/png" | "image/webp" | "image/gif" {
  if (mimeType.includes("png")) return "image/png";
  if (mimeType.includes("webp")) return "image/webp";
  if (mimeType.includes("gif")) return "image/gif";
  return "image/jpeg";
}

export function isVideoMimeType(mimeType: string): boolean {
  return (
    mimeType.startsWith("video/") ||
    ["video/mp4", "video/quicktime", "video/webm", "video/avi", "video/mov"].some(
      (type) => mimeType.includes(type)
    )
  );
}

export function isImageMimeType(mimeType: string): boolean {
  return (
    mimeType.startsWith("image/") ||
    ["image/jpeg", "image/png", "image/webp", "image/gif"].some((type) =>
      mimeType.includes(type)
    )
  );
}
