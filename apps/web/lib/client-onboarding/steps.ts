/**
 * Los pasos del formulario de onboarding de los clientes de un growth partner.
 *
 * ⭐ Los pasos viven en el código y las preguntas no. Las preguntas son
 * columnas configurables (`field_definitions.onboarding.step` apunta a uno de
 * estos ids), así que agregar o reescribir una pregunta es una edición en
 * Campos personalizados. Los pasos cambian mucho menos y llevan texto de
 * encuadre (la bajada, el «hacelo hoy») que no tiene dónde vivir en una
 * columna.
 *
 * Salen tal cual del formulario que Limitless usaba antes (repo
 * `client-onboarding`, `src/lib/formConfig.ts`).
 *
 * Lógica pura: no toca base ni red.
 */

export type OnboardingStep = {
  id: string;
  title: string;
  subtitle: string | null;
  /** Los pasos que conviene completar el primer día. */
  priority: boolean;
};

export const ONBOARDING_STEPS: readonly OnboardingStep[] = [
  {
    id: "negocio",
    title: "Tu negocio",
    subtitle: "Lo básico para crear tu cuenta y configurar todo a tu nombre.",
    priority: false,
  },
  {
    id: "accesos",
    title: "Paso 1 — Recursos",
    subtitle:
      "Hacelo hoy: sin esto no podemos ni empezar. La regla: invitanos o compartí con permiso de lectura, no hace falta pasarnos contraseñas.",
    priority: true,
  },
  {
    id: "numeros",
    title: "Paso 2 — Los números de tu negocio",
    subtitle:
      "Hacelo hoy. Si algo no lo tenés o no lo sabés, poné \"no lo tengo\": un dato inventado nos hace tomar malas decisiones.",
    priority: true,
  },
  {
    id: "oferta",
    title: "Paso 3 — Tu oferta y tu cliente",
    subtitle: "De acá salen los ángulos, los ads y el funnel.",
    priority: false,
  },
  {
    id: "historia",
    title: "Paso 4 — Tu historia y tu comunicación",
    subtitle: "Contala como se la contarías a un amigo, sin filtro.",
    priority: false,
  },
  {
    id: "mercado",
    title: "Paso 5 — Tu mercado",
    subtitle: "Competencia directa y referentes.",
    priority: false,
  },
  {
    id: "funnel",
    title: "Paso 6 — Tu funnel y tus ads",
    subtitle: "El camino completo del desconocido hasta que te paga.",
    priority: false,
  },
  {
    id: "organico",
    title: "Paso 7 — Tu orgánico",
    subtitle: "Tu máquina de contenido hoy.",
    priority: false,
  },
  {
    id: "ventas",
    title: "Paso 8 — Tus ventas",
    subtitle:
      "Hacelo hoy: es el paso más importante de todos. De acá sale la voz real de tu cliente.",
    priority: true,
  },
  {
    id: "equipo",
    title: "Paso 9 — Tu equipo",
    subtitle: "Todos los que tocan marketing y ventas de este lado.",
    priority: false,
  },
  {
    id: "historial",
    title: "Paso 10 — Tu historial",
    subtitle: "Sin vergüenza: los \"fracasos\" nos ahorran meses.",
    priority: false,
  },
  {
    id: "entrega_servicio",
    title: "Paso 11 — Entrega de servicio",
    subtitle: "Cómo es hoy el camino real de tus clientes desde que pagan hasta que terminan.",
    priority: false,
  },
];

/**
 * Adónde va una pregunta cuyo paso ya no existe (lo borraron del código, o lo
 * escribieron a mano en la base). Se sigue preguntando, al final: una pregunta
 * que desaparece en silencio es una respuesta que nadie pide.
 */
export const FALLBACK_STEP: OnboardingStep = {
  id: "otras",
  title: "Otras preguntas",
  subtitle: null,
  priority: false,
};

export function findOnboardingStep(id: string): OnboardingStep | null {
  return ONBOARDING_STEPS.find((step) => step.id === id) ?? null;
}
