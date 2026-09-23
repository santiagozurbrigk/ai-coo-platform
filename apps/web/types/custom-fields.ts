/**
 * C0 · Campos configurables — tipos compartidos entre Wins (Encargo A) y
 * Checkpoints (Encargo C).
 *
 * Una `FieldDefinition` es la definición de una columna. El valor cargado vive
 * en el jsonb de la fila dueña (`client_wins.custom`,
 * `client_checkpoint_events.metrics`), nunca acá.
 */

/**
 * A qué tabla pertenece una columna configurable.
 *
 * `client` es la tercera y entró el 2026-09-11: la tabla de clientes necesitaba
 * una columna "Objetivo general" con una lista compartida por la organización.
 * Se extendió este mecanismo en vez de armar un catálogo de objetivos aparte —
 * un segundo mecanismo para lo mismo es justo lo que C0 vino a evitar.
 */
export const FIELD_ENTITIES = ["win", "checkpoint", "client"] as const;
export type FieldEntity = (typeof FIELD_ENTITIES)[number];

export const FIELD_TYPES = [
  "select",
  "multi_select",
  "text",
  "number",
  "currency",
  "date",
] as const;
export type FieldType = (typeof FIELD_TYPES)[number];

/** De dónde salen las opciones de un campo de lista. */
/**
 * Los apartados en que se agrupan las columnas del cliente en su ficha.
 *
 * ⭐ Salen de cómo el founder piensa un negocio de infoproductos: qué vende y a
 * quién (marketing), cómo lo vende (ventas), y con qué herramientas lo sostiene
 * (sistemas). Una columna sin sección va al bloque suelto de arriba, que es el
 * comportamiento de siempre.
 */
export const FIELD_SECTIONS = ["marketing", "ventas", "sistemas", "onboarding"] as const;
export type FieldSection = (typeof FIELD_SECTIONS)[number];

/**
 * ⭐ «onboarding» (2026-09-23) guarda las respuestas crudas del formulario de
 * onboarding, en su propia solapa. Marketing, Ventas y Sistemas son el resumen
 * que arma el equipo; mezclar 70 preguntas con esos 22 campos los enterraría.
 */
export const FIELD_SECTION_LABEL: Record<FieldSection, string> = {
  marketing: "Marketing",
  ventas: "Ventas",
  sistemas: "Sistemas",
  onboarding: "Onboarding",
};

export const FIELD_OPTIONS_SOURCES = ["inline", "journey_stages"] as const;
export type FieldOptionsSource = (typeof FIELD_OPTIONS_SOURCES)[number];

/** Monedas soportadas por un campo de dinero — las mismas que usa el resto del producto. */
export const FIELD_CURRENCIES = ["USD", "ARS"] as const;
export type FieldCurrency = (typeof FIELD_CURRENCIES)[number];

/**
 * Color de una opción. Se guarda el **nombre del token**, no el hex: los
 * colores del producto salen de `--chart-cat-*` y siguen el tema claro/oscuro.
 */
export const FIELD_OPTION_COLORS = [
  "neutral",
  "cat-1",
  "cat-2",
  "cat-3",
  "cat-4",
  "cat-5",
  "cat-6",
] as const;
export type FieldOptionColor = (typeof FIELD_OPTION_COLORS)[number];

export type FieldOption = {
  /** Lo que se guarda en el dato. Estable: no cambia aunque se renombre la etiqueta. */
  value: string;
  /** Lo que se ve. */
  label: string;
  color: FieldOptionColor;
  /** Archivada: no se ofrece más, pero se sigue mostrando donde ya se cargó. */
  archived: boolean;
};

export type FieldDefinition = {
  id: string;
  organizationId: string;
  entity: FieldEntity;
  key: string;
  label: string;
  description: string | null;
  fieldType: FieldType;
  options: FieldOption[];
  optionsSource: FieldOptionsSource;
  unit: string | null;
  currency: FieldCurrency | null;
  /**
   * ⭐ Sólo para `date`: a cuántos días de distancia la fecha se muestra en
   * alerta. Nulo = sin aviso.
   *
   * Es lo que permite "Próximo lanzamiento · avisar a 15 días" sin hornear la
   * palabra "lanzamiento" en el producto: cada organización define su fecha con
   * su propio umbral.
   */
  alertDaysBefore: number | null;
  isRequired: boolean;
  /** El apartado de la ficha donde se muestra. `null` = suelta. */
  section: FieldSection | null;
  /** Si se pregunta en el formulario de onboarding. `null` = no. */
  onboarding: FieldOnboardingConfig | null;
  /**
   * Si la columna se dibuja en la tabla de clientes.
   *
   * ⭐ Por defecto **no**. Con 22 columnas agrupadas en apartados, el
   * comportamiento anterior —toda columna activa va a la tabla— convertiría la
   * lista en una hoja de cálculo de 25 columnas.
   */
  showInTable: boolean;
  sortOrder: number;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

/**
 * Cómo se pregunta un campo en el formulario público de onboarding.
 *
 * ⭐ `required` es del formulario, no de la ficha: `isRequired` se valida
 * también cuando el equipo edita, y marcar obligatorias las preguntas le
 * impediría guardar un cliente a medio cargar.
 */
export type FieldOnboardingConfig = {
  /** El id del paso (ver `lib/client-onboarding/steps.ts`). */
  step: string;
  /** La pregunta tal como la lee el cliente. Nulo = se usa la etiqueta. */
  question: string | null;
  required: boolean;
  /** Mostrarla sólo si otro campo del formulario tiene ese valor. */
  showIf: { key: string; equals: string } | null;
  /** Si se sugiere mandar un audio, cuánto («5 min»). */
  audio: string | null;
};

/** El jsonb con los valores cargados de una fila (win o evento de checkpoint). */
export type CustomFieldValues = Record<string, unknown>;

export type FieldDefinitionRow = {
  id: string;
  organization_id: string;
  entity: string;
  key: string;
  label: string;
  description: string | null;
  field_type: string;
  options: unknown;
  options_source: string;
  unit: string | null;
  currency: string | null;
  alert_days_before: number | null;
  is_required: boolean;
  section: string | null;
  /** Ausente en filas leídas antes de la migración del onboarding. */
  onboarding?: unknown;
  show_in_table: boolean | null;
  sort_order: number;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
};
