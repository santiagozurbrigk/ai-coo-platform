import type { DeepCallAnalysis, TeamRankingEntry } from "@/types/call-analysis";

export const mockCallAnalyses = {
  laura: {
    overall_score: 87,
    script_adherence_pct: 91,
    section_scores: {
      apertura: 95,
      presentacion: 88,
      objeciones: 85,
      cta: 82,
    },
    missing_steps: ["No confirmó el compromiso final antes de cerrar"],
    objections: [
      {
        text: "Es mucho dinero para mí ahora",
        category: "closing" as const,
        handled: true,
        resolution:
          "Reencuadró el costo como inversión vs pérdida mensual",
      },
      {
        text: "Necesito pensarlo",
        category: "closing" as const,
        handled: true,
        resolution: "Preguntó qué información faltaba para decidir",
      },
    ],
    power_phrases: [
      "¿Qué sería diferente en tu negocio si esto estuviera resuelto?",
      "Entiendo perfectamente, muchos clientes pensaban lo mismo",
    ],
    weak_phrases: [],
    filler_words_count: 4,
    strengths: [
      "Excelente rapport inicial — el lead estuvo cómodo desde el principio",
      "Manejo de objeciones con empatía real, no robótico",
      "CTA directo y sin rodeos",
    ],
    improvements: ["Confirmar compromiso explícito antes del cierre"],
    lead_qualified: true,
    booked: true,
    sold: true,
  },
  carlos: {
    overall_score: 52,
    script_adherence_pct: 58,
    section_scores: {
      apertura: 70,
      presentacion: 55,
      objeciones: 35,
      cta: 28,
    },
    missing_steps: [
      "No hizo el CTA — terminó la llamada sin pedir el cierre",
      "No presentó el precio con contexto (antes/después)",
      "No validó si el lead tenía autoridad para decidir",
      "Nunca preguntó cuál era el principal dolor del lead",
    ],
    objections: [
      {
        text: "No sé si es para mí",
        category: "marketing" as const,
        handled: false,
        resolution: "Cambió de tema sin responder",
      },
      {
        text: "Tengo que hablarlo con mi socio",
        category: "closing" as const,
        handled: false,
        resolution: "Aceptó el bloqueo sin estrategia",
      },
    ],
    power_phrases: [],
    weak_phrases: [
      "O sea, básicamente lo que hacemos es...",
      "No sé, depende de vos",
      "Bueno, si querés lo pensás",
    ],
    filler_words_count: 23,
    strengths: [
      "Buena escucha activa en la primera parte",
      "Tono amigable y no invasivo",
    ],
    improvements: [
      "Practicar el CTA — terminar siempre con una pregunta de cierre",
      "Reducir muletillas: 'o sea', 'básicamente', 'bueno'",
      "Aprender a manejar el bloqueo del socio/pareja",
      "Presentar el precio con el contexto de transformación",
    ],
    lead_qualified: true,
    booked: false,
    sold: false,
  },
  sofia: {
    overall_score: 83,
    script_adherence_pct: 86,
    section_scores: {
      apertura: 90,
      presentacion: 85,
      objeciones: 80,
      cta: 78,
    },
    missing_steps: [],
    objections: [],
    power_phrases: [
      "¿Qué resultado concreto buscás en los próximos 90 días?",
    ],
    weak_phrases: [],
    filler_words_count: 6,
    strengths: [
      "Tono consultivo y celebración de wins del cliente",
      "Identificó oportunidad de upsell de forma natural",
    ],
    improvements: [
      "Documentar compromisos del cliente en CRM antes de cerrar",
    ],
    lead_qualified: true,
    booked: true,
    sold: false,
  },
} satisfies Record<
  string,
  {
    overall_score: number;
    script_adherence_pct: number;
    section_scores: Record<string, number>;
    missing_steps: string[];
    objections: Array<{
      text: string;
      category: "closing" | "setting" | "marketing";
      handled: boolean;
      resolution: string;
    }>;
    power_phrases: string[];
    weak_phrases: string[];
    filler_words_count: number;
    strengths: string[];
    improvements: string[];
    lead_qualified: boolean;
    booked: boolean;
    sold: boolean;
  }
>;

export const mockCloserEvolution = {
  laura: [72, 75, 78, 80, 83, 85, 86, 87],
  carlos: [38, 42, 44, 48, 50, 49, 53, 52],
  sofia: [65, 67, 70, 72, 75, 78, 80, 83],
};

export const mockTeamRanking: TeamRankingEntry[] = [
  {
    name: "Laura Martínez",
    score: 87,
    calls: 12,
    bookings: 9,
    conversion: "75%",
    trend: "up",
  },
  {
    name: "Sofía Rodríguez",
    score: 83,
    calls: 10,
    bookings: 7,
    conversion: "70%",
    trend: "up",
  },
  {
    name: "Carlos Méndez",
    score: 52,
    calls: 8,
    bookings: 2,
    conversion: "25%",
    trend: "stable",
  },
];

type MockKey = keyof typeof mockCallAnalyses;

export function resolveMockAnalysisKey(name: string): MockKey {
  const first = name.split(/\s+/)[0]?.toLowerCase() ?? "";
  if (first in mockCallAnalyses) return first as MockKey;
  if (first.startsWith("laur")) return "laura";
  if (first.startsWith("carl")) return "carlos";
  if (first.startsWith("sof")) return "sofia";
  return "carlos";
}

export function mockAnalysisToDeep(
  key: MockKey,
  meta?: { leadName?: string; durationMinutes?: number }
): DeepCallAnalysis {
  const raw = mockCallAnalyses[key];
  return {
    overallScore: raw.overall_score,
    scriptAdherencePct: raw.script_adherence_pct,
    sectionScores: raw.section_scores,
    missingSteps: raw.missing_steps,
    objections: raw.objections.map((o) => ({
      text: o.text,
      category: o.category,
      handled: o.handled,
      resolution: o.resolution,
      suggestion: o.handled
        ? undefined
        : "Practicar respuesta estructurada: validar → reencuadrar → CTA",
    })),
    powerPhrases: raw.power_phrases,
    weakPhrases: raw.weak_phrases,
    fillerWordsCount: raw.filler_words_count,
    strengths: raw.strengths,
    improvements: raw.improvements,
    leadQualified: raw.lead_qualified,
    booked: raw.booked,
    sold: raw.sold,
    leadName: meta?.leadName,
    durationMinutes: meta?.durationMinutes,
  };
}

export function getTeamAverageEvolution(): number[] {
  const keys = Object.keys(mockCloserEvolution) as (keyof typeof mockCloserEvolution)[];
  const length = mockCloserEvolution.laura.length;
  return Array.from({ length }, (_, i) => {
    const sum = keys.reduce(
      (acc, k) => acc + mockCloserEvolution[k][i],
      0
    );
    return Math.round(sum / keys.length);
  });
}
