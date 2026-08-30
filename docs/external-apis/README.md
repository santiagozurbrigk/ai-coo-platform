# Documentación de APIs externas — copia local

Copia completa y navegable de la documentación pública de las APIs externas contra
las que OTC integra. Existe porque el entorno remoto de desarrollo **no siempre
alcanza los dominios de documentación**: cuando se escribió
[`API_DOCS_PENDIENTES.md`](../API_DOCS_PENDIENTES.md) los nueve dominios probados
estaban bloqueados, y varias integraciones se construyeron a ciegas por eso.

Teniendo la documentación acá adentro, cualquier sesión de Claude Code o cualquier
desarrollador puede leerla sin depender de la red.

**Fecha de captura: 2026-08-30.** La fuente viva siempre manda: si algo no cierra,
la URL de origen está en el front-matter de cada archivo.

---

## Qué hay

| Proveedor | Carpeta | Contenido | Unidad de OTC |
|---|---|---|---|
| **GoHighLevel** (Marketplace / API v3) | [`gohighlevel/`](./gohighlevel/) | 948 páginas · 634 endpoints REST · 77 eventos de webhook | I-4 (oportunidades y pipelines) |
| **VTurb Analytics API** | [`vturb/`](./vturb/) | 8 páginas (pt + en) · **`openapi.json` con los 28 endpoints** | I-6 (VSL) |

### Por dónde empezar

| Si querés… | Abrí |
|---|---|
| Ver todo lo de GHL ordenado por recurso | [`gohighlevel/INDEX.md`](./gohighlevel/INDEX.md) |
| Buscar un endpoint de GHL por path | [`gohighlevel/ENDPOINTS.md`](./gohighlevel/ENDPOINTS.md) |
| Lo que OTC necesita de GHL para I-4 | [`gohighlevel/RESUMEN-OTC.md`](./gohighlevel/RESUMEN-OTC.md) |
| Ver todo lo de VTurb | [`vturb/INDEX.md`](./vturb/INDEX.md) |
| El spec de VTurb, para generar tipos o un cliente | [`vturb/openapi.json`](./vturb/openapi.json) |
| Lo que OTC necesita de VTurb para I-6 | [`vturb/RESUMEN-OTC.md`](./vturb/RESUMEN-OTC.md) |
| Volver a bajar todo cuando el proveedor cambie | [`tools/README.md`](./tools/README.md) |

Los `RESUMEN-OTC.md` responden, una por una, las preguntas que
[`API_DOCS_PENDIENTES.md`](../API_DOCS_PENDIENTES.md) dejó abiertas para cada
proveedor. Son lectura obligatoria antes de arrancar I-4 o I-6.

---

## Cómo se armó

- **GoHighLevel**: las páginas son HTML pre-renderizado de Docusaurus con el plugin
  `docusaurus-plugin-openapi-docs`. Se descargaron las 948 URLs de la versión
  *current* del sitemap y se convirtieron a markdown con un conversor que entiende
  ese DOM (grupos de parámetros, árboles de schema, ejemplos, code blocks).
- **VTurb**: GitBook sirve cada página como markdown agregando `.md` a la URL, y
  dentro de la página de Analytics **cada endpoint viene como un documento OpenAPI
  3.0.2 completo**. Se extrajeron los 28 y se unieron en un solo
  [`openapi.json`](./vturb/openapi.json) — sin conflictos entre schemas. La
  referencia legible se genera desde ese spec.

Todo el proceso es reproducible: `./tools/regenerar.sh`.

---

## Límites de esta copia — leer antes de confiar en ella

Nada de lo que hay acá está inventado ni completado por inferencia. Pero la copia
hereda los agujeros de la fuente, y hay tres que importan:

1. **GoHighLevel no expande muchos schemas de respuesta.** Endpoints centrales como
   `GET /opportunities/:id` o `GET /opportunities/pipelines` documentan su respuesta
   como `opportunity: object` / `pipelines: object[]`, sin detallar los campos. Eso
   **es así en la documentación oficial**, no se perdió en la conversión. Los nombres
   de campo de una oportunidad se conocen por otro lado: los payloads de webhook y
   los request bodies de creación/actualización sí están completos. Ver
   [`gohighlevel/RESUMEN-OTC.md`](./gohighlevel/RESUMEN-OTC.md).

2. **De GoHighLevel no se capturaron los code samples** (los snippets curl / Node /
   Python del panel derecho). Ese panel lo arma JavaScript en el navegador y no
   existe en el HTML servido. Sí están el request, el schema de respuesta y el
   ejemplo JSON auto-generado, que es lo que hace falta para mapear campos.

3. **De GoHighLevel se capturó sólo la versión *current* (v3).** El sitemap expone
   además `2021-04-15`, `2021-07-28` y `2023-02-21`; se verificó comparando páginas
   que esas tres son idénticas a la current salvo por el valor permitido del header
   `Version`. Si alguna vez hace falta una de esas versiones, se baja con el mismo
   script cambiando el filtro.

Y una inconsistencia del lado de VTurb que conviene tener presente:

4. **VTurb declara dos versiones distintas.** La página de autenticación dice que
   `X-Api-Version` sólo acepta `v1`; el spec embebido declara `info.version: v3`.
   Además, las release notes mencionan un endpoint —`/smart_autoplays/stats_by_player`—
   que no aparece en la referencia. Ambas cosas están anotadas en
   [`vturb/RESUMEN-OTC.md`](./vturb/RESUMEN-OTC.md) para chequear contra la API real.

---

## Regla para Claude Code

Antes de implementar contra GoHighLevel o VTurb, **leer de acá**, no de memoria ni
de una búsqueda web. Si un campo no está documentado en esta copia, tampoco está
documentado en el proveedor: aplica la regla 3 de `CLAUDE.md` —persistir el payload
crudo, no inventar el valor, y dejar la entrada en `API_DOCS_PENDIENTES.md`.

Si la fuente cambió, correr `./tools/regenerar.sh` y commitear el diff; no editar
los archivos generados a mano.
