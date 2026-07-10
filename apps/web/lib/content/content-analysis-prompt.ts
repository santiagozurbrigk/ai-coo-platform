import type { ContentMetrics } from "@/types/content";

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
  ]
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
