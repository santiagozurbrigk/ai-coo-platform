/**
 * Opciones de los campos de organización.
 *
 * Vive acá y no en el formulario de Ajustes porque ahora hay dos pantallas que
 * las piden —Ajustes y el gate de onboarding— y una lista duplicada se
 * desincroniza del `z.enum` de `lib/validations.ts` sin que nada falle.
 *
 * Al agregar un valor, agregarlo también al schema correspondiente.
 */

export const TIMEZONE_OPTIONS = [
  { value: "America/Argentina/Buenos_Aires", label: "Buenos Aires (ART)" },
  { value: "America/Mexico_City", label: "Ciudad de México (CST)" },
  { value: "America/Bogota", label: "Bogotá (COT)" },
  { value: "America/Santiago", label: "Santiago (CLT)" },
  { value: "America/New_York", label: "Nueva York (EST)" },
  { value: "Europe/Madrid", label: "Madrid (CET)" },
  { value: "UTC", label: "UTC" },
] as const;

export const CURRENCY_OPTIONS = [
  { value: "USD", label: "USD — Dólar" },
  { value: "ARS", label: "ARS — Peso argentino" },
  { value: "EUR", label: "EUR — Euro" },
] as const;

export const LANGUAGE_OPTIONS = [
  { value: "es", label: "Español" },
  { value: "en", label: "English" },
] as const;
