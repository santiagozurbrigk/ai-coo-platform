/**
 * Generación de captions variadas con Claude Haiku.
 * Cada variante de reel recibe un caption diferente al original.
 */

import Anthropic from "@anthropic-ai/sdk";
import type { ReelVariationType } from "./types";

// Lazy — no inicializar en module level para evitar crash si la var no está
// seteada en el momento en que el módulo carga (p.ej. tests, inicio del worker).
let _client: Anthropic | null = null;
function getClient(): Anthropic {
  if (!_client) {
    _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return _client;
}

const VARIANT_TONE: Record<ReelVariationType, string> = {
  speed_up:   "energético y rápido, con frases cortas y dinámicas",
  speed_down: "contemplativo y profundo, con más espacio para reflexionar",
  music:      "emotivo y evocador, conectando con la música de fondo",
  subtitles:  "directo y claro, ideal para quienes ven sin sonido",
  color:      "cálido y cercano, con tono de conversación informal",
};

type CaptionResult = {
  description: string;
  hashtags: string[];
};

export async function generateVariantCaptions(
  originalCaption: string | null,
  variations: ReelVariationType[]
): Promise<Map<ReelVariationType, CaptionResult>> {
  const original = originalCaption?.trim() || "Contenido de valor sobre negocio y crecimiento.";

  const prompt = `Eres un experto en marketing de contenido para Instagram.

Tenés el siguiente caption original de un reel:
<caption>
${original}
</caption>

Necesito que generes ${variations.length} variaciones del caption, una por cada variante de video.
Cada variación debe tener un tono diferente pero mantener el mensaje principal.

Variantes necesarias:
${variations.map((v, i) => `${i + 1}. Tipo: ${v} — Tono: ${VARIANT_TONE[v]}`).join("\n")}

Respondé con un JSON array con este formato exacto:
[
  {
    "type": "speed_up",
    "description": "El caption completo aquí...",
    "hashtags": ["#hashtag1", "#hashtag2", "#hashtag3"]
  },
  ...
]

Reglas:
- Máximo 150 palabras por description
- Entre 3 y 8 hashtags relevantes (sin duplicar los del caption original)
- El tono debe reflejar la variante
- En español (es-AR)
- Sin emojis en exceso (máximo 2-3 por caption)`;

  try {
    const response = await getClient().messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1500,
      messages: [{ role: "user", content: prompt }],
    });

    const text = response.content[0]?.type === "text" ? response.content[0].text : "";
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error("No JSON array in response");

    const parsed = JSON.parse(jsonMatch[0]) as Array<{
      type: string;
      description: string;
      hashtags: string[];
    }>;

    const result = new Map<ReelVariationType, CaptionResult>();
    for (const item of parsed) {
      result.set(item.type as ReelVariationType, {
        description: item.description ?? original,
        hashtags: item.hashtags ?? [],
      });
    }

    return result;
  } catch (err) {
    console.error("[Captions] Haiku generation failed, using fallbacks", err);
    // Fallback: caption original para todas las variantes
    const fallback = new Map<ReelVariationType, CaptionResult>();
    for (const v of variations) {
      fallback.set(v, { description: original, hashtags: [] });
    }
    return fallback;
  }
}
