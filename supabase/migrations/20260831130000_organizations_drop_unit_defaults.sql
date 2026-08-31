-- Quitar los defaults de moneda, zona horaria e idioma en `organizations`.
--
-- POR QUÉ. El gate de onboarding bloquea por estos campos con un argumento
-- concreto: cada número de Finanzas, Embudos y los reportes se agrega en esa
-- moneda y se agrupa por esa zona, y corregirlas después no re-etiqueta lo ya
-- cargado. Ese argumento se cae si la columna tiene default: una organización
-- nueva nacía con `currency = 'USD'` y `timezone = 'America/Argentina/Buenos_Aires'`
-- sin que nadie los eligiera, y la derivación —que sólo puede mirar si el valor
-- está o no— los daba por configurados y salteaba el paso.
--
-- El default no era neutro: para un cliente que cobra en pesos, 'USD' es
-- directamente el valor equivocado, indistinguible de una elección deliberada.
--
-- Sin default, una columna en null significa "todavía nadie lo eligió", que es
-- exactamente lo que el gate necesita preguntar.
--
-- NO afecta a las filas existentes: `DROP DEFAULT` sólo cambia qué pasa con los
-- INSERT nuevos. Y la UI de Ajustes ya resuelve el null con su propio fallback
-- (`lib/settings/initial-data.ts`), así que sigue mostrando lo mismo.

ALTER TABLE public.organizations ALTER COLUMN currency DROP DEFAULT;
ALTER TABLE public.organizations ALTER COLUMN timezone DROP DEFAULT;
ALTER TABLE public.organizations ALTER COLUMN language DROP DEFAULT;
