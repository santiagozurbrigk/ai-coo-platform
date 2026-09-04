/**
 * C0 · Campos configurables — pieza compartida entre Wins (Encargo A) y
 * Checkpoints (Encargo C).
 *
 * Todo lo configurable del producto pasa por acá: el `metric_schema` de un
 * checkpoint **es** un conjunto de campos configurables. No armar un segundo
 * mecanismo para lo mismo.
 */
export * from "@/lib/custom-fields/field-types";
export * from "@/lib/custom-fields/format";
export * from "@/lib/custom-fields/key";
export * from "@/lib/custom-fields/mapper";
export * from "@/lib/custom-fields/resolve";
export * from "@/lib/custom-fields/validate";
