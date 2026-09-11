/**
 * Cómo se combina lo que un formulario mandó con lo que la fila ya tenía.
 *
 * ⭐ Existe por la regla 3 de C0: **un campo archivado deja de ofrecerse pero
 * sigue mostrándose donde ya se cargó**. Sin esta función, cada guardado
 * reescribiría el jsonb entero con lo que el formulario ofreció, y archivar una
 * columna se convertiría en una forma silenciosa de borrar el pasado — nadie lo
 * decide, nadie lo ve, y no hay de dónde recuperarlo.
 *
 * Lógica pura: no toca base ni red.
 */
import type { CustomFieldValues, FieldDefinition } from "@/types/custom-fields";
import { activeFields } from "@/lib/custom-fields/resolve";
import { hasValue } from "@/lib/custom-fields/resolve";

/**
 * Lo guardado = lo que el formulario no podía tocar + lo que validó.
 *
 * `validated` manda sobre las claves que el formulario ofreció: si un campo
 * activo quedó vacío, desaparece del resultado. Es la única forma de borrar un
 * valor, y tiene que seguir existiendo.
 *
 * Lo que se conserva de `loaded` son las claves que **no** se ofrecieron:
 *
 *   · campos archivados — siguen mostrándose donde ya se cargaron;
 *   · claves huérfanas, de un campo que alguien borró de verdad — es dato que
 *     alguien cargó, y que la columna ya no exista no lo hace falso.
 *
 * Las claves conservadas sin contenido (`""`, `[]`, `null`) se descartan: no
 * dicen nada y sólo ensucian el jsonb.
 */
export function mergeCustomFieldValues(
  all: readonly FieldDefinition[],
  loaded: CustomFieldValues,
  validated: CustomFieldValues
): CustomFieldValues {
  const offeredKeys = new Set(activeFields(all).map((field) => field.key));
  const result: CustomFieldValues = {};

  for (const [key, value] of Object.entries(loaded)) {
    if (offeredKeys.has(key)) continue;
    if (!hasValue(value)) continue;
    result[key] = value;
  }

  return { ...result, ...validated };
}
