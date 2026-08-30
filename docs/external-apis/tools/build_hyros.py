# -*- coding: utf-8 -*-
"""Hyros: specs OpenAPI oficiales + las guías de docs.hyros.com.

docs.hyros.com es una SPA sin HTML servido, así que las guías se renderizan con
Chromium (`render.py`). La referencia de la API, en cambio, la publica Hyros como
specs OpenAPI 3.1 en api-docs.hyros.com/ai-context/, que es de donde sale la
referencia generada — no de las guías.
"""
import json
import os
import re
import shutil
import sys

import yaml
from bs4 import BeautifulSoup

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from convert import Renderer  # noqa: E402
from openapi_md import render_spec, operations  # noqa: E402

SCRATCH = os.environ.get("WORK") or os.path.join(
    os.path.dirname(os.path.abspath(__file__)), ".work")
CACHE = os.path.join(SCRATCH, "cache-hyros")
OUT = sys.argv[1]
FECHA = sys.argv[2]

SPECS = [
    ("rest-api", "ENDPOINTS-rest-api.md", "Hyros REST API — referencia de endpoints",
     "Leads, journeys, ventas, órdenes, llamadas, atribución de ads, productos, tags y fuentes."),
    ("webhooks", "ENDPOINTS-webhooks.md", "Hyros Webhooks — referencia",
     "Eventos salientes de Hyros hacia un endpoint propio."),
    ("mcp", "ENDPOINTS-mcp.md", "Hyros MCP Server — referencia",
     "El servidor MCP de Hyros, para consultar la cuenta desde un agente."),
]


def yaml_str(s):
    return '"%s"' % str(s).replace("\\", "\\\\").replace('"', '\\"')


def build_specs():
    os.makedirs(os.path.join(OUT, "openapi"), exist_ok=True)
    stats = []
    for name, doc, titulo, intro in SPECS:
        src = os.path.join(SCRATCH, "hyros-ai", "%s.txt" % name)
        dest_yaml = os.path.join(OUT, "openapi", "%s.yaml" % name)
        shutil.copy(src, dest_yaml)
        spec = yaml.safe_load(open(src, encoding="utf-8"))
        ops = operations(spec)
        md = render_spec(
            spec, titulo,
            front_matter={"title": titulo,
                          "source": "https://api-docs.hyros.com/ai-context/%s.txt" % name,
                          "generado_desde": "openapi/%s.yaml" % name,
                          "capturado": FECHA},
            intro=intro, spec_link="./openapi/%s.yaml" % name)
        open(os.path.join(OUT, doc), "w", encoding="utf-8").write(md)
        stats.append((name, doc, titulo, len(ops), (spec.get("info") or {}).get("version")))
        print("  spec %-10s v%-6s %3d operaciones -> %s"
              % (name, (spec.get("info") or {}).get("version"), len(ops), doc))

    # el blueprint viejo de Apiary: prosa que los specs no repiten
    ap = os.path.join(SCRATCH, "hyros-apiary.raw")
    if os.path.exists(ap):
        body = open(ap, encoding="utf-8", errors="replace").read()
        ver = ""
        m = re.search(r"^API_DOCS_VERSION:\s*(\S+)", body, re.M)
        if m:
            ver = m.group(1)
        fm = ["---", 'title: "Hyros API — documento de Apiary (legacy)"',
              'source: "https://hyros.docs.apiary.io/api-description-document"',
              "version: " + yaml_str(ver),
              "formato: \"API Blueprint\"",
              "capturado: " + yaml_str(FECHA), "---", "",
              "> Este es el documento **viejo** de Apiary (v%s), en formato API Blueprint." % ver,
              "> La referencia vigente es [`ENDPOINTS-rest-api.md`](./ENDPOINTS-rest-api.md),",
              "> generada desde el spec OpenAPI que Hyros publica hoy. Se conserva porque",
              "> trae prosa y ejemplos que el spec no repite, y porque es la URL a la que",
              "> apunta la propia documentación de Hyros desde `Docs → API Documentation`.", ""]
        open(os.path.join(OUT, "apiary-blueprint.md"), "w", encoding="utf-8").write(
            "\n".join(fm) + "\n" + body)
        print("  apiary blueprint v%s copiado" % ver)
    return stats


def _norm(text):
    """Clave de match: minúsculas, sin puntuación ni espacios de más."""
    return re.sub(r"[^a-z0-9]+", " ", str(text).lower()).strip()


def _page_title(soup):
    h1 = soup.find("main").find("h1") if soup.find("main") else None
    return h1.get_text(" ", strip=True) if h1 else ""


def _breadcrumbs(main):
    nav = main.find("nav")
    if not nav:
        return []
    crumbs = [a.get_text(" ", strip=True) for a in nav.find_all(["a", "span"])]
    out = []
    for c in crumbs:
        c = " ".join(c.split())
        if c and c != "HYROS Docs" and c not in out:
            out.append(c)
    return out


def build_guides():
    """Dos pasadas: primero el mapa título -> slug, después el render.

    Las tarjetas "View guide" que enlazan una guía con otra son botones con un
    handler de React: en el DOM no hay `href`. Se reconstruye el link haciendo
    match exacto del título de la tarjeta contra los títulos capturados; lo que no
    matchea queda como texto, sin link inventado.
    """
    files = sorted(f for f in os.listdir(CACHE) if f.endswith(".html"))
    soups = {}
    titulo_a_slug = {}
    for fname in files:
        url = "https://" + fname[: -len(".html")].replace("__", "/")
        soup = BeautifulSoup(open(os.path.join(CACHE, fname), encoding="utf-8",
                                  errors="replace"), "lxml")
        soups[fname] = (url, soup)
        t = _page_title(soup)
        slug = url.split("/docs/", 1)[1] if "/docs/" in url else url.rsplit("/", 1)[-1]
        if t:
            titulo_a_slug.setdefault(_norm(t), slug)
        # el título de la tarjeta a veces no es el h1 de destino, pero sí su slug
        titulo_a_slug.setdefault(_norm(slug.replace("-", " ")), slug)

    dest_root = os.path.join(OUT, "docs")
    os.makedirs(dest_root, exist_ok=True)
    entries = []
    enlazadas = huerfanas = 0
    for fname in files:
        url, soup = soups[fname]
        main = soup.find("main") or soup.find("body")
        crumbs = _breadcrumbs(main)
        slug = url.split("/docs/", 1)[1] if "/docs/" in url else url.rsplit("/", 1)[-1]
        profundidad = slug.count("/")

        # tarjetas -> lista de links
        for card in main.select("div.group.rounded-lg"):
            h = card.find(["h4", "h3"])
            if not h:
                continue
            titulo_card = h.get_text(" ", strip=True).strip()
            p_desc = h.find_parent().find_next_sibling("p") or card.find("p")
            desc = p_desc.get_text(" ", strip=True) if p_desc else ""
            destino = titulo_a_slug.get(_norm(titulo_card))
            nuevo = soup.new_tag("p")
            if destino and destino != slug:
                a = soup.new_tag("a", href="%s%s.md" % ("../" * profundidad or "./", destino))
                a.string = titulo_card
                nuevo.append(a)
                enlazadas += 1
            else:
                strong = soup.new_tag("strong")
                strong.string = titulo_card
                nuevo.append(strong)
                huerfanas += 1
            if desc:
                nuevo.append(" — " + desc)
            card.replace_with(nuevo)

        r = Renderer()
        for ch in main.children:
            r.block(ch, 0, 2)
        md = r.text()
        m = re.search(r"^# .+$", md, re.M)
        if m:
            titulo = md[m.start() + 2: md.find("\n", m.start())].strip()
            md = md[m.start():]
        else:
            titulo = crumbs[-1] if crumbs else slug.replace("-", " ").title()
            md = "# %s\n\n" % titulo + md

        seccion = " > ".join(crumbs[:-1]) if len(crumbs) > 1 else (crumbs[0] if crumbs else "General")
        fm = ["---", "title: " + yaml_str(titulo),
              "source: " + yaml_str(url),
              "seccion: " + yaml_str(seccion),
              "capturado: " + yaml_str(FECHA), "---"]
        dest = os.path.join(dest_root, "%s.md" % slug)
        os.makedirs(os.path.dirname(dest), exist_ok=True)
        open(dest, "w", encoding="utf-8").write("\n".join(fm) + "\n\n" + md)
        entries.append({"url": url, "rel": "docs/%s.md" % slug, "title": titulo,
                        "crumbs": crumbs or [seccion], "chars": len(md)})

    json.dump(entries, open(os.path.join(SCRATCH, "hyros-entries.json"), "w", encoding="utf-8"),
              indent=1, ensure_ascii=False)
    print("  guías escritas: %d · tarjetas enlazadas: %d · sin destino: %d"
          % (len(entries), enlazadas, huerfanas))
    return entries


if __name__ == "__main__":
    build_specs()
    build_guides()
