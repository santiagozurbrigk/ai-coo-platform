# Herramientas de captura de documentación externa

Scripts que generan todo lo que hay en `docs/external-apis/`. Están acá para que la
copia se pueda **volver a bajar** cuando el proveedor cambie su documentación, sin
tener que reconstruir el proceso de cero.

## Uso

```bash
python3 -m pip install beautifulsoup4 lxml
./docs/external-apis/tools/regenerar.sh
git diff docs/external-apis      # revisar qué cambió del lado del proveedor
```

El HTML crudo queda cacheado en `tools/.work/` (ignorado por git). Una segunda
corrida no vuelve a pegarle a los servidores salvo por el sitemap.

## Qué hace cada script

| Script | Qué hace |
|---|---|
| `regenerar.sh` | Orquesta todo el proceso. Es el único que hace falta correr. |
| `fetch.py` | Descarga las URLs de un archivo de lista, con 8 hilos, reintentos con backoff y caché en disco. |
| `convert.py` | HTML → Markdown. Entiende el DOM de Docusaurus **y** el del plugin `docusaurus-plugin-openapi-docs` (grupos de parámetros, árboles de schema, tabs de ejemplo, code blocks de Prism, cards de índice). |
| `build_ghl.py` | Corre `convert.py` sobre la caché y escribe `gohighlevel/**.md` con front-matter. Deja `ghl-entries.json` con el método y el path de cada endpoint. |
| `index_ghl.py` | Genera `gohighlevel/INDEX.md` y `gohighlevel/ENDPOINTS.md` a partir de ese JSON. |
| `merge_vturb.py` | Extrae los 28 documentos OpenAPI que VTurb embebe en su página de Analytics y los une en un solo `openapi.json`. Avisa si dos bloques definen el mismo schema con contenido distinto. |
| `build_vturb.py` | Copia las páginas de VTurb (formateando el JSON embebido) y genera `vturb/ENDPOINTS.md` desde el spec unido. |
| `ghl-urls.txt` | Lista de URLs de GoHighLevel a capturar. La regenera `regenerar.sh` desde el sitemap; si aparecen páginas nuevas, el script lo avisa por diff. |

## Decisiones que conviene conocer antes de tocarlos

- **De GoHighLevel se captura sólo la versión *current* (v3).** El sitemap expone
  además `2021-04-15`, `2021-07-28` y `2023-02-21`, pero se verificó que esas tres
  copias son idénticas entre sí y a la current salvo por el valor del header
  `Version`. Capturar las cuatro cuadruplicaría el repo sin agregar información.
- **De VTurb, la fuente de verdad es el `openapi.json`, no el markdown.** GitBook
  sirve cada página como markdown agregando `.md` a la URL, y dentro de la página
  de Analytics cada endpoint viene como un documento OpenAPI 3.0.2 completo. Eso
  se une en un solo spec y de ahí se genera la referencia legible.
- **`convert.py` no inventa nada.** Si un schema no está expandido en el HTML
  (GoHighLevel deja muchas respuestas como `object` sin detallar), el markdown
  también lo deja así. Ver la advertencia en `../README.md`.
