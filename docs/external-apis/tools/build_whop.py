# -*- coding: utf-8 -*-
"""Whop: specs OpenAPI oficiales + las 897 páginas de docs.whop.com en markdown.

Las páginas de `api-reference` re-embeben el spec entero (18 de los 22 MB crudos son
ese bloque repetido). Acá el bloque se reemplaza por un link a la sección
correspondiente de la referencia generada, que sale del spec oficial una sola vez.
"""
import json
import os
import re
import shutil
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from openapi_md import render_spec, operations, anchor  # noqa: E402

SCRATCH = os.environ.get("WORK") or os.path.join(
    os.path.dirname(os.path.abspath(__file__)), ".work")
TOOLS = os.path.dirname(os.path.abspath(__file__))
CACHE = os.path.join(SCRATCH, "cache-whop")
SPECS = os.path.join(SCRATCH, "whop-specs")
OUT = sys.argv[1]
FECHA = sys.argv[2]

SPEC_FILES = [
    ("api-v1-native.json", "ENDPOINTS-api-v1-native.md",
     "Whop API v1 (native) — referencia de endpoints",
     "La API versionada de Whop: los endpoints bajo `/api-reference/beta`, que se fijan "
     "con el header `Api-Version-Date`. Es la referencia por defecto para integraciones nuevas."),
    ("api-v1-stable.json", "ENDPOINTS-api-v1-stable.md",
     "Whop API v1 (stable / legacy) — referencia de endpoints",
     "Los recursos legacy, que siguen soportados. Donde existe un sucesor, la página del "
     "recurso legacy lo enlaza."),
    ("ledger-stats.yaml", "ENDPOINTS-ledger-stats.md",
     "Whop Wallet Stats API — referencia de endpoints",
     "Estadísticas financieras de la cuenta (`/api/v1/stats/*`)."),
]


def load_spec(path):
    if path.endswith(".json"):
        return json.load(open(path, encoding="utf-8"))
    import yaml
    return yaml.safe_load(open(path, encoding="utf-8"))


def yaml_str(s):
    return '"%s"' % str(s).replace("\\", "\\\\").replace('"', '\\"')


def main():
    os.makedirs(os.path.join(OUT, "openapi"), exist_ok=True)

    # ---- 1. specs oficiales + referencia generada ------------------------
    op_index = {}          # (spec_file, method, path) -> (doc, ancla)
    spec_stats = []
    for fname, docname, titulo, intro in SPEC_FILES:
        src = os.path.join(SPECS, fname)
        shutil.copy(src, os.path.join(OUT, "openapi", fname))
        spec = load_spec(src)
        ops = operations(spec)
        for path, method, _ in ops:
            op_index[(fname, method, path)] = (docname, anchor(method, path))
        md = render_spec(
            spec, titulo,
            front_matter={"title": titulo,
                          "source": "https://docs.whop.com/openapi/" + fname,
                          "generado_desde": "openapi/" + fname,
                          "capturado": FECHA},
            intro=intro, spec_link="./openapi/" + fname)
        open(os.path.join(OUT, docname), "w", encoding="utf-8").write(md)
        spec_stats.append((fname, docname, titulo, len(ops), len(spec.get("paths") or {})))
        print("  spec %-22s %3d operaciones -> %s" % (fname, len(ops), docname))

    # ---- 2. páginas de prosa --------------------------------------------
    BLOCK = re.compile(r"^````yaml (/?[\w./-]+)((?: +[^\n]*)?)\n[\s\S]*?^````$", re.M)
    PREAMBLE = re.compile(
        r"\A> ## Documentation Index\n> [^\n]*\n> [^\n]*\n\n", re.M)

    entries = []
    for fname in sorted(os.listdir(CACHE)):
        url = "https://" + fname[: -len(".md")].replace("__", "/")
        if url.endswith("/index"):
            url = url[: -len("/index")] or url
        rel = url.split("docs.whop.com/", 1)[1] if "docs.whop.com/" in url else "index"
        rel = (rel or "index") + ".md"
        text = open(os.path.join(CACHE, fname), encoding="utf-8", errors="replace").read()
        text = PREAMBLE.sub("", text)

        endpoints = []

        def repl(m):
            spec_ref = m.group(1).lstrip("/")
            rest = (m.group(2) or "").strip()
            bits = rest.split()
            if len(bits) >= 2:
                method, path = bits[0].upper(), bits[1]
                key = (os.path.basename(spec_ref), method, path)
                target = op_index.get(key)
                if target:
                    endpoints.append((method, path))
                    depth = rel.count("/")
                    up = "../" * depth or "./"
                    return ("_La definición de este endpoint está en el spec oficial._\n\n"
                            "> **`%s %s`** — ver [%s](%s%s#%s) · spec: [`openapi/%s`](%s openapi/%s)"
                            % (method, path, target[0], up, target[0], target[1],
                               os.path.basename(spec_ref), up, os.path.basename(spec_ref))
                            ).replace("(%s openapi/" % up, "(%sopenapi/" % up)
            return "_Bloque OpenAPI omitido — ver los specs en [`openapi/`](%sopenapi/)._" % (
                "../" * rel.count("/") or "./")

        text = BLOCK.sub(repl, text)

        title = ""
        m = re.search(r"^# (.+)$", text, re.M)
        if m:
            title = m.group(1).strip()
        desc = ""
        m = re.search(r"^> (.+)$", text, re.M)
        if m:
            desc = m.group(1).strip()

        fm = ["---", "title: " + yaml_str(title or rel),
              "source: " + yaml_str(url),
              "capturado: " + yaml_str(FECHA)]
        if endpoints:
            fm.append("metodo: " + yaml_str(endpoints[0][0]))
            fm.append("path: " + yaml_str(endpoints[0][1]))
        fm.append("---")
        dest = os.path.join(OUT, rel)
        os.makedirs(os.path.dirname(dest), exist_ok=True)
        open(dest, "w", encoding="utf-8").write("\n".join(fm) + "\n\n" + text.lstrip())
        entries.append({"url": url, "rel": rel, "title": title or rel,
                        "desc": desc, "endpoints": endpoints})

    json.dump(entries, open(os.path.join(SCRATCH, "whop-entries.json"), "w", encoding="utf-8"),
              indent=1, ensure_ascii=False)
    print("  paginas escritas:", len(entries))
    return entries, spec_stats


if __name__ == "__main__":
    main()
