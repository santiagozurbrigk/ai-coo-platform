# -*- coding: utf-8 -*-
"""WebinarJam / EverWebinar: los 17 artículos de la API del centro de ayuda (Intercom).

Los artículos se enlazan entre sí con URLs de la forma `/*/articles/<id>` (el `*` es un
placeholder de idioma que Intercom resuelve en el cliente). Acá se reescriben al slug
real, para que la copia local no quede con links muertos.
"""
import json
import os
import re
import sys

from bs4 import BeautifulSoup

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from convert import Renderer, clean, inline  # noqa: E402

SCRATCH = os.environ.get("WORK") or os.path.join(
    os.path.dirname(os.path.abspath(__file__)), ".work")
TOOLS = os.path.dirname(os.path.abspath(__file__))
CACHE = os.path.join(SCRATCH, "cache-wj")
OUT = sys.argv[1]
FECHA = sys.argv[2]

# Orden del artículo índice, que es como conviene leerlos.
ORDEN = [
    "15370142", "15370143", "15370144", "15370145",
    "15370149", "15370150", "15370151", "15370152", "15370153",
    "15370154", "15370155", "15370156", "15370157", "15370160",
    "15370147", "15370146", "15370148",
]
GRUPO = {
    "15370142": "Introducción", "15370143": "Introducción",
    "15370144": "Introducción", "15370145": "Introducción",
    "15370149": "API de WebinarJam", "15370150": "API de WebinarJam",
    "15370151": "API de WebinarJam", "15370152": "API de WebinarJam",
    "15370153": "API de WebinarJam",
    "15370154": "API de EverWebinar", "15370155": "API de EverWebinar",
    "15370156": "API de EverWebinar", "15370157": "API de EverWebinar",
    "15370160": "API de EverWebinar",
    "15370147": "Utilidades", "15370146": "Utilidades", "15370148": "Utilidades",
}


def yaml_str(s):
    return '"%s"' % str(s).replace("\\", "\\\\").replace('"', '\\"')


def main():
    urls = [l.strip() for l in open(os.path.join(TOOLS, "webinarjam-urls.txt")) if l.strip()]
    by_id = {}
    for u in urls:
        m = re.search(r"/articles/(\d+)-", u)
        if m:
            by_id[m.group(1)] = u

    os.makedirs(OUT, exist_ok=True)
    entries = []
    for aid in ORDEN:
        url = by_id.get(aid)
        if not url:
            print("  (falta el artículo %s en webinarjam-urls.txt)" % aid)
            continue
        cache_file = os.path.join(CACHE, url.split("://", 1)[1].replace("/", "__"))
        if not os.path.exists(cache_file):
            print("  (sin caché para %s)" % url)
            continue
        soup = BeautifulSoup(open(cache_file, encoding="utf-8", errors="replace"), "lxml")

        titulo = ""
        og = soup.find("meta", property="og:title")
        if og and og.get("content"):
            titulo = re.sub(r"\s*\|\s*WebinarJam Help Center\s*$", "", og["content"]).strip()
        if not titulo:
            h1 = soup.find("h1")
            titulo = clean(inline(h1)) if h1 else url.rsplit("/", 1)[-1]

        art = soup.find("article") or soup.find("main")
        r = Renderer()
        for ch in art.children:
            r.block(ch, 0, 2)
        md = r.text()

        # /*/articles/<id> -> slug real
        def fix(m):
            target = by_id.get(m.group(1))
            return target if target else m.group(0)
        md = re.sub(r"https://support\.webinarjam\.com/\*/articles/(\d+)", fix, md)

        slug = url.rsplit("/", 1)[-1]
        rel = "%s.md" % slug
        fm = ["---", "title: " + yaml_str(titulo),
              "source: " + yaml_str(url),
              "articulo_id: " + yaml_str(aid),
              "seccion: " + yaml_str(GRUPO.get(aid, "—")),
              "capturado: " + yaml_str(FECHA), "---"]
        open(os.path.join(OUT, rel), "w", encoding="utf-8").write(
            "\n".join(fm) + "\n\n# " + titulo + "\n\n" + md)
        entries.append({"id": aid, "rel": rel, "title": titulo,
                        "grupo": GRUPO.get(aid, "—"), "url": url})

    json.dump(entries, open(os.path.join(SCRATCH, "wj-entries.json"), "w", encoding="utf-8"),
              indent=1, ensure_ascii=False)
    print("  artículos escritos:", len(entries))
    return entries


if __name__ == "__main__":
    main()
