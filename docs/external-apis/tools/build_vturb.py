# -*- coding: utf-8 -*-
import json, os, re, sys, shutil

SCRATCH = os.environ.get("WORK") or os.path.join(
    os.path.dirname(os.path.abspath(__file__)), ".work")
TOOLS = os.path.dirname(os.path.abspath(__file__))
RAW = os.path.join(SCRATCH, "raw")
OUT = sys.argv[1]
FETCHED = sys.argv[2]
os.makedirs(OUT, exist_ok=True)

# ---------- 1. copiar páginas crudas, con el JSON del spec formateado -------
PAGES = {
    "pt": [("bem-vindo-a-api-do-analytics-do-vturb", "00-bienvenida.md",
            "Bem Vindo a API do Analytics do VTurb",
            "https://vturb.gitbook.io/analytics-api/pt/bem-vindo-a-api-do-analytics-do-vturb"),
           ("autenticacao-da-api", "01-autenticacao-da-api.md", "Autenticação da API",
            "https://vturb.gitbook.io/analytics-api/pt/autenticacao-da-api"),
           ("analytics", "02-analytics.md", "Analytics (referencia de endpoints)",
            "https://vturb.gitbook.io/analytics-api/pt/analytics"),
           ("release-notes", "03-release-notes.md", "Release Notes",
            "https://vturb.gitbook.io/analytics-api/pt/release-notes")],
    "en": [("index", "00-welcome.md", "Welcome to the VTurb Analytics API",
            "https://vturb.gitbook.io/analytics-api"),
           ("api-authentication", "01-api-authentication.md", "API Authentication",
            "https://vturb.gitbook.io/analytics-api/api-authentication"),
           ("analytics", "02-analytics.md", "Analytics (endpoint reference)",
            "https://vturb.gitbook.io/analytics-api/analytics"),
           ("release-notes", "03-release-notes.md", "Release Notes",
            "https://vturb.gitbook.io/analytics-api/release-notes")],
}

def prettify_json_blocks(text):
    def repl(m):
        try:
            obj = json.loads(m.group(1))
        except ValueError:
            return m.group(0)
        return "```json\n%s\n```" % json.dumps(obj, indent=2, ensure_ascii=False)
    return re.sub(r"```json\n(\{.*?\})\n```", repl, text, flags=re.S)

for lang, pages in PAGES.items():
    d = os.path.join(OUT, lang)
    os.makedirs(d, exist_ok=True)
    for slug, dest, title, url in pages:
        src = os.path.join(RAW, "vturb-%s-%s.md" % (lang, slug))
        body = open(src, encoding="utf-8").read()
        # quitar el aviso de GitBook sobre llms.txt
        body = re.sub(r"^> For the complete documentation index.*?\n\n", "", body, flags=re.S)
        body = prettify_json_blocks(body)
        fm = "---\ntitle: %r\nsource: %r\nidioma: %r\ncapturado: %r\n---\n\n" % (title, url, lang, FETCHED)
        fm = fm.replace("'", '"')
        open(os.path.join(d, dest), "w", encoding="utf-8").write(fm + body)

shutil.copy(os.path.join(RAW, "vturb-llms.txt"), os.path.join(OUT, "llms.txt"))
shutil.copy(os.path.join(SCRATCH, "vturb-openapi.json"), os.path.join(OUT, "openapi.json"))

# ---------- 2. referencia legible generada desde el spec --------------------
spec = json.load(open(os.path.join(OUT, "openapi.json"), encoding="utf-8"))
schemas = spec["components"]["schemas"]

def resolve(node, depth=0, seen=()):
    """Devuelve (etiqueta_de_tipo, propiedades) para un nodo de schema."""
    if "$ref" in node:
        name = node["$ref"].rsplit("/", 1)[-1]
        if name in seen or depth > 6:
            return name + " (recursivo)", None
        return name, resolve_props(schemas.get(name, {}), depth, seen + (name,))
    return node.get("type", "object"), resolve_props(node, depth, seen)

def resolve_props(node, depth, seen):
    return (node, depth, seen)

def render_schema(node, indent=0, depth=0, seen=(), out=None):
    out = out if out is not None else []
    pad = "  " * indent
    if depth > 8:
        return out
    if "$ref" in node:
        name = node["$ref"].rsplit("/", 1)[-1]
        if name in seen:
            out.append(pad + "- _(referencia recursiva a `%s`)_" % name)
            return out
        return render_schema(schemas.get(name, {}), indent, depth + 1, seen + (name,), out)
    t = node.get("type")
    if t == "array":
        items = node.get("items", {})
        out.append(pad + "- `array` de:")
        return render_schema(items, indent + 1, depth + 1, seen, out)
    props = node.get("properties") or {}
    required = set(node.get("required") or [])
    if not props:
        if node.get("description"):
            out.append(pad + "- " + " ".join(node["description"].split()))
        return out
    for name, p in props.items():
        ref = p.get("$ref")
        if ref:
            sub = schemas.get(ref.rsplit("/", 1)[-1], {})
            ptype = ref.rsplit("/", 1)[-1]
        else:
            sub = p
            ptype = p.get("type", "object")
            if ptype == "array":
                it = p.get("items", {})
                inner = it.get("$ref", "").rsplit("/", 1)[-1] or it.get("type", "object")
                ptype = "%s[]" % inner
        bits = ["- **%s** `%s`" % (name, ptype)]
        if name in required:
            bits.append("_requerido_")
        desc = " ".join((p.get("description") or sub.get("description") or "").split())
        line = pad + " ".join(bits)
        if desc:
            line += " — " + desc
        if p.get("enum"):
            line += " · valores: " + ", ".join("`%s`" % v for v in p["enum"])
        if p.get("format"):
            line += " · formato: `%s`" % p["format"]
        out.append(line)
        if ref or (p.get("type") in ("object", "array")) or p.get("properties"):
            render_schema(p if not ref else {"$ref": ref}, indent + 1, depth + 1, seen, out)
    return out

lines = ["---",
         'title: "VTurb Analytics API — referencia de endpoints"',
         'source: "https://vturb.gitbook.io/analytics-api/analytics"',
         'generado_desde: "openapi.json (reconstruido a partir de los bloques OpenAPI embebidos en la doc)"',
         'capturado: "%s"' % FETCHED,
         "---", "",
         "# VTurb Analytics API — referencia de endpoints", "",
         "Generado a partir de [`openapi.json`](./openapi.json), que a su vez se reconstruyó uniendo los",
         "%d documentos OpenAPI 3.0.2 que la propia documentación de VTurb embebe, uno por endpoint." % len(spec["paths"]),
         "**No hay ningún campo inventado acá: todo sale del spec publicado.**", "",
         "- Server: `%s`" % spec["servers"][0]["url"],
         "- Versión declarada: `%s`" % spec["info"]["version"],
         "- Autenticación: headers `X-Api-Token` y `X-Api-Version` (ver [autenticación](./pt/01-autenticacao-da-api.md))", "",
         "## Índice", ""]

ops = []
for path, methods in spec["paths"].items():
    for method, op in methods.items():
        ops.append((path, method.upper(), op))
ops.sort(key=lambda x: x[0])

def anchor(path, method):
    return re.sub(r"[^a-z0-9]+", "-", ("%s %s" % (method, path)).lower()).strip("-")

lines += ["| Método | Path | Qué devuelve |", "| --- | --- | --- |"]
for path, method, op in ops:
    lines.append("| `%s` | [`%s`](#%s) | %s |" % (
        method, path, anchor(path, method), " ".join((op.get("summary") or "").split())))
lines.append("")

for path, method, op in ops:
    lines += ["---", "", "## `%s %s`" % (method, path), ""]
    if op.get("summary"):
        lines += ["**%s**" % " ".join(op["summary"].split()), ""]
    if op.get("description"):
        lines += [" ".join(op["description"].split()), ""]
    if op.get("operationId"):
        lines += ["`operationId`: `%s`" % op["operationId"], ""]
    body = (op.get("requestBody") or {}).get("content", {}).get("application/json", {}).get("schema")
    params = op.get("parameters") or []
    if params:
        lines += ["### Parámetros", ""]
        for p in params:
            sch = p.get("schema", {})
            l = "- **%s** (`%s`) `%s`" % (p.get("name"), p.get("in"), sch.get("type", "string"))
            if p.get("required"):
                l += " _requerido_"
            if p.get("description"):
                l += " — " + " ".join(p["description"].split())
            if sch.get("enum"):
                l += " · valores: " + ", ".join("`%s`" % v for v in sch["enum"])
            lines.append(l)
        lines.append("")
    if body:
        lines += ["### Request body (`application/json`)", ""]
        lines += render_schema(body)
        lines.append("")
    responses = op.get("responses") or {}
    lines += ["### Respuestas", ""]
    for code, r in responses.items():
        desc = " ".join((r.get("description") or "").split())
        lines.append("**`%s`** — %s" % (code, desc))
        lines.append("")
        sch = (r.get("content") or {}).get("application/json", {}).get("schema")
        if sch:
            lines += render_schema(sch)
            lines.append("")

open(os.path.join(OUT, "ENDPOINTS.md"), "w", encoding="utf-8").write("\n".join(lines).rstrip() + "\n")
print("vturb ok:", len(ops), "endpoints")
